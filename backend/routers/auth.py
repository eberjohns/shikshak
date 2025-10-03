from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from ..core.security import create_access_token, verify_password
from datetime import timedelta
from ..core.config import settings
from typing import List

router = APIRouter()

@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_name(db, name=user.name)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_name(db, name=form_data.name)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.name}, expires_delta=access_token_expires
    )
    
    user_schema = schemas.User(id=user.id, name=user.name, is_teacher=bool(user.is_teacher))

    return {"access_token": access_token, "token_type": "bearer", "user": user_schema}

@router.get("/students", response_model=List[schemas.User])
async def list_students(db: Session = Depends(get_db)):
    return crud.get_users(db=db)