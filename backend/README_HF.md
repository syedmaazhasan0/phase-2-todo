---
title: Todo API Backend
emoji: 🚀
colorFrom: blue
colorTo: yellow
sdk: docker
---

# Todo API Backend

This is a FastAPI-based backend for a Todo application with authentication and task management features.

## Features

- User authentication (register, login, logout)
- Secure JWT-based authentication
- Task management (create, read, update, delete, complete)
- Filter and sort tasks
- User data isolation (each user can only access their own tasks)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login to get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Tasks
- `GET /api/tasks` - List tasks with filtering and sorting options
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get a specific task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `PATCH /api/tasks/{id}/complete` - Toggle task completion status

## Environment Variables

You need to set the following environment variables:

- `BETTER_AUTH_SECRET`: Secret key for JWT token signing (should be a random string)
- `DATABASE_URL`: Database connection URL (PostgreSQL recommended)

## Setup Instructions

1. Set the required environment variables
2. The application will automatically create database tables on startup
3. Access the API endpoints as described above
4. Use the JWT token from login in the Authorization header as `Bearer <token>`

## Technologies Used

- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- PostgreSQL
- JWT authentication
- bcrypt for password hashing