from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, date

# Import models and services
from models import (
    UserCreate, UserLogin, UserResponse, UserUpdate, TokenResponse,
    TransactionCreate, TransactionUpdate, Transaction,
    GoalCreate, GoalUpdate, Goal,
    TransactionSummary, CategoryBreakdown, TrendData, WeeklyChartData,
    BehaviorInsight, HabitScore, Challenge, Badge,
    TransactionType, MoodType, ChallengeStatus
)
from auth import (
    get_password_hash, verify_password, create_access_token, get_current_user_id
)
from behavior_service import BehaviorService
from insights_service import InsightsService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Finly API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user."""
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_data.password)
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.utcnow()
    user_dict["daily_budget"] = None
    user_dict["monthly_budget"] = None
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user_dict["id"]})
    
    # Return response
    user_response = UserResponse(
        id=user_dict["id"],
        name=user_dict["name"],
        email=user_dict["email"],
        currency=user_dict["currency"],
        currency_symbol=user_dict["currency_symbol"],
        created_at=user_dict["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user."""
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create token
    token = create_access_token({"sub": user["id"]})
    
    # Return response
    user_response = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        currency=user.get("currency", "INR"),
        currency_symbol=user.get("currency_symbol", "₹"),
        daily_budget=user.get("daily_budget"),
        monthly_budget=user.get("monthly_budget"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)


@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user."""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        currency=user.get("currency", "INR"),
        currency_symbol=user.get("currency_symbol", "₹"),
        daily_budget=user.get("daily_budget"),
        monthly_budget=user.get("monthly_budget"),
        created_at=user["created_at"]
    )


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@api_router.put("/users/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile."""
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_dict:
        await db.users.update_one(
            {"id": user_id},
            {"$set": update_dict}
        )
    
    user = await db.users.find_one({"id": user_id})
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        currency=user.get("currency", "INR"),
        currency_symbol=user.get("currency_symbol", "₹"),
        daily_budget=user.get("daily_budget"),
        monthly_budget=user.get("monthly_budget"),
        created_at=user["created_at"]
    )


# ============================================================================
# TRANSACTION ENDPOINTS
# ============================================================================

async def fetch_user_transactions(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[TransactionType] = None,
    limit: int = 1000,
    offset: int = 0
) -> List[Transaction]:
    """Utility function to fetch user transactions from database."""
    query = {"user_id": user_id}
    
    # Add filters
    if start_date or end_date:
        query["date"] = {}
        if start_date:
            query["date"]["$gte"] = start_date
        if end_date:
            query["date"]["$lte"] = end_date
    
    if category:
        query["category"] = category
    
    if type:
        query["type"] = type
    
    # Fetch transactions
    transactions = await db.transactions.find(query).sort("date", -1).skip(offset).limit(limit).to_list(limit)
    
    result = []
    for txn in transactions:
        result.append(Transaction(
            id=txn["id"],
            user_id=txn["user_id"],
            amount=txn["amount"],
            type=txn["type"],
            category=txn["category"],
            notes=txn.get("notes"),
            date=datetime.fromisoformat(txn["date"]).date() if isinstance(txn["date"], str) else txn["date"],
            mood=txn.get("mood"),
            created_at=txn["created_at"],
            updated_at=txn["updated_at"]
        ))
    
    return result


@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    user_id: str = Depends(get_current_user_id),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    type: Optional[TransactionType] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0)
):
    """Get user transactions with filters."""
    return await fetch_user_transactions(user_id, start_date, end_date, category, type, limit, offset)


