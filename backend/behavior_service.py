from typing import List, Dict
from datetime import datetime, timedelta, date
from collections import defaultdict
from models import Transaction, Goal, BehaviorInsight, HabitScore, Challenge, ChallengeStatus, InsightImpact
import uuid

class BehaviorService:
    """Service for analyzing user behavior and calculating habit scores."""
    
    @staticmethod
    def analyze_spending_patterns(transactions: List[Transaction]) -> List[BehaviorInsight]:
        """Analyze transactions and generate behavioral insights."""
        insights = []
        
        if not transactions:
            return insights
        
        # Filter only expenses
        expenses = [t for t in transactions if t.type == "expense"]
        if not expenses:
            return insights
        
        # Day of week analysis
        day_spending = defaultdict(list)
        for txn in expenses:
            day_name = txn.date.strftime("%A")
            day_spending[day_name].append(txn.amount)
        
        if day_spending:
            day_averages = {day: sum(amounts) / len(amounts) for day, amounts in day_spending.items()}
            overall_avg = sum(day_averages.values()) / len(day_averages)
            
            for day, avg in day_averages.items():
                if avg > overall_avg * 1.5:
                    percentage = int(((avg - overall_avg) / overall_avg) * 100)
                    insights.append(BehaviorInsight(
                        type="day_pattern",
                        title=f"Weekend Spending Alert",
                        detail=f"You spend {percentage}% more on {day}s",
                        impact=InsightImpact.HIGH,
                        category=None
                    ))
        
        # Time of day analysis
        hour_counts = defaultdict(int)
        for txn in expenses:
            # We don't have time data, so we'll skip this for now
            pass
        
        # Category spending spikes
        category_spending = defaultdict(float)
        for txn in expenses:
            category_spending[txn.category] += txn.amount
        
        if category_spending:
            sorted_categories = sorted(category_spending.items(), key=lambda x: x[1], reverse=True)
            if sorted_categories:
                top_category, top_amount = sorted_categories[0]
                total_spending = sum(category_spending.values())
                percentage = int((top_amount / total_spending) * 100)
                
                insights.append(BehaviorInsight(
                    type="category_top",
                    title=f"Top Spending Category",
                    detail=f"{top_category} is your top category at {percentage}% of expenses",
                    impact=InsightImpact.MEDIUM,
                    category=top_category
                ))
        
        # Small transaction detection
        small_transactions = [t for t in expenses if t.amount < 100]
        if len(small_transactions) > 10:
            insights.append(BehaviorInsight(
                type="small_purchases",
                title="Many Small Purchases",
                detail=f"You made {len(small_transactions)} transactions under ₹100",
                impact=InsightImpact.LOW,
                category=None
            ))
        
        # Mood-based spending (if mood data exists)
        mood_spending = defaultdict(list)
        for txn in expenses:
            if txn.mood:
                mood_spending[txn.mood].append(txn.amount)
        
        if mood_spending:
            for mood, amounts in mood_spending.items():
                if len(amounts) > 3:
                    avg_amount = sum(amounts) / len(amounts)
                    insights.append(BehaviorInsight(
                        type="mood_pattern",
                        title="Emotional Spending Pattern",
                        detail=f"Average spending when {mood}: ₹{int(avg_amount)}",
                        impact=InsightImpact.MEDIUM,
                        category=None
                    ))
        
        return insights
    
    @staticmethod
    def calculate_habit_score(
        transactions: List[Transaction],
        goals: List[Goal],
        user_budget: float = None
    ) -> HabitScore:
        """Calculate the user's habit score (0-100)."""
        
        # Initialize scores
        budget_adherence = 0
        tracking_consistency = 0
        savings_progress = 0
        spending_control = 0
        
        # Calculate tracking consistency (last 14 days)
        if transactions:
            today = date.today()
            last_14_days = [today - timedelta(days=i) for i in range(14)]
            days_tracked = set()
            
            for txn in transactions:
                if txn.date in last_14_days:
                    days_tracked.add(txn.date)
            
            tracking_consistency = int((len(days_tracked) / 14) * 25)
        
        # Calculate budget adherence
        if user_budget and transactions:
            # Get current month's expenses
            today = date.today()
            first_day = date(today.year, today.month, 1)
            current_month_expenses = [
                t for t in transactions 
                if t.type == "expense" and t.date >= first_day
            ]
            
            total_expenses = sum(t.amount for t in current_month_expenses)
            days_in_month = (date(today.year, today.month + 1, 1) - timedelta(days=1)).day if today.month < 12 else 31
            expected_budget = user_budget * today.day / days_in_month
            
            if total_expenses <= expected_budget:
                budget_adherence = 25
            else:
                ratio = expected_budget / total_expenses if total_expenses > 0 else 1
                budget_adherence = int(ratio * 25)
        else:
            budget_adherence = 12  # Neutral score
        
        # Calculate savings progress
        if goals:
            active_goals = [g for g in goals if not g.is_completed]
            if active_goals:
                progress_sum = sum(
                    (g.saved_amount / g.target_amount * 100) if g.target_amount > 0 else 0
                    for g in active_goals
                )
                avg_progress = progress_sum / len(active_goals)
                savings_progress = int((avg_progress / 100) * 25)
            else:
                # Check if all goals are completed
                if all(g.is_completed for g in goals):
                    savings_progress = 25  # Perfect score for completing all goals
                else:
                    savings_progress = 12
        else:
            savings_progress = 12  # Neutral score
        
        # Calculate spending control
        if transactions:
            income_txns = [t for t in transactions if t.type == "income"]
            expense_txns = [t for t in transactions if t.type == "expense"]
            
            total_income = sum(t.amount for t in income_txns)
            total_expenses = sum(t.amount for t in expense_txns)
            
            if total_income > 0:
                expense_ratio = total_expenses / total_income
                if expense_ratio >= 1.0:
                    spending_control = 0
                elif expense_ratio < 0.5:
                    spending_control = 25
                else:
                    # Linear interpolation between 0.5 and 1.0
                    spending_control = int((1.0 - expense_ratio) * 50)
            else:
                spending_control = 12
        else:
            spending_control = 12
        
        # Calculate streak
        streak = BehaviorService.calculate_streak(transactions)
        
        # Calculate total
        total = budget_adherence + tracking_consistency + savings_progress + spending_control
        
        return HabitScore(
            total=total,
            budget_adherence=budget_adherence,
            tracking_consistency=tracking_consistency,
            savings_progress=savings_progress,
            spending_control=spending_control,
            streak=streak,
            weekly_change=0  # TODO: Calculate based on previous week's score
        )
    
    @staticmethod
    def calculate_streak(transactions: List[Transaction]) -> int:
        """Calculate consecutive days with at least one transaction."""
        if not transactions:
            return 0
        
        # Get unique dates sorted in descending order
        unique_dates = sorted(set(t.date for t in transactions), reverse=True)
        
        if not unique_dates:
            return 0
        
        # Check if today or yesterday has a transaction
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        if unique_dates[0] not in [today, yesterday]:
            return 0
        
        # Count consecutive days
        streak = 1
        for i in range(len(unique_dates) - 1):
            diff = (unique_dates[i] - unique_dates[i + 1]).days
            if diff == 1:
                streak += 1
            else:
                break
        
        return streak
    
    @staticmethod
    def generate_challenges(transactions: List[Transaction]) -> List[Challenge]:
        """Generate challenges based on user's spending patterns."""
        challenges = []
        
        if not transactions:
            # Default challenges
            challenges.append(Challenge(
                id=str(uuid.uuid4()),
                title="Track Daily",
                description="Log at least one transaction every day this week",
                target_days=7,
                completed_days=0,
                reward_points=10,
                status=ChallengeStatus.ACTIVE
            ))
            return challenges
        
        # Analyze top spending categories
        category_spending = defaultdict(float)
        for txn in transactions:
            if txn.type == "expense":
                category_spending[txn.category] += txn.amount
        
        if category_spending:
            sorted_categories = sorted(category_spending.items(), key=lambda x: x[1], reverse=True)
            top_category = sorted_categories[0][0]
            
            # Challenge based on top category
            challenge_titles = {
                "Food": "No food delivery for 3 days",
                "Shopping": "No online shopping this week",
                "Entertainment": "Skip paid entertainment for 3 days",
                "Transport": "Use public transport for 3 days"
            }
            
            title = challenge_titles.get(top_category, f"Reduce {top_category} spending")
            
            challenges.append(Challenge(
                id=str(uuid.uuid4()),
                title=title,
                description=f"Challenge yourself to reduce {top_category} expenses",
                target_days=3,
                completed_days=0,
                reward_points=15,
                status=ChallengeStatus.ACTIVE
            ))
        
        # Tracking consistency challenge
        challenges.append(Challenge(
            id=str(uuid.uuid4()),
            title="Weekly Tracker",
            description="Log transactions every day this week",
            target_days=7,
            completed_days=BehaviorService.calculate_streak(transactions),
            reward_points=10,
            status=ChallengeStatus.ACTIVE
        ))
        
        # Budget challenge
        challenges.append(Challenge(
            id=str(uuid.uuid4()),
            title="Budget Master",
            description="Stay under daily budget for 5 days",
            target_days=5,
            completed_days=0,
            reward_points=20,
            status=ChallengeStatus.ACTIVE
        ))
        
        return challenges[:3]  # Return top 3 challenges
    
    @staticmethod
    def calculate_future_impact(
        category: str,
        reduction_percent: float,
        current_monthly_spend: float
    ) -> Dict:
        """Calculate future savings impact."""
        monthly_saving = current_monthly_spend * (reduction_percent / 100)
        yearly_saving = monthly_saving * 12
        
        # Fun equivalents
        if yearly_saving < 5000:
            equivalent = "a nice dinner out 🍽️"
        elif yearly_saving < 15000:
            equivalent = "a weekend trip 🏖️"
        elif yearly_saving < 50000:
            equivalent = "a month of premium subscriptions 📺"
        elif yearly_saving < 100000:
            equivalent = "a trip to Goa ✈️"
        elif yearly_saving < 300000:
            equivalent = "a new smartphone 📱"
        else:
            equivalent = "a Europe vacation ✈️"
        
        return {
            "monthly_saving": round(monthly_saving, 2),
            "yearly_saving": round(yearly_saving, 2),
            "equivalent": equivalent
        }
