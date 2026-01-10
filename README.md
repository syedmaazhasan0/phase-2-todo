# Phase-2 Todo Application

A modern, full-stack todo application built with Next.js, FastAPI, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure login and signup with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Due Date Tracking**: Visual reminders for upcoming and overdue tasks
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with visual feedback

## 🛠️ Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

## ✨ Key Functionality

### Authentication
- Secure user registration and login
- JWT-based session management
- Protected routes and resources

### Task Management
- Create tasks with titles and descriptions
- Set due dates with visual reminders
- Mark tasks as complete/incomplete
- Edit and delete existing tasks
- Filter tasks by status (all, pending, completed)
- Sort tasks by creation date, title, or due date

### Visual Reminders
- **Overdue tasks**: Red badges indicating tasks past their due date
- **Due soon**: Yellow/orange badges for tasks due within 3 days
- **Future tasks**: Green badges for tasks due in the future
- Clear visual indicators for task priority

### User Interface
- Modern, clean design with gradient accents
- Responsive layout for all device sizes
- Smooth animations and transitions
- Intuitive navigation and controls
- Dark/light mode support

## 🏗️ Architecture

### Frontend (Next.js 14)
- App Router for efficient routing
- Client-side session management
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Modern component architecture

### Backend (FastAPI)
- RESTful API design
- JWT-based authentication
- PostgreSQL database integration
- SQLModel for ORM operations
- Comprehensive error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL database
- Git

## 🚀 Getting Started

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql+psycopg2://username:password@localhost/dbname"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

4. Start the backend server:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

4. Start the development server:
```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ by Maaz Hassan