@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(
    transaction_data: TransactionCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new transaction."""
    txn_dict = transaction_data.dict()
    txn_dict["id"] = str(uuid.uuid4())
    txn_dict["user_id"] = user_id
    txn_dict["created_at"] = datetime.utcnow()
    txn_dict["updated_at"] = datetime.utcnow()
    txn_dict["date"] = transaction_data.date.isoformat()
    
    await db.transactions.insert_one(txn_dict)
    
    return Transaction(
        id=txn_dict["id"],
        user_id=txn_dict["user_id"],
        amount=txn_dict["amount"],
        type=txn_dict["type"],
        category=txn_dict["category"],
        notes=txn_dict.get("notes"),
        date=transaction_data.date,
        mood=txn_dict.get("mood"),
        created_at=txn_dict["created_at"],
        updated_at=txn_dict["updated_at"]
    )


@api_router.put("/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    update_data: TransactionUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a transaction."""
    # Check if transaction exists and belongs to user
    txn = await db.transactions.find_one({"id": transaction_id, "user_id": user_id})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if update_dict:
        if "date" in update_dict:
            update_dict["date"] = update_dict["date"].isoformat()
        update_dict["updated_at"] = datetime.utcnow()
        
        await db.transactions.update_one(
            {"id": transaction_id},
            {"$set": update_dict}
        )
    
    # Fetch updated transaction
    txn = await db.transactions.find_one({"id": transaction_id})
    return Transaction(
        id=txn["id"],
        user_id=txn["user_id"],
        amount=txn["amount"],
        type=txn["type"],
        category=txn["category"],
        notes=txn.get("notes"),
        date=datetime.fromisoformat(txn["date"]).date() if isinstance(txn["date"], str) else txn["date"],
        mood=txn.get("mood"),
        created_at=txn["created_at"],
        updated_at=txn["updated_at"]
    )


@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a transaction."""
    result = await db.transactions.delete_one({"id": transaction_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {"message": "Transaction deleted"}


# ============================================================================
# GOAL ENDPOINTS
# ============================================================================

async def fetch_user_goals(user_id: str) -> List[Goal]:
    """Utility function to fetch user goals from database."""
    goals = await db.goals.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    
    result = []
    for goal in goals:
        result.append(Goal(
            id=goal["id"],
            user_id=goal["user_id"],
            emoji=goal["emoji"],
            name=goal["name"],
            target_amount=goal["target_amount"],
            saved_amount=goal["saved_amount"],
            deadline=datetime.fromisoformat(goal["deadline"]).date() if goal.get("deadline") else None,
            is_completed=goal.get("is_completed", False),
            created_at=goal["created_at"]
        ))
    
    return result


@api_router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = Depends(get_current_user_id)):
    """Get user goals."""
    return await fetch_user_goals(user_id)


@api_router.post("/goals", response_model=Goal)
async def create_goal(
    goal_data: GoalCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new goal."""
    goal_dict = goal_data.dict()
    goal_dict["id"] = str(uuid.uuid4())
    goal_dict["user_id"] = user_id
    goal_dict["is_completed"] = False
    goal_dict["created_at"] = datetime.utcnow()
    
    if goal_dict.get("deadline"):
        goal_dict["deadline"] = goal_data.deadline.isoformat()
    
    await db.goals.insert_one(goal_dict)
    
    return Goal(
        id=goal_dict["id"],
        user_id=goal_dict["user_id"],
        emoji=goal_dict["emoji"],
        name=goal_dict["name"],
        target_amount=goal_dict["target_amount"],
        saved_amount=goal_dict["saved_amount"],
        deadline=goal_data.deadline,
        is_completed=goal_dict["is_completed"],
        created_at=goal_dict["created_at"]
    )


@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: str,
    update_data: GoalUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a goal."""
    # Check if goal exists and belongs to user
    goal = await db.goals.find_one({"id": goal_id, "user_id": user_id})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if update_dict:
        if "deadline" in update_dict and update_dict["deadline"]:
            update_dict["deadline"] = update_dict["deadline"].isoformat()
        
        await db.goals.update_one(
            {"id": goal_id},
            {"$set": update_dict}
        )
    
    # Fetch updated goal
    goal = await db.goals.find_one({"id": goal_id})
    return Goal(
        id=goal["id"],
        user_id=goal["user_id"],
        emoji=goal["emoji"],
        name=goal["name"],
        target_amount=goal["target_amount"],
        saved_amount=goal["saved_amount"],
        deadline=datetime.fromisoformat(goal["deadline"]).date() if goal.get("deadline") else None,
        is_completed=goal.get("is_completed", False),
        created_at=goal["created_at"]
    )


@api_router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a goal."""
    result = await db.goals.delete_one({"id": goal_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {"message": "Goal deleted"}


# ============================================================================
# INSIGHTS ENDPOINTS
# ============================================================================

@api_router.get("/insights/summary", response_model=TransactionSummary)
async def get_summary(
    period: str = Query("month", regex="^(week|month|3months)$"),
    user_id: str = Depends(get_current_user_id)
):
    """Get transaction summary for a period."""
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    return InsightsService.calculate_summary(transactions, period)


@api_router.get("/insights/categories", response_model=List[CategoryBreakdown])
async def get_categories(
    period: str = Query("month", regex="^(week|month|3months)$"),
    user_id: str = Depends(get_current_user_id)
):
    """Get category breakdown."""
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    return InsightsService.get_category_breakdown(transactions, period)


@api_router.get("/insights/trend", response_model=List[TrendData])
async def get_trend(
    period: str = Query("month", regex="^(week|month|3months)$"),
    user_id: str = Depends(get_current_user_id)
):
    """Get trend data."""
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    return InsightsService.get_trend_data(transactions, period)


@api_router.get("/insights/weekly-chart", response_model=List[WeeklyChartData])
async def get_weekly_chart(user_id: str = Depends(get_current_user_id)):
    """Get weekly chart data (last 7 days)."""
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    return InsightsService.get_weekly_chart_data(transactions)


# ============================================================================
# BEHAVIOR ENDPOINTS
# ============================================================================

@api_router.get("/behavior/score", response_model=HabitScore)
async def get_habit_score(user_id: str = Depends(get_current_user_id)):
    """Get user's habit score."""
    # Fetch data
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    goals = await fetch_user_goals(user_id=user_id)
    user = await db.users.find_one({"id": user_id})
    
    return BehaviorService.calculate_habit_score(
        transactions,
        goals,
        user.get("monthly_budget")
    )


@api_router.get("/behavior/patterns", response_model=List[BehaviorInsight])
async def get_patterns(user_id: str = Depends(get_current_user_id)):
    """Get behavioral patterns."""
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    return BehaviorService.analyze_spending_patterns(transactions)


@api_router.get("/behavior/challenges", response_model=List[Challenge])
async def get_challenges(user_id: str = Depends(get_current_user_id)):
    """Get user challenges."""
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    return BehaviorService.generate_challenges(transactions)


@api_router.get("/behavior/badges", response_model=List[Badge])
async def get_badges(user_id: str = Depends(get_current_user_id)):
    """Get user badges."""
    # Get user data
    transactions = await fetch_user_transactions(user_id=user_id, limit=1000, offset=0)
    goals = await fetch_user_goals(user_id=user_id)
    habit_score = await get_habit_score(user_id=user_id)
    
    # Define all badges
    badges = [
        Badge(
            id="first_step",
            name="First Step",
            emoji="🌱",
            description="Added your first transaction",
            is_unlocked=len(transactions) > 0,
            unlocked_at=transactions[0].created_at if len(transactions) > 0 else None
        ),
        Badge(
            id="week_warrior",
            name="Week Warrior",
            emoji="📅",
            description="7-day tracking streak",
            is_unlocked=habit_score.streak >= 7,
            unlocked_at=datetime.utcnow() if habit_score.streak >= 7 else None
        ),
        Badge(
            id="goal_setter",
            name="Goal Setter",
            emoji="🎯",
            description="Created your first goal",
            is_unlocked=len(goals) > 0,
            unlocked_at=goals[0].created_at if len(goals) > 0 else None
        ),
        Badge(
            id="saver",
            name="Saver",
            emoji="💰",
            description="Saved for 30 days",
            is_unlocked=habit_score.streak >= 30,
            unlocked_at=datetime.utcnow() if habit_score.streak >= 30 else None
        ),
        Badge(
            id="budget_boss",
            name="Budget Boss",
            emoji="🧠",
            description="Stayed under budget for a week",
            is_unlocked=habit_score.budget_adherence >= 20,
            unlocked_at=datetime.utcnow() if habit_score.budget_adherence >= 20 else None
        ),
        Badge(
            id="centurion",
            name="Centurion",
            emoji="🏆",
            description="100 transactions tracked",
            is_unlocked=len(transactions) >= 100,
            unlocked_at=datetime.utcnow() if len(transactions) >= 100 else None
        ),
        Badge(
            id="streak_master",
            name="Streak Master",
            emoji="⚡",
            description="21 day tracking streak",
            is_unlocked=habit_score.streak >= 21,
            unlocked_at=datetime.utcnow() if habit_score.streak >= 21 else None
        ),
        Badge(
            id="transformation",
            name="Transformation",
            emoji="🦋",
            description="Improved habit score by 20 points",
            is_unlocked=habit_score.total >= 80,
            unlocked_at=datetime.utcnow() if habit_score.total >= 80 else None
        )
    ]
    
    return badges


@api_router.get("/behavior/future-impact")
async def calculate_future_impact(
    category: str,
    reduction_percent: float,
    user_id: str = Depends(get_current_user_id)
):
    """Calculate future impact of reducing spending."""
    # Get current month's spending for category
    transactions = await fetch_user_transactions(user_id=user_id, category=category, limit=1000, offset=0)
    
    # Filter to current month
    today = date.today()
    first_day = date(today.year, today.month, 1)
    current_month_txns = [t for t in transactions if t.date >= first_day and t.type == "expense"]
    
    current_monthly_spend = sum(t.amount for t in current_month_txns)
    
    return BehaviorService.calculate_future_impact(
        category,
        reduction_percent,
        current_monthly_spend
    )


# ============================================================================
# ROOT & HEALTH CHECK
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "Finly API v1.0.0", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}


# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
