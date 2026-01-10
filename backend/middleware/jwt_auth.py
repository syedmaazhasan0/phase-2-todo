"""
JWT authentication middleware for Todo API.

Verifies JWT tokens on every request and attaches authenticated user
information to request state for route handlers.
"""

import os
from fastapi import Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")

if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is not set")

security = HTTPBearer(auto_error=False)

# Public routes that don't require authentication
PUBLIC_ROUTES = {"/", "/health", "/docs", "/redoc", "/openapi.json", "/api/auth/login", "/api/auth/register"}


async def verify_jwt(request: Request, call_next):
    """
    HTTP middleware to verify JWT token on every request.

    Extracts Authorization: Bearer header, verifies the JWT signature,
    decodes the payload, and attaches user info to request.state.

    Returns 401 Unauthorized for any authentication failures.
    """
    path = request.url.path

    # Skip authentication for public routes and preflight OPTIONS requests
    if path in PUBLIC_ROUTES or path.startswith("/docs") or path.startswith("/redoc"):
        return await call_next(request)

    # Allow CORS preflight requests without authentication
    if request.method == "OPTIONS":
        return await call_next(request)

    try:
        # Extract Authorization header (may be None)
        credentials: HTTPAuthorizationCredentials = await security(request)

        if credentials is None:
            return Response(
                content='{"detail": "Authentication required"}',
                status_code=401,
                media_type="application/json"
            )

        token = credentials.credentials

        # Verify and decode JWT
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Extract user info from claims
        user_id = payload.get("sub")
        email = payload.get("email")
        name = payload.get("name")

        if not user_id:
            return Response(
                content='{"detail": "Invalid token: missing user_id"}',
                status_code=401,
                media_type="application/json"
            )

        # Attach to request state for route handlers
        request.state.current_user = {
            "id": user_id,
            "email": email,
            "name": name
        }

    except JWTError as e:
        return Response(
            content=f'{{"detail": "Invalid token: {str(e)}"}}',
            status_code=401,
            media_type="application/json"
        )
    except Exception:
        return Response(
            content='{"detail": "Authentication required"}',
            status_code=401,
            media_type="application/json"
        )

    response = await call_next(request)
    return response


def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency to get the authenticated user from request state.

    Should be used in all protected route handlers to access user information.

    Returns:
        dict: Current user with id, email, and name

    Raises:
        HTTPException: If no authenticated user is attached to request state
    """
    if not hasattr(request.state, "current_user"):
        raise Exception("Authentication required")

    return request.state.current_user
