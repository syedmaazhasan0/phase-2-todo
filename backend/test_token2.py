import jwt

SECRET = "9LwoNRSxkGnLUquJlXdVmRCg3cIjSnhi"

payload = {
    "sub": "user_456",  # Different user
    "email": "other@example.com",
    "name": "Other User"
}

token = jwt.encode(payload, SECRET, algorithm="HS256")
print(token)
