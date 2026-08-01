from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.account import Account
from models.user import User
from utils.deps import get_current_user
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/accounts", tags=["Accounts"])

class AccountCreate(BaseModel):
    name: str
    account_type: str # "cash", "mobile_money", "bank", "card"
    currency: str = "USD"
    current_balance: float = 0.0
    fee_tariff_type: str = "none" # "ecocash_usd", "ecocash_zig", "imtt_2percent", "custom", "none"

class AccountResponse(AccountCreate):
    id: str
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AccountResponse])
def get_user_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_active == True
    ).all()
    return [
        AccountResponse(
            id=str(a.id),
            name=a.name,
            account_type=a.account_type,
            currency=a.currency,
            current_balance=float(a.current_balance or 0),
            fee_tariff_type=a.fee_tariff_type or "none",
            is_active=a.is_active
        ) for a in accounts
    ]

@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_account = Account(
        user_id=current_user.id,
        name=account_in.name,
        account_type=account_in.account_type,
        currency=account_in.currency,
        current_balance=account_in.current_balance,
        fee_tariff_type=account_in.fee_tariff_type
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    
    return AccountResponse(
        id=str(new_account.id),
        name=new_account.name,
        account_type=new_account.account_type,
        currency=new_account.currency,
        current_balance=float(new_account.current_balance or 0),
        fee_tariff_type=new_account.fee_tariff_type or "none",
        is_active=new_account.is_active
    )
