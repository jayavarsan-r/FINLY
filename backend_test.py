#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Finly App
Tests all authentication, transaction, goal, insights, and behavior APIs
"""

import requests
import json
import sys
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://finly-track.preview.emergentagent.com/api"
TEST_EMAIL = "test@finly.com"
TEST_PASSWORD = "Test123!"

class FinlyAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_id = None
        self.test_results = {
            "passed": [],
            "failed": [],
            "errors": []
        }
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        if success:
            self.test_results["passed"].append(f"✅ {test_name}: {details}")
            print(f"✅ {test_name}: {details}")
        else:
            self.test_results["failed"].append(f"❌ {test_name}: {details}")
            print(f"❌ {test_name}: {details}")
    
    def log_error(self, test_name: str, error: str):
        """Log test error"""
        self.test_results["errors"].append(f"🔥 {test_name}: {error}")
        print(f"🔥 {test_name}: {error}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response.status_code, response.json() if response.content else {}
        except requests.exceptions.RequestException as e:
            return 0, {"error": str(e)}
        except json.JSONDecodeError:
            return response.status_code, {"error": "Invalid JSON response"}
    
    def test_auth_register(self):
        """Test user registration"""
        print("\n🔐 Testing Authentication - Register")
        
        # First try to register a new user
        register_data = {
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "currency": "INR",
            "currency_symbol": "₹"
        }
        
        status, response = self.make_request("POST", "/auth/register", register_data)
        
        if status == 201 or status == 200:
            if "access_token" in response and "user" in response:
                self.token = response["access_token"]
                self.user_id = response["user"]["id"]
                self.log_result("Auth Register", True, f"User registered successfully, token received")
                return True
            else:
                self.log_result("Auth Register", False, "Missing token or user in response")
                return False
        elif status == 400 and "already registered" in response.get("detail", ""):
            # User already exists, try login instead
            self.log_result("Auth Register", True, "User already exists (expected)")
            return self.test_auth_login()
        else:
            self.log_result("Auth Register", False, f"Status {status}: {response}")
            return False
    
    def test_auth_login(self):
        """Test user login"""
        print("\n🔐 Testing Authentication - Login")
        
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        status, response = self.make_request("POST", "/auth/login", login_data)
        
        if status == 200:
            if "access_token" in response and "user" in response:
                self.token = response["access_token"]
                self.user_id = response["user"]["id"]
                self.log_result("Auth Login", True, f"Login successful, token received")
                return True
            else:
                self.log_result("Auth Login", False, "Missing token or user in response")
                return False
        else:
            self.log_result("Auth Login", False, f"Status {status}: {response}")
            return False
    
    def test_auth_me(self):
        """Test get current user"""
        print("\n🔐 Testing Authentication - Get Current User")
        
        if not self.token:
            self.log_result("Auth Me", False, "No token available")
            return False
        
        status, response = self.make_request("GET", "/auth/me")
        
        if status == 200:
            if "id" in response and "email" in response:
                self.log_result("Auth Me", True, f"User data retrieved: {response['email']}")
                return True
            else:
                self.log_result("Auth Me", False, "Missing user data in response")
                return False
        else:
            self.log_result("Auth Me", False, f"Status {status}: {response}")
            return False
    
    def test_transactions_crud(self):
        """Test transaction CRUD operations"""
        print("\n💰 Testing Transaction APIs")
        
        if not self.token:
            self.log_result("Transactions", False, "No authentication token")
            return False
        
        # Test data for transactions
        sample_transactions = [
            {
                "amount": 500.0,
                "type": "expense",
                "category": "Food",
                "notes": "Lunch at restaurant",
                "date": date.today().isoformat(),
                "mood": "good"
            },
            {
                "amount": 1200.0,
                "type": "expense", 
                "category": "Shopping",
                "notes": "Grocery shopping",
                "date": (date.today() - timedelta(days=1)).isoformat(),
                "mood": "neutral"
            },
            {
                "amount": 50000.0,
                "type": "income",
                "category": "Salary",
                "notes": "Monthly salary",
                "date": (date.today() - timedelta(days=2)).isoformat(),
                "mood": "great"
            },
            {
                "amount": 800.0,
                "type": "expense",
                "category": "Transport",
                "notes": "Uber rides",
                "date": (date.today() - timedelta(days=3)).isoformat(),
                "mood": "neutral"
            },
            {
                "amount": 2500.0,
                "type": "expense",
                "category": "Entertainment",
                "notes": "Movie and dinner",
                "date": (date.today() - timedelta(days=4)).isoformat(),
                "mood": "great"
            }
        ]
        
        created_transaction_ids = []
        
        # Test CREATE transactions
        for i, txn_data in enumerate(sample_transactions):
            status, response = self.make_request("POST", "/transactions", txn_data)
            
            if status == 200 or status == 201:
                if "id" in response:
                    created_transaction_ids.append(response["id"])
                    self.log_result(f"Create Transaction {i+1}", True, f"Created {txn_data['category']} transaction")
                else:
                    self.log_result(f"Create Transaction {i+1}", False, "Missing ID in response")
            else:
                self.log_result(f"Create Transaction {i+1}", False, f"Status {status}: {response}")
        
        # Test GET all transactions
        status, response = self.make_request("GET", "/transactions")
        
        if status == 200:
            if isinstance(response, list):
                self.log_result("Get All Transactions", True, f"Retrieved {len(response)} transactions")
            else:
                self.log_result("Get All Transactions", False, "Response is not a list")
        else:
            self.log_result("Get All Transactions", False, f"Status {status}: {response}")
        
        # Test GET with category filter
        status, response = self.make_request("GET", "/transactions", params={"category": "Food"})
        
        if status == 200:
            food_txns = [t for t in response if t.get("category") == "Food"]
            self.log_result("Get Transactions by Category", True, f"Found {len(food_txns)} Food transactions")
        else:
            self.log_result("Get Transactions by Category", False, f"Status {status}: {response}")
        
        # Test GET with type filter
        status, response = self.make_request("GET", "/transactions", params={"type": "expense"})
        
        if status == 200:
            expense_txns = [t for t in response if t.get("type") == "expense"]
            self.log_result("Get Transactions by Type", True, f"Found {len(expense_txns)} expense transactions")
        else:
            self.log_result("Get Transactions by Type", False, f"Status {status}: {response}")
        
        # Test UPDATE transaction (if we have any created)
        if created_transaction_ids:
            update_data = {
                "amount": 600.0,
                "notes": "Updated lunch expense"
            }
            
            txn_id = created_transaction_ids[0]
            status, response = self.make_request("PUT", f"/transactions/{txn_id}", update_data)
            
            if status == 200:
                if response.get("amount") == 600.0:
                    self.log_result("Update Transaction", True, "Transaction updated successfully")
                else:
                    self.log_result("Update Transaction", False, "Amount not updated correctly")
            else:
                self.log_result("Update Transaction", False, f"Status {status}: {response}")
        
        # Test DELETE transaction (if we have any created)
        if created_transaction_ids and len(created_transaction_ids) > 1:
            txn_id = created_transaction_ids[-1]  # Delete the last one
            status, response = self.make_request("DELETE", f"/transactions/{txn_id}")
            
            if status == 200:
                self.log_result("Delete Transaction", True, "Transaction deleted successfully")
            else:
                self.log_result("Delete Transaction", False, f"Status {status}: {response}")
        
        return len(created_transaction_ids) > 0
    
    def test_goals_crud(self):
        """Test goal CRUD operations"""
        print("\n🎯 Testing Goal APIs")
        
        if not self.token:
            self.log_result("Goals", False, "No authentication token")
            return False
        
        # Test data for goals
        sample_goals = [
            {
                "emoji": "🏠",
                "name": "Emergency Fund",
                "target_amount": 100000.0,
                "saved_amount": 25000.0,
                "deadline": (date.today() + timedelta(days=365)).isoformat()
            },
            {
                "emoji": "🚗",
                "name": "New Car",
                "target_amount": 500000.0,
                "saved_amount": 50000.0,
                "deadline": (date.today() + timedelta(days=730)).isoformat()
            },
            {
                "emoji": "✈️",
                "name": "Europe Trip",
                "target_amount": 150000.0,
                "saved_amount": 30000.0,
                "deadline": (date.today() + timedelta(days=180)).isoformat()
            }
        ]
        
        created_goal_ids = []
        
        # Test CREATE goals
        for i, goal_data in enumerate(sample_goals):
            status, response = self.make_request("POST", "/goals", goal_data)
            
            if status == 200 or status == 201:
                if "id" in response:
                    created_goal_ids.append(response["id"])
                    self.log_result(f"Create Goal {i+1}", True, f"Created {goal_data['name']} goal")
                else:
                    self.log_result(f"Create Goal {i+1}", False, "Missing ID in response")
            else:
                self.log_result(f"Create Goal {i+1}", False, f"Status {status}: {response}")
        
        # Test GET all goals
        status, response = self.make_request("GET", "/goals")
        
        if status == 200:
            if isinstance(response, list):
                self.log_result("Get All Goals", True, f"Retrieved {len(response)} goals")
            else:
                self.log_result("Get All Goals", False, "Response is not a list")
        else:
            self.log_result("Get All Goals", False, f"Status {status}: {response}")
        
        # Test UPDATE goal (if we have any created)
        if created_goal_ids:
            update_data = {
                "saved_amount": 35000.0
            }
            
            goal_id = created_goal_ids[0]
            status, response = self.make_request("PUT", f"/goals/{goal_id}", update_data)
            
            if status == 200:
                if response.get("saved_amount") == 35000.0:
                    self.log_result("Update Goal", True, "Goal updated successfully")
                else:
                    self.log_result("Update Goal", False, "Saved amount not updated correctly")
            else:
                self.log_result("Update Goal", False, f"Status {status}: {response}")
        
        # Test DELETE goal (if we have any created)
        if created_goal_ids and len(created_goal_ids) > 1:
            goal_id = created_goal_ids[-1]  # Delete the last one
            status, response = self.make_request("DELETE", f"/goals/{goal_id}")
            
            if status == 200:
                self.log_result("Delete Goal", True, "Goal deleted successfully")
            else:
                self.log_result("Delete Goal", False, f"Status {status}: {response}")
        
        return len(created_goal_ids) > 0
    
    def test_insights_apis(self):
        """Test insights APIs"""
        print("\n📊 Testing Insights APIs")
        
        if not self.token:
            self.log_result("Insights", False, "No authentication token")
            return False
        
        # Test summary endpoint with different periods
        periods = ["week", "month"]
        
        for period in periods:
            status, response = self.make_request("GET", "/insights/summary", params={"period": period})
            
            if status == 200:
                required_fields = ["total_income", "total_expenses", "balance", "transaction_count", "savings_rate"]
                if all(field in response for field in required_fields):
                    self.log_result(f"Insights Summary ({period})", True, 
                                  f"Income: ₹{response['total_income']}, Expenses: ₹{response['total_expenses']}")
                else:
                    self.log_result(f"Insights Summary ({period})", False, "Missing required fields")
            else:
                self.log_result(f"Insights Summary ({period})", False, f"Status {status}: {response}")
        
        # Test category breakdown
        status, response = self.make_request("GET", "/insights/categories", params={"period": "month"})
        
        if status == 200:
            if isinstance(response, list):
                total_percentage = sum(item.get("percentage", 0) for item in response)
                self.log_result("Insights Categories", True, 
                              f"Found {len(response)} categories, total: {total_percentage:.1f}%")
            else:
                self.log_result("Insights Categories", False, "Response is not a list")
        else:
            self.log_result("Insights Categories", False, f"Status {status}: {response}")
        
        # Test trend data
        status, response = self.make_request("GET", "/insights/trend", params={"period": "week"})
        
        if status == 200:
            if isinstance(response, list):
                self.log_result("Insights Trend", True, f"Retrieved {len(response)} trend data points")
            else:
                self.log_result("Insights Trend", False, "Response is not a list")
        else:
            self.log_result("Insights Trend", False, f"Status {status}: {response}")
        
        # Test weekly chart
        status, response = self.make_request("GET", "/insights/weekly-chart")
        
        if status == 200:
            if isinstance(response, list) and len(response) == 7:
                self.log_result("Insights Weekly Chart", True, "Retrieved 7 days of chart data")
            else:
                self.log_result("Insights Weekly Chart", False, f"Expected 7 days, got {len(response) if isinstance(response, list) else 'non-list'}")
        else:
            self.log_result("Insights Weekly Chart", False, f"Status {status}: {response}")
        
        return True
    
    def test_behavior_apis(self):
        """Test behavior analysis APIs"""
        print("\n🧠 Testing Behavior APIs")
        
        if not self.token:
            self.log_result("Behavior", False, "No authentication token")
            return False
        
        # Test habit score
        status, response = self.make_request("GET", "/behavior/score")
        
        if status == 200:
            required_fields = ["total", "budget_adherence", "tracking_consistency", "savings_progress", "spending_control", "streak"]
            if all(field in response for field in required_fields):
                total_score = response.get("total", 0)
                streak = response.get("streak", 0)
                if 0 <= total_score <= 100:
                    self.log_result("Behavior Score", True, f"Score: {total_score}/100, Streak: {streak} days")
                else:
                    self.log_result("Behavior Score", False, f"Invalid score range: {total_score}")
            else:
                self.log_result("Behavior Score", False, "Missing required fields")
        else:
            self.log_result("Behavior Score", False, f"Status {status}: {response}")
        
        # Test spending patterns
        status, response = self.make_request("GET", "/behavior/patterns")
        
        if status == 200:
            if isinstance(response, list):
                self.log_result("Behavior Patterns", True, f"Found {len(response)} behavioral insights")
            else:
                self.log_result("Behavior Patterns", False, "Response is not a list")
        else:
            self.log_result("Behavior Patterns", False, f"Status {status}: {response}")
        
        # Test challenges
        status, response = self.make_request("GET", "/behavior/challenges")
        
        if status == 200:
            if isinstance(response, list):
                active_challenges = [c for c in response if c.get("status") == "active"]
                self.log_result("Behavior Challenges", True, f"Found {len(active_challenges)} active challenges")
            else:
                self.log_result("Behavior Challenges", False, "Response is not a list")
        else:
            self.log_result("Behavior Challenges", False, f"Status {status}: {response}")
        
        # Test badges
        status, response = self.make_request("GET", "/behavior/badges")
        
        if status == 200:
            if isinstance(response, list):
                unlocked_badges = [b for b in response if b.get("is_unlocked")]
                self.log_result("Behavior Badges", True, f"Found {len(unlocked_badges)} unlocked badges out of {len(response)}")
            else:
                self.log_result("Behavior Badges", False, "Response is not a list")
        else:
            self.log_result("Behavior Badges", False, f"Status {status}: {response}")
        
        # Test future impact calculation
        status, response = self.make_request("GET", "/behavior/future-impact", 
                                           params={"category": "Food", "reduction_percent": 20})
        
        if status == 200:
            required_fields = ["monthly_saving", "yearly_saving", "equivalent"]
            if all(field in response for field in required_fields):
                monthly = response.get("monthly_saving", 0)
                yearly = response.get("yearly_saving", 0)
                equivalent = response.get("equivalent", "")
                self.log_result("Behavior Future Impact", True, 
                              f"Monthly: ₹{monthly}, Yearly: ₹{yearly}, Equivalent: {equivalent}")
            else:
                self.log_result("Behavior Future Impact", False, "Missing required fields")
        else:
            self.log_result("Behavior Future Impact", False, f"Status {status}: {response}")
        
        return True
    
    def test_user_profile(self):
        """Test user profile APIs"""
        print("\n👤 Testing User Profile APIs")
        
        if not self.token:
            self.log_result("User Profile", False, "No authentication token")
            return False
        
        # Test update profile
        update_data = {
            "monthly_budget": 50000.0,
            "currency": "INR"
        }
        
        status, response = self.make_request("PUT", "/users/profile", update_data)
        
        if status == 200:
            if response.get("monthly_budget") == 50000.0:
                self.log_result("Update User Profile", True, "Profile updated successfully")
                return True
            else:
                self.log_result("Update User Profile", False, "Budget not updated correctly")
                return False
        else:
            self.log_result("Update User Profile", False, f"Status {status}: {response}")
            return False
    
    def test_auth_protection(self):
        """Test that protected endpoints reject requests without token"""
        print("\n🔒 Testing Auth Protection")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        protected_endpoints = [
            ("GET", "/auth/me"),
            ("GET", "/transactions"),
            ("GET", "/goals"),
            ("GET", "/insights/summary"),
            ("GET", "/behavior/score")
        ]
        
        protected_working = True
        
        for method, endpoint in protected_endpoints:
            status, response = self.make_request(method, endpoint)
            
            if status in [401, 403]:  # Both 401 and 403 are valid auth rejection responses
                self.log_result(f"Auth Protection {endpoint}", True, "Correctly rejected unauthorized request")
            else:
                self.log_result(f"Auth Protection {endpoint}", False, f"Should reject but got status {status}")
                protected_working = False
        
        # Restore token
        self.token = original_token
        
        return protected_working
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Finly Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        auth_success = False
        if self.test_auth_register():
            auth_success = True
        elif self.test_auth_login():
            auth_success = True
        
        if auth_success:
            self.test_auth_me()
        
        # Only proceed with other tests if authentication works
        if auth_success:
            self.test_transactions_crud()
            self.test_goals_crud()
            self.test_insights_apis()
            self.test_behavior_apis()
            self.test_user_profile()
            self.test_auth_protection()
        else:
            self.log_error("Authentication", "Cannot proceed with other tests without authentication")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        print(f"\n✅ PASSED ({len(self.test_results['passed'])}):")
        for result in self.test_results['passed']:
            print(f"  {result}")
        
        if self.test_results['failed']:
            print(f"\n❌ FAILED ({len(self.test_results['failed'])}):")
            for result in self.test_results['failed']:
                print(f"  {result}")
        
        if self.test_results['errors']:
            print(f"\n🔥 ERRORS ({len(self.test_results['errors'])}):")
            for result in self.test_results['errors']:
                print(f"  {result}")
        
        total_tests = len(self.test_results['passed']) + len(self.test_results['failed'])
        success_rate = (len(self.test_results['passed']) / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📊 Overall Success Rate: {success_rate:.1f}% ({len(self.test_results['passed'])}/{total_tests})")
        
        return success_rate > 80  # Consider successful if >80% pass rate

if __name__ == "__main__":
    tester = FinlyAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Backend testing completed successfully!")
        sys.exit(0)
    else:
        print("\n⚠️  Backend testing completed with issues!")
        sys.exit(1)