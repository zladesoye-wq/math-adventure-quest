# 🧮 Math Adventure Quest

> Where math becomes a magical adventure! — A gamified math learning platform for kids ages 5–11.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<p align="center">
  <strong>🌟 Star us on GitHub</strong> — <em>Help us make math magical for every child!</em>
</p>

---

## 📸 Screenshots

<!-- TODO: Add screenshots once UI is finalized -->
<p align="center">
  <i>Screenshots coming soon — check back for world maps, math problem screens, and dashboards!</i>
</p>

<!--
| | |
|:---:|:---:|
| ![Landing Page](screenshots/landing.png) | ![Student Dashboard](screenshots/dashboard.png) |
| ![Math Problem](screenshots/problem.png) | ![Parent Dashboard](screenshots/parent.png) |
-->

---

## 📖 Overview

Math Adventure Quest transforms math practice into an immersive adventure. Students explore fantasy worlds — Addition Forest, Subtraction Mountain, Multiplication Kingdom, Division Desert, and Fraction Castle — while mastering arithmetic through adaptive challenges, earning rewards, and building confidence.

### ✨ Features

| For Students 🎮 | For Parents 📊 | For Teachers 🍎 |
|----------------|----------------|-----------------|
| 5 fantasy worlds with 20 levels each | Progress dashboard with analytics | Classroom management *(coming soon)* |
| Adaptive difficulty engine | Weekly accuracy & volume charts | Curriculum-aligned assignments *(soon)* |
| Custom avatar creator | Strengths & weaknesses analysis | Class-wide progress *(coming soon)* |
| Reward system (coins, gems, stars) | Real-time activity feed | |
| Daily challenges & streak tracking | Multi-child support | |
| Visual math aids (fraction circles, number lines) | Printable progress reports | |

### Target Audience

- **Primary**: Parents of elementary students (ages 5–11) seeking supplemental math practice
- **Secondary**: Elementary school teachers looking for classroom math tools

### Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** 🆓 | $0 | Addition Forest, Subtraction Mountain, basic avatar, daily challenges |
| **Premium** 💎 | $4.99/mo | All 5 worlds, advanced analytics, exclusive rewards, printable worksheets |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Minimum Version |
|------|:---------------:|
| Node.js | 20.x |
| npm | 10.x |
| PostgreSQL | 15.x |
| Git | 2.x |

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd math-adventure-quest

# 2. Install frontend dependencies
cd packages/client
npm install

# 3. Install backend dependencies
cd ../server
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 5. Run database migrations
npm run migrate

# 6. (Optional) Seed sample data
npm run seed

# 7. Start development servers
# Terminal 1 — Backend:
cd packages/server
npm run dev      # → http://localhost:3001

# Terminal 2 — Frontend:
cd packages/client
npm run dev      # → http://localhost:5173
```

> **Full setup guide** → [`GETTING_STARTED.md`](./GETTING_STARTED.md)
>
> **API reference** → [`API.md`](./API.md)

---

## 🏗️ Project Structure

```
math-adventure-quest/
├── packages/
│   ├── client/                     # React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── api/               # API client & network layer
│   │   │   ├── components/        # Reusable UI components
│   │   │   │   ├── avatar/        # Avatar creator & display
│   │   │   │   ├── common/        # Button, Card, ProgressBar
│   │   │   │   ├── game/          # WorldMap, LevelPath, MathProblem
│   │   │   │   ├── layout/        # Header, Footer, Layout
│   │   │   │   └── rewards/       # Coin display, badges, chests
│   │   │   ├── context/           # AuthContext (login state)
│   │   │   ├── hooks/             # Custom data-fetching hooks
│   │   │   ├── pages/             # Route-level page components
│   │   │   └── types/             # TypeScript interfaces
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── server/                     # Node.js + Express backend
│       ├── src/
│       │   ├── controllers/       # Route handlers
│       │   ├── models/            # Database models
│       │   ├── middleware/        # Auth, validation, error handling
│       │   ├── routes/            # Express route definitions
│       │   └── utils/            # Helper functions
│       ├── migrations/           # Database migrations
│       ├── seeds/                # Sample data seeds
│       └── package.json
├── README.md                       # This file
├── GETTING_STARTED.md              # Developer setup guide
└── API.md                          # Complete API reference
```

---

## 📱 Pages & Routes

| Route | Page | Auth Required |
|-------|------|:-------------:|
| `/` | Landing page | ❌ |
| `/login` | Login form | ❌ |
| `/register` | Registration | ❌ |
| `/dashboard` | Student world map | ✅ Student |
| `/world/:worldId` | Level selection within a world | ✅ Student |
| `/world/:worldId/level/:levelId` | Math problem screen | ✅ Student |
| `/profile` | Avatar customization | ✅ Student |
| `/parent-dashboard` | Parent progress analytics | ✅ Parent/Teacher |

---

## 🎨 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript 6** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Styling & design system |
| **React Router 7** | Client-side routing |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | HTTP server & routing |
| **PostgreSQL** | Database |
| **JWT (JSON Web Tokens)** | Authentication |
| **REST API** | API architecture |

---

## 📜 Available Scripts

### Frontend (`packages/client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the codebase |

