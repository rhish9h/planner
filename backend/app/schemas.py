from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: str | None = Field(default=None, max_length=320)


class UserRead(ORMModel):
    id: str
    email: str | None
    created_at: datetime


class ChallengeCreate(BaseModel):
    user_id: str
    name: str = Field(default="90-Day Challenge", min_length=1, max_length=120)
    start_date: date
    duration_days: int = Field(default=90, gt=0)
    is_active: bool = True


class ChallengeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    start_date: date | None = None
    duration_days: int | None = Field(default=None, gt=0)
    is_active: bool | None = None


class ChallengeRead(ORMModel):
    id: str
    user_id: str
    name: str
    start_date: date
    duration_days: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AreaCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    target: int = Field(gt=0)
    starting_count: int = Field(default=0, ge=0)
    icon: str = Field(default="Target", min_length=1, max_length=80)
    color: str = Field(default="#4f46e5", pattern=r"^#[0-9a-fA-F]{6}$")


class AreaUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    target: int | None = Field(default=None, gt=0)
    starting_count: int | None = Field(default=None, ge=0)
    icon: str | None = Field(default=None, min_length=1, max_length=80)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class AreaRead(ORMModel):
    id: str
    challenge_id: str
    name: str
    target: int
    starting_count: int
    icon: str
    color: str
    created_at: datetime
    updated_at: datetime


class ActivityCreate(BaseModel):
    activity_date: date
    description: str | None = Field(default=None, max_length=10000)
    url: HttpUrl | None = None


class ActivityUpdate(ActivityCreate):
    pass


class ActivityRead(ORMModel):
    id: str
    area_id: str
    activity_date: date
    description: str | None
    url: str | None
    created_at: datetime
    updated_at: datetime


class AreaWithActivities(AreaRead):
    activities: list[ActivityRead] = []


class ChallengeDashboard(ChallengeRead):
    areas: list[AreaWithActivities]
