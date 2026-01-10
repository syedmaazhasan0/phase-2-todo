# Quickstart Guide: Frontend Setup

**Feature**: Frontend Specifications for Todo Full-Stack Web Application
**Branch**: `001-frontend-specs`
**Date**: 2026-01-01
**Purpose**: Step-by-step guide to set up and run the frontend development environment

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** for version control
- **Code Editor** (VS Code recommended with Tailwind CSS IntelliSense extension)
- **Backend API** running at `http://localhost:8000` (or configured URL)

**Check versions**:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

---

## Step 1: Initial Project Setup

### Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd phase-2

# Checkout the feature branch
git checkout 001-frontend-specs
```

### Create Next.js Project

If the `frontend/` directory doesn't exist yet, create it:

```bash
# From repository root
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir

# Answer prompts:
# ✔ Would you like to use TypeScript? … Yes
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Tailwind CSS? … Yes
# ✔ Would you like to use `src/` directory? … No
# ✔ Would you like to use App Router? … Yes
# ✔ Would you like to customize the default import alias? … No
```

**Note**: If `frontend/` already exists, skip to Step 2.

---

## Step 2: Install Dependencies

### Navigate to Frontend Directory

```bash
cd frontend
```

### Install Core Dependencies

```bash
# Better Auth for authentication
npm install better-auth

# Better Auth React integration
npm install @better-auth/react @better-auth/next-js

# Optional: React Query for data fetching/caching (defer to later if not needed)
# npm install @tanstack/react-query
```

### Install Dev Dependencies (if not already installed)

```bash
npm install -D @types/node @types/react @types/react-dom
```

---

## Step 3: Environment Configuration

### Create Environment File

Create `.env.local` in the `frontend/` directory:

```bash
touch .env.local
```

### Add Environment Variables

Open `.env.local` and add:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your_strong_secret_minimum_32_characters_long_replace_this
BETTER_AUTH_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**CRITICAL**: The `BETTER_AUTH_SECRET` **MUST** be identical in both frontend and backend `.env` files for JWT verification to work.

**Generate a Strong Secret**:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the generated string and replace `your_strong_secret_minimum_32_characters_long_replace_this` in `.env.local`.

### Create Example Environment File

Create `.env.example` (this file is committed to git as a template):

```bash
touch .env.example
```

Add to `.env.example`:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=<generate_with_openssl_rand_base64_32>
BETTER_AUTH_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 4: TypeScript Configuration

### Update `tsconfig.json`

Ensure strict mode is enabled. Your `tsconfig.json` should include:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 5: Tailwind CSS Configuration

### Update `tailwind.config.ts`

Extend the default Tailwind theme with custom design tokens:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2563eb', // blue-600
          700: '#1d4ed8', // blue-700
        },
        success: {
          600: '#16a34a', // green-600
        },
        danger: {
          600: '#dc2626', // red-600
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Step 6: ESLint Configuration

### Add Custom ESLint Rules

Update `.eslintrc.json` to enforce constitution principles:

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unknown-property": "error",
    "@next/next/no-img-element": "warn",
    "no-inline-styles": "off"
  }
}
```

**Note**: Consider adding a plugin to detect inline styles if available, or rely on code review.

---

## Step 7: Run Development Server

### Start the Development Server

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 16.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

### Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the default Next.js welcome page.

---

## Step 8: Verify Backend Connection

### Test Backend Availability

Before proceeding, ensure the backend API is running:

```bash
# In a separate terminal
curl http://localhost:8000/api/tasks
# Expected: 401 Unauthorized (because no JWT token sent) or similar auth error
# This confirms the backend is reachable
```

If you get a connection error, start the backend:

```bash
cd ../backend
# Follow backend quickstart instructions
uvicorn main:app --reload
```

---

## Step 9: Project Structure Verification

### Verify Directory Structure

Your `frontend/` directory should now look like this:

