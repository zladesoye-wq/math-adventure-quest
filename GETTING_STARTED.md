# 🚀 Getting Started Guide

Welcome to **Math Adventure Quest**! This guide will help you set up the development environment and get the project running locally.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | >= 20.x | JavaScript runtime |
| **npm** | >= 10.x | Package manager |
| **Git** | >= 2.x | Version control |
| **PostgreSQL** | >= 15.x | Database *(for backend)* |

---

## 🧪 1. Clone the Repository

```bash
git clone <repository-url>
cd math-adventure-quest
```

---

## 🎨 2. Set Up the Frontend

```bash
cd packages/client
npm install
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Environment Configuration

The frontend connects to the backend at `/api/`. During development, Vite proxies API requests to the backend server:

```
Browser → http://localhost:5173/api/* → http://localhost:3001/api/*
```

This proxy is configured in `vite.config.ts`. No additional config needed for local development.

---

## ⚙️ 3. Set Up the Backend

```bash
cd packages/server
npm install
```

### Database Setup

1. Create a PostgreSQL database:
   ```bash
   createdb math_adventure_quest
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` file:
   ```env
   PORT=3001
   DATABASE_URL=postgresql://localhost:5432/math_adventure_quest
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3001) |
| `npm run build` | Type-check + production build |
| `npm run start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed sample data |

---

## 🏃 4. Run Both Servers

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd packages/server
npm run dev
# Server starts at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd packages/client
npm run dev
# Server starts at http://localhost:5173
```

Open **http://localhost:5173** in your browser to see the application.

---

## 🧩 5. Project Architecture

### Monorepo Structure

```
math-adventure-quest/
├── packages/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   │   ├── api/         # API client (JWT auth, endpoints)
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── context/     # React context providers
│   │   │   ├── hooks/       # Custom data-fetching hooks
│   │   │   ├── pages/       # Page components (one per route)
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   ├── App.tsx      # Main app with routing
│   │   │   ├── main.tsx     # Entry point
│   │   │   └── index.css    # Global styles & design system
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── server/          # Express backend
│       └── ...
├── README.md
├── GETTING_STARTED.md
└── packages/client/API.md
```

### Data Flow

```
User Action → React Page → Custom Hook (src/hooks/) → API Client (src/api/) 
    → HTTP Request → Express Server → PostgreSQL → Response → UI Update
```

---

## 🌐 6. Available Test Accounts

After running database seed scripts:

| Role | Email | Password |
|------|-------|----------|
| Parent | `parent@test.com` | `password123` |
| Teacher | `teacher@test.com` | `password123` |
| Student (Alex) | *(login via parent dashboard)* | *(child account)* |

---

## 🧪 7. Testing

```bash
# Frontend
cd packages/client
npm run lint    # Lint check
npm run build   # Type-check + build

# Backend
cd packages/server
npm test        # Run test suite
npm run lint    # Lint check
```

### Testing Guidelines

- **Frontend**: React Testing Library for component tests
- **Backend**: Jest + Supertest for API endpoint tests
- **E2E**: *(coming soon)* Playwright for end-to-end tests

---

## 🔧 8. Common Issues & Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### API Connection Refused
1. Ensure the backend server is running on port 3001
2. Check that `vite.config.ts` has the correct proxy target
3. Verify no firewall is blocking local connections

### TypeScript Build Errors
```bash
# Clear TypeScript build cache
rm -rf packages/client/node_modules/.tmp
npm run build
```

### Tailwind CSS Not Applied
1. Ensure `@tailwindcss/vite` plugin is in `vite.config.ts`
2. Check that `@import "tailwindcss"` is at the top of `index.css`
3. Restart the dev server after adding Tailwind classes

---

## 📚 8. Additional Resources

- [API Reference](./packages/client/API.md) — Complete API endpoint documentation
- [README.md](./README.md) — Project overview and feature descriptions
- [TypeScript Types](./packages/client/src/types/index.ts) — Full type definitions
- [Design System](./packages/client/src/index.css) — CSS custom properties and utilities

---

## 🤝 9. Contributing

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Run `npm run build` to verify no errors
4. Submit a pull request for review

### Code Style

- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes + custom `@layer utilities`
- **Imports**: Grouped by type (React, third-party, local)
- **Types**: Defined in `src/types/`, imported as type-only where possible

---

## 📧 10. Getting Help

- **Issues**: Submit GitHub issues for bugs or feature requests
- **Documentation**: Check this guide and the API reference first
- **Team**: Reach out via the project communication channel

---

*Happy coding! May your math adventures be bug-free!* 🧮✨