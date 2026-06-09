# banking/management/commands/seed_data.py
"""
Custom Django management command to seed the banking platform with initial test data.
Run with: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
import uuid
from decimal import Decimal

from banking.models import User, Account, Transaction, SavingsGoal


class Command(BaseCommand):
    help = "Seeds the database with realistic test data for banking platform"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("🏦 Starting banking database seeding..."))
        
        # Clear existing data (optional - comment out if you want to preserve)
        self.clear_existing_data()
        
        # Create users
        users = self.create_users()
        
        # Create accounts for each user
        accounts = self.create_accounts(users)
        
        # Create transactions
        self.create_transactions(accounts, users)
        
        # Create savings goals
        self.create_savings_goals(users)
        
        # Generate transfers between accounts
        self.generate_transfer_between_accounts(accounts, users)
        
        self.stdout.write(self.style.SUCCESS("✅ Banking database seeding completed successfully!"))
    
    def clear_existing_data(self):
        """Clear existing data from all models."""
        self.stdout.write("Clearing existing data...")
        SavingsGoal.objects.all().delete()
        Transaction.objects.all().delete()
        Account.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write("Existing data cleared.")
    
    def create_users(self):
        """Create users with different profiles."""
        users = []
        
        # Admin user
        admin = User.objects.create_superuser(
            email="admin@banking.com",
            password="password123",
            first_name="System",
            last_name="Administrator",
            phone="+254700000001",
            security_question_pet="Max",
            security_question_food="Pizza",
            security_question_nickname="Admin",
            security_question_color="Blue"
        )
        users.append(admin)
        self.stdout.write("  ✓ Created admin user")
        
        # Regular users
        user_data = [
            {
                "email": "john.doe@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+254712345678",
                "security_question_pet": "Buddy",
                "security_question_food": "Ugali",
                "security_question_nickname": "Johnny",
                "security_question_color": "Red"
            },
            {
                "email": "jane.smith@example.com",
                "first_name": "Jane",
                "last_name": "Smith",
                "phone": "+254723456789",
                "security_question_pet": "Luna",
                "security_question_food": "Rice",
                "security_question_nickname": "Janey",
                "security_question_color": "Green"
            },
            {
                "email": "mike.wanjala@example.com",
                "first_name": "Mike",
                "last_name": "Wanjala",
                "phone": "+254734567890",
                "security_question_pet": "Simba",
                "security_question_food": "Nyama Choma",
                "security_question_nickname": "Mikie",
                "security_question_color": "Yellow"
            },
            {
                "email": "sarah.otieno@example.com",
                "first_name": "Sarah",
                "last_name": "Otieno",
                "phone": "+254745678901",
                "security_question_pet": "Kitty",
                "security_question_food": "Chapati",
                "security_question_nickname": "Saz",
                "security_question_color": "Purple"
            },
            {
                "email": "peter.kamau@example.com",
                "first_name": "Peter",
                "last_name": "Kamau",
                "phone": "+254756789012",
                "security_question_pet": "Rex",
                "security_question_food": "Githeri",
                "security_question_nickname": "Petey",
                "security_question_color": "Orange"
            },
            {
                "email": "grace.muthoni@example.com",
                "first_name": "Grace",
                "last_name": "Muthoni",
                "phone": "+254767890123",
                "security_question_pet": "Coco",
                "security_question_food": "Mukimo",
                "security_question_nickname": "Gracie",
                "security_question_color": "Pink"
            },
        ]
        
        for data in user_data:
            user = User.objects.create_user(
                email=data["email"],
                password="password123",
                first_name=data["first_name"],
                last_name=data["last_name"],
                phone=data["phone"],
                security_question_pet=data["security_question_pet"],
                security_question_food=data["security_question_food"],
                security_question_nickname=data["security_question_nickname"],
                security_question_color=data["security_question_color"]
            )
            users.append(user)
            self.stdout.write(f"  ✓ Created user: {user.full_name} ({user.email}) - Acc: {user.account_number}")
        
        return users
    
    def create_accounts(self, users):
        """Create accounts for each user."""
        accounts = []
        
        for user in users:
            # Create savings account for every user
            savings_account = Account.objects.create(
                user=user,
                account_type="savings",
                balance=Decimal(random.uniform(10000, 500000)),
                currency="KES",
                is_active=True
            )
            accounts.append(savings_account)
            self.stdout.write(f"  ✓ Created savings account for {user.full_name}: KES {savings_account.balance:,.2f}")
            
            # Create current account for some users
            if random.choice([True, False]):
                current_account = Account.objects.create(
                    user=user,
                    account_type="current",
                    balance=Decimal(random.uniform(5000, 200000)),
                    currency="KES",
                    is_active=True
                )
                accounts.append(current_account)
                self.stdout.write(f"  ✓ Created current account for {user.full_name}: KES {current_account.balance:,.2f}")
            
            # Create fixed deposit account for some users
            if random.choice([True, False]) and user != users[0]:
                fixed_account = Account.objects.create(
                    user=user,
                    account_type="fixed",
                    balance=Decimal(random.uniform(50000, 1000000)),
                    currency="KES",
                    is_active=True
                )
                accounts.append(fixed_account)
                self.stdout.write(f"  ✓ Created fixed deposit account for {user.full_name}: KES {fixed_account.balance:,.2f}")
        
        return accounts
    
    def create_transactions(self, accounts, users):
        """Create transaction history for each account."""
        transaction_types = ["deposit", "withdrawal"]
        
        for account in accounts:
            balance = account.balance
            
            # Create 8-15 transactions per account
            num_transactions = random.randint(8, 15)
            
            for i in range(num_transactions):
                transaction_type = random.choice(transaction_types)
                
                # Determine amount based on transaction type
                if transaction_type == "deposit":
                    amount = Decimal(random.uniform(100, 50000))
                    balance_before = balance
                    balance_after = balance_before + amount
                    balance = balance_after
                    description = random.choice([
                        "Salary deposit", "Bank transfer received", "Mobile money deposit",
                        "Freelance payment", "Dividend payment", "Refund", "Cash deposit"
                    ])
                    recipient_account = ""
                    recipient_name = ""
                    
                else:  # withdrawal
                    amount = Decimal(random.uniform(100, min(20000, float(balance))))
                    if amount > balance:
                        amount = balance * Decimal(0.1)
                    balance_before = balance
                    balance_after = balance_before - amount
                    balance = balance_after
                    description = random.choice([
                        "ATM withdrawal", "Cash withdrawal", "Online purchase",
                        "Bill payment", "Shopping", "Restaurant payment", "Supermarket"
                    ])
                    recipient_account = ""
                    recipient_name = ""
                
                # Create transaction
                try:
                    transaction = Transaction.objects.create(
                        account=account,
                        transaction_type=transaction_type,
                        amount=amount,
                        balance_before=balance_before,
                        balance_after=balance_after,
                        description=description,
                        reference=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                        recipient_account=recipient_account,
                        recipient_name=recipient_name,
                        status=random.choice(["completed", "completed", "completed", "completed", "pending"]),  # Mostly completed
                        created_at=timezone.now() - timedelta(days=random.randint(1, 365))
                    )
                    
                    if i < 3:  # Just show first few transactions per account
                        self.stdout.write(f"  ✓ Created {transaction_type}: {description[:50]} - KES {amount:,.2f}")
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  ⚠ Skipped transaction: {str(e)}"))
        
        # Update final account balances
        for account in accounts:
            last_transaction = Transaction.objects.filter(account=account).order_by('-created_at').first()
            if last_transaction:
                account.balance = last_transaction.balance_after
                account.save()
    
    def create_savings_goals(self, users):
        """Create savings goals for users."""
        goal_templates = [
            {"name": "New Car", "target": 1000000},
            {"name": "Emergency Fund", "target": 500000},
            {"name": "Vacation to Dubai", "target": 200000},
            {"name": "Laptop Fund", "target": 80000},
            {"name": "House Deposit", "target": 2000000},
            {"name": "Education Fund", "target": 300000},
            {"name": "Wedding Savings", "target": 500000},
            {"name": "Investment Portfolio", "target": 1000000},
            {"name": "Home Renovation", "target": 250000},
            {"name": "Retirement Fund", "target": 5000000},
        ]
        
        for user in users:
            # Create 2-4 savings goals per user
            num_goals = random.randint(2, 4)
            selected_goals = random.sample(goal_templates, min(num_goals, len(goal_templates)))
            
            for goal_template in selected_goals:
                # Calculate current amount (0% to 100% of target)
                current_amount = Decimal(random.uniform(0, float(goal_template["target"])))
                is_completed = current_amount >= goal_template["target"]
                
                # Set deadline between 1 month and 3 years from now (or None for some)
                deadline = None
                if random.choice([True, False]):
                    deadline = timezone.now().date() + timedelta(days=random.randint(30, 1095))
                
                try:
                    savings_goal = SavingsGoal.objects.create(
                        user=user,
                        name=goal_template["name"],
                        target_amount=goal_template["target"],
                        current_amount=current_amount,
                        deadline=deadline,
                        is_completed=is_completed
                    )
                    
                    progress = savings_goal.progress_percentage
                    self.stdout.write(f"  ✓ Created savings goal for {user.first_name}: {goal_template['name']} - {progress:.1f}% complete")
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  ⚠ Skipped savings goal: {str(e)}"))
            
            # Add a completed goal for some users
            if random.choice([True, False]):
                completed_goal = random.choice(goal_templates)
                try:
                    SavingsGoal.objects.create(
                        user=user,
                        name=f"Completed: {completed_goal['name']}",
                        target_amount=completed_goal["target"],
                        current_amount=completed_goal["target"],
                        deadline=timezone.now().date() - timedelta(days=random.randint(30, 365)),
                        is_completed=True
                    )
                    self.stdout.write(f"  ✓ Created completed savings goal for {user.first_name}")
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  ⚠ Skipped completed goal: {str(e)}"))
    
    def generate_transfer_between_accounts(self, accounts, users):
        """Generate transfer transactions between random accounts."""
        num_transfers = random.randint(10, 20)
        transfers_created = 0
        
        for _ in range(num_transfers):
            # Select random sender and recipient accounts
            if len(accounts) < 2:
                break
                
            # Get accounts that are savings or current (fixed deposits shouldn't be used for transfers)
            eligible_accounts = [acc for acc in accounts if acc.account_type in ['savings', 'current']]
            
            if len(eligible_accounts) < 2:
                continue
                
            sender = random.choice(eligible_accounts)
            recipient_accounts = [acc for acc in eligible_accounts if acc.user != sender.user]
            
            if not recipient_accounts:
                continue
                
            recipient = random.choice(recipient_accounts)
            
            amount = Decimal(random.uniform(100, min(5000, float(sender.balance))))
            
            if amount > sender.balance or amount <= 0:
                continue
            
            # Debit sender (send money)
            sender_balance_before = sender.balance
            sender_balance_after = sender_balance_before - amount
            sender.balance = sender_balance_after
            sender.save()
            
            try:
                Transaction.objects.create(
                    account=sender,
                    transaction_type="send",
                    amount=amount,
                    balance_before=sender_balance_before,
                    balance_after=sender_balance_after,
                    description=f"Sent money to {recipient.user.full_name}",
                    reference=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                    recipient_account=recipient.user.account_number,
                    recipient_name=recipient.user.full_name,
                    status="completed",
                    created_at=timezone.now() - timedelta(days=random.randint(1, 180))
                )
                
                # Credit recipient (receive money)
                recipient_balance_before = recipient.balance
                recipient_balance_after = recipient_balance_before + amount
                recipient.balance = recipient_balance_after
                recipient.save()
                
                Transaction.objects.create(
                    account=recipient,
                    transaction_type="receive",
                    amount=amount,
                    balance_before=recipient_balance_before,
                    balance_after=recipient_balance_after,
                    description=f"Received money from {sender.user.full_name}",
                    reference=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                    recipient_account=sender.user.account_number,
                    recipient_name=sender.user.full_name,
                    status="completed",
                    created_at=timezone.now() - timedelta(days=random.randint(1, 180))
                )
                
                transfers_created += 1
                self.stdout.write(f"  ✓ Processed transfer: KES {amount:,.2f} from {sender.user.first_name} to {recipient.user.first_name}")
                
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"  ⚠ Skipped transfer: {str(e)}"))
                # Revert sender balance if transaction failed
                sender.balance = sender_balance_before
                sender.save()
        
        self.stdout.write(f"  ✓ Created {transfers_created} transfer transactions")


import random
import string