### Backend (`packages/server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload on port 3001 |
| `npm run build` | TypeScript compilation |
| `npm run start` | Start production server |
| `npm run test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Apply database migrations |
| `npm run seed` | Seed database with sample data |

---

## 🌐 API Overview

The frontend communicates with the backend via RESTful API at `/api/`. During development, Vite proxies requests to the backend server.

**Base URL:** `http://localhost:3001/api/` (production) or `/api/` (dev — proxied)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login with email/password |
| `POST` | `/api/auth/register` | Create new account |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/students` | List children (parent) |
| `POST` | `/api/students` | Add a child |
| `GET` | `/api/students/:id/stats` | Get student statistics |
| `GET` | `/api/students/:id/worlds` | Get worlds with progress |
| `GET` | `/api/students/:id/worlds/:wid/levels/:lid/problem` | Get math problem |
| `POST` | `/api/students/:id/answer` | Submit answer |
| `GET` | `/api/parents/children/progress` | All children's progress |
| `POST` | `/api/subscribe` | Create subscription |
| `GET` | `/api/subscribe/status` | Get subscription status |

> **Full API documentation** → [`API.md`](./API.md)

---

## 🚢 Deployment

### Frontend (Static Hosting)

The frontend builds to a static `dist/` folder:

```bash
cd packages/client
npm run build
# Deploy dist/ to any static host (Vercel, Netlify, AWS S3, Cloudflare Pages)
```

For Vite proxy in production, configure your web server to forward `/api/*` requests to the backend.

### Backend (Node.js Hosting)

```bash
cd packages/server
npm run build
npm run start
# Deploy to Railway, Render, Fly.io, AWS EC2, or any Node.js host
```

### Docker *(Coming Soon)*

A `docker-compose.yml` with PostgreSQL + backend + frontend is in development.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** with clear, descriptive commit messages
4. **Run lint & build** to verify no errors
5. **Submit a pull request** for review

### Code Style

- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes + custom `@layer utilities`
- **Imports**: Grouped (React, third-party, local)
- **Types**: Defined in `src/types/`, imported with `type` keyword

---

## 📄 License

MIT — See the [LICENSE](LICENSE) file for details.

---

## 📊 Key Metrics (KPIs)

- Monthly Active Students (MAU)
- Subscription conversion rate
- Problems solved per session
- Accuracy improvement (4-week rolling)
- D1/D7/D30 retention
- Parent dashboard login rate

---

## 👨‍👩‍👧‍👦 Team

| Role | Responsibility |
|------|---------------|
| **Lead** | Project management & coordination |
| **Frontend Engineer** | React/TypeScript UI development |
| **Backend Engineer** | Node.js/Express API & database |

---

<p align="center">
  <strong>Built with ❤️ to make math magical for kids everywhere.</strong><br>
  <sub>Math Adventure Quest © 2025</sub>
</p>