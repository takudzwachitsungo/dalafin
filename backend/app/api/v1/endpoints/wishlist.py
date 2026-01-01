from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID

from app.core.database import get_db
from app.models.wishlist import WishlistItem, WishlistStatus
from app.models.user import User
from app.schemas.wishlist import (
    WishlistItemCreate,
    WishlistItemUpdate,
    WishlistItemResponse
)
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[WishlistItemResponse])
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all wishlist items for current user"""
    items = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id
    ).order_by(WishlistItem.added_date.desc()).all()
    
    return items


@router.post("/", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist_item(
    item_data: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new item to wishlist"""
    # Calculate cooldown days based on price
    cooldown_days = 30
    if item_data.price > 500:
        cooldown_days = 90
    elif item_data.price > 200:
        cooldown_days = 60
    elif item_data.price > 100:
        cooldown_days = 45
    
    item = WishlistItem(
        user_id=current_user.id,
        name=item_data.name,
        price=item_data.price,
        image_url=item_data.image_url,
        cooldown_days=cooldown_days,
        status=WishlistStatus.WAITING
    )
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item


@router.get("/{item_id}", response_model=WishlistItemResponse)
async def get_wishlist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific wishlist item"""
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    return item


@router.put("/{item_id}", response_model=WishlistItemResponse)
async def update_wishlist_item(
    item_id: UUID,
    item_data: WishlistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a wishlist item"""
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    update_data = item_data.model_dump(exclude_unset=True)
    
    # Handle status changes
    if 'status' in update_data:
        if update_data['status'] == WishlistStatus.PURCHASED:
            item.purchased_date = datetime.utcnow()
        elif update_data['status'] == WishlistStatus.REMOVED:
            item.removed_date = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a wishlist item"""
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    db.delete(item)
    db.commit()
