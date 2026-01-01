from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import date, timedelta
from database import get_db
from models.user import User
from models.wishlist import WishlistItem
from models.transaction import Transaction
from schemas import WishlistCreate, WishlistUpdate, WishlistResponse
from utils.deps import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def create_wishlist_item(
    item: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add item to wishlist with automatic cooldown calculation"""
    cooldown_days = WishlistItem.calculate_cooldown(item.price)
    
    db_item = WishlistItem(
        user_id=current_user.id,
        name=item.name,
        price=item.price,
        cooldown_days=cooldown_days,
        added_date=date.today(),
        status="waiting"
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[WishlistResponse])
def list_wishlist_items(
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List wishlist items, optionally filtered by status"""
    query = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(WishlistItem.status == status_filter)
    
    items = query.order_by(WishlistItem.added_date.desc()).all()
    return items

@router.get("/{item_id}", response_model=WishlistResponse)
def get_wishlist_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific wishlist item"""
    item = db.query(WishlistItem).filter(
        and_(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    return item

@router.put("/{item_id}", response_model=WishlistResponse)
def update_wishlist_item(
    item_id: str,
    item_update: WishlistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update wishlist item"""
    db_item = db.query(WishlistItem).filter(
        and_(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    update_data = item_update.model_dump(exclude_unset=True)
    
    # Recalculate cooldown if price changed
    if "price" in update_data:
        update_data["cooldown_days"] = WishlistItem.calculate_cooldown(update_data["price"])
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.post("/{item_id}/purchase")
def purchase_wishlist_item(
    item_id: str,
    category: str = "Shopping",
    note: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert wishlist item to transaction and mark as purchased"""
    db_item = db.query(WishlistItem).filter(
        and_(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    if db_item.status == "purchased":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item already purchased"
        )
    
    # Check if cooldown period is over
    if db_item.days_remaining > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cooldown period not over. {db_item.days_remaining} days remaining."
        )
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        amount=db_item.price,
        category=category,
        note=note or f"Wishlist: {db_item.name}",
        is_impulse=False,
        date=date.today()
    )
    db.add(transaction)
    
    # Update wishlist item status
    db_item.status = "purchased"
    db_item.purchased_date = date.today()
    
    db.commit()
    db.refresh(transaction)
    
    return {
        "message": "Item purchased successfully",
        "transaction_id": transaction.id,
        "wishlist_item_id": db_item.id
    }

@router.post("/{item_id}/skip")
def skip_wishlist_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark wishlist item as skipped"""
    db_item = db.query(WishlistItem).filter(
        and_(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    db_item.status = "skipped"
    db.commit()
    
    return {"message": "Item skipped"}

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete wishlist item"""
    db_item = db.query(WishlistItem).filter(
        and_(
            WishlistItem.id == item_id,
            WishlistItem.user_id == current_user.id
        )
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    db.delete(db_item)
    db.commit()
    return None
