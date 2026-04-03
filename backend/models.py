from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from datetime import datetime, date
from enum import Enum

# Enums
class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class MoodType(str, Enum):
    GREAT = "great"
    GOOD = "good"
    NEUTRAL = "neutral"
    SAD = "sad"
    STRESSED = "stressed"

class ChallengeStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"

class InsightImpact(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    POSITIVE = "positive"

# User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    currency: str = "INR"
    currency_symbol: str = "₹"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    currency: str
    currency_symbol: str
    daily_budget: Optional[float] = None
    monthly_budget: Optional[float] = None
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    currency_symbol: Optional[str] = None
    daily_budget: Optional[float] = None
    monthly_budget: Optional[float] = None

# Transaction Models
class TransactionCreate(BaseModel):
    amount: float
    type: TransactionType
    category: str
    notes: Optional[str] = None
    date: date
    mood: Optional[MoodType] = None

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[date] = None
    mood: Optional[MoodType] = None

class Transaction(BaseModel):
    id: str
    user_id: str
    amount: float
    type: TransactionType
    category: str
    notes: Optional[str] = None
    date: date
    mood: Optional[MoodType] = None
    created_at: datetime
    updated_at: datetime

# Goal Models
class GoalCreate(BaseModel):
    emoji: str
    name: str
    target_amount: float
    saved_amount: float = 0
    deadline: Optional[date] = None

class GoalUpdate(BaseModel):
    emoji: Optional[str] = None
    name: Optional[str] = None
    target_amount: Optional[float] = None
    saved_amount: Optional[float] = None
    deadline: Optional[date] = None
    is_completed: Optional[bool] = None

class Goal(BaseModel):
    id: str
    user_id: str
    emoji: str
    name: str
    target_amount: float
    saved_amount: float
    deadline: Optional[date] = None
    is_completed: bool = False
    created_at: datetime

# Insight Models
class TransactionSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int
    savings_rate: float

class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int

class TrendData(BaseModel):
    date: str
    income: float
    expenses: float

class WeeklyChartData(BaseModel):
    day: str
    income: float
    expenses: float

class BehaviorInsight(BaseModel):
    type: str
    title: str
    detail: str
    impact: InsightImpact
    category: Optional[str] = None

# Habit Score Models
class HabitScore(BaseModel):
    total: int
    budget_adherence: int
    tracking_consistency: int
    savings_progress: int
    spending_control: int
    streak: int
    weekly_change: int

# Challenge Models
class Challenge(BaseModel):
    id: str
    title: str
    description: str
    target_days: int
    completed_days: int
    reward_points: int
    status: ChallengeStatus

# Badge Models
class Badge(BaseModel):
    id: str
    name: str
    emoji: str
    description: str
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None

# Auth Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
