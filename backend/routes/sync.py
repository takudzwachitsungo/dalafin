from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from database import get_db
from models.user import User
from models.account import Account
from models.transaction import Transaction
from models.category_limit import CategoryLimit
from utils.deps import get_current_user
from services.fee_engine import fee_engine

router = APIRouter(prefix="/api/v1/sync", tags=["Delta Sync"])

class OfflineTransactionPayload(BaseModel):
    id: UUID
    account_id: Optional[UUID] = None
    amount: float
    fee_amount: Optional[float] = 0.0
    total_deducted: Optional[float] = None
    category: str
    date: datetime
    is_impulse: bool = False
    is_pacing_flag: bool = False
    note: Optional[str] = None
    emergency_reason: Optional[str] = None

class SyncBatchRequest(BaseModel):
    transactions: List[OfflineTransactionPayload]

class SyncBatchResponse(BaseModel):
    synced_count: int
    duplicate_count: int
    processed_ids: List[str]

@router.post("", response_model=SyncBatchResponse, status_code=status.HTTP_200_OK)
def sync_offline_transactions(
    batch: SyncBatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Idempotent offline delta sync endpoint.
    Processes batched offline transaction logs, debits wallet balances, and updates category caps.
    """
    synced_count = 0
    duplicate_count = 0
    processed_ids = []

    for tx_item in batch.transactions:
        tx_str_id = str(tx_item.id)
        
        # 1. Idempotency Check: Skip if transaction already synced
        existing = db.query(Transaction).filter(
            Transaction.id == tx_item.id,
            Transaction.user_id == current_user.id
        ).first()

        if existing:
            duplicate_count += 1
            processed_ids.append(tx_str_id)
            continue

        # 2. Account Tariff & Balance Debit
        fee = tx_item.fee_amount or 0.0
        total_deducted = tx_item.total_deducted or (tx_item.amount + fee)

        if tx_item.account_id:
            account = db.query(Account).filter(
                Account.id == tx_item.account_id,
                Account.user_id == current_user.id
            ).first()

            if account:
                if tx_item.fee_amount is None or tx_item.fee_amount == 0.0:
                    fee, total_deducted = fee_engine.calculate_fee(
                        tx_item.amount,
                        account.fee_tariff_type
                    )
                account.current_balance = float(account.current_balance or 0) - total_deducted

        # 3. Create Transaction Record
        new_tx = Transaction(
            id=tx_item.id,
            user_id=current_user.id,
            account_id=tx_item.account_id,
            amount=tx_item.amount,
            fee_amount=fee,
            total_deducted=total_deducted,
            category=tx_item.category,
            date=tx_item.date,
            is_impulse=tx_item.is_impulse,
            is_pacing_flag=tx_item.is_pacing_flag,
            note=tx_item.note,
            emergency_reason=tx_item.emergency_reason
        )
        db.add(new_tx)

        # 4. Update Category Limit Spent
        cat_limit = db.query(CategoryLimit).filter(
            CategoryLimit.user_id == current_user.id,
            CategoryLimit.category == tx_item.category
        ).first()

        if cat_limit:
            cat_limit.spent += tx_item.amount

        synced_count += 1
        processed_ids.append(tx_str_id)

    db.commit()

    return SyncBatchResponse(
        synced_count=synced_count,
        duplicate_count=duplicate_count,
        processed_ids=processed_ids
    )
