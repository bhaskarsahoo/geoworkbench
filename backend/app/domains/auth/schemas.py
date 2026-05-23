from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    role: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    token: str
    user: UserOut
    expires_at: str


class MobileOtpRequest(BaseModel):
    username: str
    push_token: str | None = None


class MobileOtpOut(BaseModel):
    status: str
    message: str
    dev_otp: str | None = None


class MobileOtpVerifyRequest(BaseModel):
    username: str
    otp: str
    push_token: str | None = None
