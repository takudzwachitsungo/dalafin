from database import Base, engine, SessionLocal
from models.user import User
from models.account import Account
from models.category_limit import CategoryLimit
from utils.auth import get_password_hash
import uuid

def seed_database():
    """Seeds the database with default categories, tariff accounts, and demo user."""
    print("🌱 Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if demo user exists
        demo_email = "demo@dalafin.app"
        existing_user = db.query(User).filter(User.email == demo_email).first()
        
        if existing_user:
            print("ℹ️ Demo user already exists. Skipping seed.")
            return

        print("👤 Creating demo user...")
        user = User(
            id=uuid.uuid4(),
            email=demo_email,
            name="Demo User",
            hashed_password=get_password_hash("password123"),
            monthly_income=600.00,
            fixed_expenses=150.00,
            timezone="UTC"
        )
        db.add(user)
        db.flush()

        print("💳 Creating default pocket wallets...")
        accounts = [
            Account(
                id=uuid.uuid4(),
                user_id=user.id,
                name="USD Cash",
                account_type="cash",
                currency="USD",
                current_balance=50.00,
                fee_tariff_type="none"
            ),
            Account(
                id=uuid.uuid4(),
                user_id=user.id,
                name="EcoCash USD",
                account_type="mobile_money",
                currency="USD",
                current_balance=30.00,
                fee_tariff_type="ecocash_usd"
            ),
            Account(
                id=uuid.uuid4(),
                user_id=user.id,
                name="CBZ Bank Card",
                account_type="bank",
                currency="USD",
                current_balance=150.00,
                fee_tariff_type="imtt_2percent"
            ),
        ]
        db.add_all(accounts)

        print("📋 Seeding category limits...")
        default_categories = [
            ("Food & Dining", 180.00),
            ("Entertainment", 50.00),
            ("Shopping", 80.00),
            ("Transport", 60.00),
            ("Bills & Utilities", 150.00),
            ("Health & Fitness", 40.00),
            ("Other", 40.00),
        ]
        
        category_limits = [
            CategoryLimit(
                id=uuid.uuid4(),
                user_id=user.id,
                category=cat_name,
                monthly_limit=limit,
                spent=0.00
            ) for cat_name, limit in default_categories
        ]
        db.add_all(category_limits)

        db.commit()
        print("✅ Database seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
