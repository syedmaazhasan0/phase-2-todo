import jwt

SECRET = "9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi"

payload = {
    "sub": "user_123",
    "email": "user@example.com",
    "name": "Test User"
}

token = jwt.encode(payload, SECRET, algorithm="HS256")
print(token)