```
frontend/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── .env.local        # NOT committed to git
├── .env.example      # Template (committed)
├── .eslintrc.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Step 10: Next Steps

You're now ready to start implementing the frontend!

### Implementation Order (per plan.md)

1. **Setup Core Files**:
   - `/types/index.ts` - TypeScript interfaces
   - `/lib/auth.ts` - Better Auth configuration
   - `/lib/auth-provider.tsx` - Better Auth provider
   - `/lib/api.ts` - Centralized API client

2. **Authentication Pages**:
   - `/app/login/page.tsx` - Login/Signup page
   - `/components/AuthForm.tsx` - Authentication form component

3. **Protected Routes**:
   - `/middleware.ts` - Route protection middleware
   - `/app/tasks/page.tsx` - Main tasks dashboard

4. **UI Components**:
   - `/components/Navbar.tsx`
   - `/components/TaskCard.tsx`
   - `/components/TaskForm.tsx`
   - `/components/Modal.tsx`
   - `/components/LoadingSpinner.tsx`
   - `/components/ErrorMessage.tsx`

5. **Testing**:
   - Set up Jest + React Testing Library
   - Write unit tests for API client
   - Write component tests
   - Run E2E tests with Playwright/Cypress

---

## Common Issues & Troubleshooting

### Issue: "Module not found: Can't resolve 'better-auth'"

**Solution**: Make sure you installed Better Auth:
```bash
npm install better-auth @better-auth/react @better-auth/next-js
```

### Issue: "BETTER_AUTH_SECRET is not defined"

**Solution**: Check that `.env.local` exists and contains `BETTER_AUTH_SECRET`. Restart the dev server after adding environment variables.

### Issue: "Failed to fetch tasks - Connection refused"

**Solution**: Ensure backend API is running at `http://localhost:8000`. Check `NEXT_PUBLIC_API_URL` in `.env.local`.

### Issue: "401 Unauthorized" when calling API

**Solution**: This is expected behavior before implementing authentication. After login, the JWT token should be attached automatically.

### Issue: Tailwind styles not applying

**Solution**:
1. Check that `globals.css` includes Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
2. Ensure `tailwind.config.ts` points to correct content paths
3. Restart dev server

### Issue: TypeScript errors about missing types

**Solution**: Install missing type definitions:
```bash
npm install -D @types/node @types/react @types/react-dom
```

---

## Development Workflow

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**: Quick React snippets
- **Tailwind CSS IntelliSense**: Autocomplete for Tailwind classes
- **TypeScript** (built-in): Better TypeScript support
- **ESLint**: Real-time linting
- **Prettier**: Code formatting

### Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run type check
npx tsc --noEmit

# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Yes | Secret key for JWT signing (min 32 chars) | `abc123...xyz` |
| `BETTER_AUTH_URL` | Yes | Frontend URL for Better Auth callbacks | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://localhost:8000` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep secrets without this prefix server-only.

---

## Security Checklist

Before deploying to production:

- [ ] Generate a strong `BETTER_AUTH_SECRET` (min 32 characters)
- [ ] Ensure `BETTER_AUTH_SECRET` matches between frontend and backend
- [ ] Use HTTPS in production (required for secure JWT transmission)
- [ ] Never commit `.env.local` to version control
- [ ] Set `BETTER_AUTH_URL` to production domain
- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Enable CORS on backend for production frontend domain

---

## Success Criteria

You've successfully set up the frontend when:

- ✅ Development server runs on `http://localhost:3000`
- ✅ No TypeScript errors in terminal
- ✅ Tailwind CSS styles load correctly
- ✅ Environment variables are configured
- ✅ Backend API is reachable from frontend

**Next Step**: Begin implementation following `/specs/001-frontend-specs/plan.md` Phase 2.1 (Project Initialization) and beyond.

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Better Auth Docs**: https://better-auth.com/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **React Documentation**: https://react.dev/

---

**Ready to code!** 🚀

Follow the implementation plan in `/specs/001-frontend-specs/plan.md` to build out the frontend step by step.
