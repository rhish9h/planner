from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from .models import Activity, Area, Challenge, User
from .schemas import (
    ActivityCreate, ActivityRead, ActivityUpdate, AreaCreate, AreaRead, AreaUpdate,
    ChallengeCreate, ChallengeDashboard, ChallengeRead, ChallengeUpdate, UserCreate, UserRead,
)


def not_found(entity: str) -> HTTPException:
    return HTTPException(status_code=404, detail=f"{entity} not found")


def activity_window(area: Area, activity_date: date) -> None:
    challenge = area.challenge
    last_date = challenge.start_date + timedelta(days=challenge.duration_days - 1)
    if activity_date < challenge.start_date or activity_date > last_date:
        raise HTTPException(status_code=422, detail="activity_date must be within the challenge date range")
    if activity_date > date.today():
        raise HTTPException(status_code=422, detail="activity_date cannot be in the future")


def build_router(get_session):
    router = APIRouter(prefix="/v1")

    @router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
    def create_user(payload: UserCreate, session: Session = Depends(get_session)):
        user = User(**payload.model_dump())
        session.add(user)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="email already exists")
        session.refresh(user)
        return user

    @router.get("/users", response_model=UserRead)
    def get_user_by_email(email: str, session: Session = Depends(get_session)):
        user = session.scalar(select(User).where(User.email == email))
        if not user:
            raise not_found("user")
        return user

    @router.post("/challenges", response_model=ChallengeRead, status_code=status.HTTP_201_CREATED)
    def create_challenge(payload: ChallengeCreate, session: Session = Depends(get_session)):
        if not session.get(User, payload.user_id):
            raise not_found("user")
        challenge = Challenge(**payload.model_dump())
        session.add(challenge)
        session.commit()
        session.refresh(challenge)
        return challenge

    @router.get("/challenges/current", response_model=ChallengeDashboard)
    def current_challenge(user_id: str, session: Session = Depends(get_session)):
        challenge = session.scalar(
            select(Challenge).where(Challenge.user_id == user_id, Challenge.is_active.is_(True))
            .options(selectinload(Challenge.areas).selectinload(Area.activities))
            .order_by(Challenge.created_at.desc())
        )
        if not challenge:
            raise not_found("active challenge")
        return challenge

    @router.patch("/challenges/{challenge_id}", response_model=ChallengeRead)
    def update_challenge(challenge_id: str, payload: ChallengeUpdate, session: Session = Depends(get_session)):
        challenge = session.get(Challenge, challenge_id)
        if not challenge:
            raise not_found("challenge")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(challenge, field, value)
        session.commit()
        session.refresh(challenge)
        return challenge

    @router.get("/challenges/{challenge_id}/areas", response_model=list[AreaRead])
    def list_areas(challenge_id: str, session: Session = Depends(get_session)):
        if not session.get(Challenge, challenge_id):
            raise not_found("challenge")
        return session.scalars(select(Area).where(Area.challenge_id == challenge_id).order_by(Area.created_at)).all()

    @router.post("/challenges/{challenge_id}/areas", response_model=AreaRead, status_code=status.HTTP_201_CREATED)
    def create_area(challenge_id: str, payload: AreaCreate, session: Session = Depends(get_session)):
        if not session.get(Challenge, challenge_id):
            raise not_found("challenge")
        area = Area(challenge_id=challenge_id, **payload.model_dump())
        session.add(area)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="an area with this name already exists in the challenge")
        session.refresh(area)
        return area

    @router.patch("/areas/{area_id}", response_model=AreaRead)
    def update_area(area_id: str, payload: AreaUpdate, session: Session = Depends(get_session)):
        area = session.get(Area, area_id)
        if not area:
            raise not_found("area")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(area, field, value)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="an area with this name already exists in the challenge")
        session.refresh(area)
        return area

    @router.delete("/areas/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_area(area_id: str, session: Session = Depends(get_session)):
        area = session.get(Area, area_id)
        if not area:
            raise not_found("area")
        session.delete(area)
        session.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @router.get("/areas/{area_id}/activities", response_model=list[ActivityRead])
    def list_activities(area_id: str, page: int = Query(1, ge=1), page_size: int = Query(5, ge=1, le=100), session: Session = Depends(get_session)):
        if not session.get(Area, area_id):
            raise not_found("area")
        offset = (page - 1) * page_size
        return session.scalars(select(Activity).where(Activity.area_id == area_id).order_by(Activity.activity_date.desc(), Activity.created_at.desc()).offset(offset).limit(page_size)).all()

    @router.post("/areas/{area_id}/activities", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
    def create_activity(area_id: str, payload: ActivityCreate, session: Session = Depends(get_session)):
        area = session.scalar(select(Area).where(Area.id == area_id).options(selectinload(Area.challenge)))
        if not area:
            raise not_found("area")
        activity_window(area, payload.activity_date)
        values = payload.model_dump()
        if values["url"] is not None:
            values["url"] = str(values["url"])
        activity = Activity(area_id=area_id, **values)
        session.add(activity)
        session.commit()
        session.refresh(activity)
        return activity

    @router.patch("/activities/{activity_id}", response_model=ActivityRead)
    def update_activity(activity_id: str, payload: ActivityUpdate, session: Session = Depends(get_session)):
        activity = session.scalar(select(Activity).where(Activity.id == activity_id).options(selectinload(Activity.area).selectinload(Area.challenge)))
        if not activity:
            raise not_found("activity")
        activity_window(activity.area, payload.activity_date)
        values = payload.model_dump()
        if values["url"] is not None:
            values["url"] = str(values["url"])
        for field, value in values.items():
            setattr(activity, field, value)
        session.commit()
        session.refresh(activity)
        return activity

    @router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_activity(activity_id: str, session: Session = Depends(get_session)):
        activity = session.get(Activity, activity_id)
        if not activity:
            raise not_found("activity")
        session.delete(activity)
        session.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @router.get("/challenges/{challenge_id}/activities", response_model=list[ActivityRead])
    def activities_for_day(challenge_id: str, activity_date: date = Query(alias="date"), session: Session = Depends(get_session)):
        if not session.get(Challenge, challenge_id):
            raise not_found("challenge")
        return session.scalars(
            select(Activity).join(Area).where(Area.challenge_id == challenge_id, Activity.activity_date == activity_date)
            .order_by(Activity.created_at.desc())
        ).all()

    return router
