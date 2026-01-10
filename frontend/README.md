# Todo App Frontend

A full-stack Todo application frontend built with Next.js 16+, TypeScript, Tailwind CSS, and Better Auth for authentication.

## Features

- **User Authentication**: Sign up, login, and logout with Better Auth JWT
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Filtering**: Filter tasks by status (All, Pending, Completed)
- **Sorting**: Sort tasks by Created date, Title, or Due date
- **Optimistic UI**: Instant feedback on user actions
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Route Protection**: Middleware redirects unauthenticated users to login

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth with JWT plugin
- **State Management**: React hooks (no external state library)

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with Better Auth provider
│   ├── page.tsx            # Home page (redirects based on auth)
│   ├── login/
│   │   └── page.tsx        # Login/Signup page
│   ├── tasks/
│   │   ├── page.tsx        # Tasks dashboard (server component)
│   │   └── _components/
│   │       └── TasksDashboardClient.tsx  # Dashboard client with CRUD
│   ├── loading.tsx          # Global loading UI
│   ├── error.tsx            # Global error boundary
│   └── not-found.tsx        # 404 page
├── components/
│   ├── TaskCard.tsx        # Single task display card
│   ├── TaskForm.tsx        # Create/Edit task form
│   ├── Modal.tsx            # Reusable modal component
│   ├── AuthForm.tsx        # Login/Signup form
│   ├── Navbar.tsx           # Navigation bar with logout
│   ├── LoadingSpinner.tsx   # Loading indicators
│   └── ErrorMessage.tsx     # Error display component
├── lib/
│   ├── auth.ts              # Better Auth configuration
│   ├── auth-provider.tsx    # Better Auth React provider
│   └── api.ts               # Centralized API client
├── types/
│   └── index.ts            # TypeScript type definitions
└── middleware.ts            # Route protection middleware
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Backend API running on `http://localhost:8000`

### Installation

1. **Clone and navigate to frontend directory**
   ```bash
   cd phase-2/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the frontend directory:

   ```env
   # Better Auth Configuration
   BETTER_AUTH_SECRET=your_strong_secret_minimum_32_characters
   BETTER_AUTH_URL=http://localhost:3000

   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   **IMPORTANT**: The `BETTER_AUTH_SECRET` must match the one used in your backend.

   Generate a strong secret:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32

   # On Windows (PowerShell):
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

   An `.env.example` template is provided in the project root.

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

### Quickstart Guide

For detailed setup instructions, troubleshooting, and configuration options, see:
**[Quickstart Guide](specs/001-frontend-specs/quickstart.md)**

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## User Stories

| Story | Description | Status |
|--------|-------------|--------|
| US1 | User Authentication (signup, login, logout) | ✅ |
| US2 | View Tasks with filtering and sorting | ✅ |
| US3 | Create New Task | ✅ |
| US4 | Edit Existing Task | ✅ |
| US5 | Toggle Task Completion | ✅ |
| US6 | Delete Task | ✅ |

## Environment Variables

| Variable | Required | Description | Example |
|----------|-----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Yes | Secret key for JWT signing | `abc123...xyz` |
| `BETTER_AUTH_URL` | Yes | Frontend URL for callbacks | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://localhost:8000` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Development Workflow

1. Make changes to components/pages
2. Save files (hot reload refreshes the browser)
3. Test functionality
4. Run linter: `npm run lint`
5. Build check: `npm run build`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

## Deploy

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new):

```bash
npm install -g vercel
vercel
```

For other deployment options, see [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Troubleshooting

### Build fails with TypeScript errors

Check that all types are properly imported and defined. Run:
```bash
npx tsc --noEmit
```

### Authentication not working

1. Verify backend is running on `http://localhost:8000`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify `BETTER_AUTH_SECRET` matches between frontend and backend
4. Check browser console for CORS errors

### API calls returning 401 Unauthorized

1. Check that user is logged in
2. Verify JWT token is being sent in Authorization header
3. Check token hasn't expired (token expiry is handled by Better Auth)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Docs](https://better-auth.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## License

This project is part of a larger full-stack application. See the main project for licensing information.
