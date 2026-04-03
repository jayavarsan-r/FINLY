from typing import List, Dict
from datetime import datetime, timedelta, date
from collections import defaultdict
from models import Transaction, TransactionSummary, CategoryBreakdown, TrendData, WeeklyChartData

class InsightsService:
    """Service for generating insights from transaction data."""
    
    @staticmethod
    def get_date_range(period: str) -> tuple:
        """Get start and end dates for a period."""
        today = date.today()
        
        if period == "week":
            start_date = today - timedelta(days=7)
        elif period == "month":
            start_date = today - timedelta(days=30)
        elif period == "3months":
            start_date = today - timedelta(days=90)
        else:
            start_date = today - timedelta(days=30)
        
        return start_date, today
    
    @staticmethod
    def calculate_summary(transactions: List[Transaction], period: str = "month") -> TransactionSummary:
        """Calculate transaction summary for a period."""
        start_date, end_date = InsightsService.get_date_range(period)
        
        # Filter transactions for current period
        current_txns = [
            t for t in transactions 
            if start_date <= t.date <= end_date
        ]
        
        # Calculate totals
        total_income = sum(t.amount for t in current_txns if t.type == "income")
        total_expenses = sum(t.amount for t in current_txns if t.type == "expense")
        balance = total_income - total_expenses
        transaction_count = len(current_txns)
        
        # Calculate savings rate
        savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
        
        return TransactionSummary(
            total_income=round(total_income, 2),
            total_expenses=round(total_expenses, 2),
            balance=round(balance, 2),
            transaction_count=transaction_count,
            savings_rate=round(savings_rate, 2)
        )
    
    @staticmethod
    def get_category_breakdown(transactions: List[Transaction], period: str = "month") -> List[CategoryBreakdown]:
        """Get spending breakdown by category."""
        start_date, end_date = InsightsService.get_date_range(period)
        
        # Filter expenses for the period
        expenses = [
            t for t in transactions 
            if t.type == "expense" and start_date <= t.date <= end_date
        ]
        
        if not expenses:
            return []
        
        # Group by category
        category_data = defaultdict(lambda: {"amount": 0, "count": 0})
        total_expenses = 0
        
        for txn in expenses:
            category_data[txn.category]["amount"] += txn.amount
            category_data[txn.category]["count"] += 1
            total_expenses += txn.amount
        
        # Create breakdown list
        breakdown = []
        for category, data in category_data.items():
            percentage = (data["amount"] / total_expenses * 100) if total_expenses > 0 else 0
            breakdown.append(CategoryBreakdown(
                category=category,
                amount=round(data["amount"], 2),
                percentage=round(percentage, 2),
                transaction_count=data["count"]
            ))
        
        # Sort by amount descending
        breakdown.sort(key=lambda x: x.amount, reverse=True)
        
        return breakdown
    
    @staticmethod
    def get_trend_data(transactions: List[Transaction], period: str = "month") -> List[TrendData]:
        """Get daily trend data for income and expenses."""
        start_date, end_date = InsightsService.get_date_range(period)
        
        # Filter transactions for the period
        period_txns = [
            t for t in transactions 
            if start_date <= t.date <= end_date
        ]
        
        # Group by date
        daily_data = defaultdict(lambda: {"income": 0, "expenses": 0})
        
        for txn in period_txns:
            date_str = txn.date.isoformat()
            if txn.type == "income":
                daily_data[date_str]["income"] += txn.amount
            else:
                daily_data[date_str]["expenses"] += txn.amount
        
        # Create trend data
        trend = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            trend.append(TrendData(
                date=date_str,
                income=round(daily_data[date_str]["income"], 2),
                expenses=round(daily_data[date_str]["expenses"], 2)
            ))
            current_date += timedelta(days=1)
        
        return trend
    
    @staticmethod
    def get_weekly_chart_data(transactions: List[Transaction]) -> List[WeeklyChartData]:
        """Get data for the last 7 days (Mon-Sun)."""
        today = date.today()
        
        # Get the last 7 days
        days_data = []
        for i in range(6, -1, -1):
            day_date = today - timedelta(days=i)
            day_name = day_date.strftime("%a")  # Mon, Tue, etc.
            
            # Get transactions for this day
            day_txns = [t for t in transactions if t.date == day_date]
            
            income = sum(t.amount for t in day_txns if t.type == "income")
            expenses = sum(t.amount for t in day_txns if t.type == "expense")
            
            days_data.append(WeeklyChartData(
                day=day_name,
                income=round(income, 2),
                expenses=round(expenses, 2)
            ))
        
        return days_data
