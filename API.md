# 📡 API Reference

> Complete API documentation for **Math Adventure Quest**

**Base URL:** `/api/` (dev) / `http://localhost:3001/api/` (production)

**Authentication:** Bearer JWT token in `Authorization` header

---

## 📋 Table of Contents

1. [Authentication](#-authentication)
2. [Students](#-students)
3. [Worlds & Levels](#-worlds--levels)
4. [Math Problems](#-math-problems)
5. [Progress & Analytics](#-progress--analytics)
6. [Subscriptions](#-subscriptions)
7. [Error Handling](#-error-handling)

---

## 🔐 Authentication

### Register

Create a new parent or teacher account.

```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "sarah@example.com",
  "password": "securePassword123!",
  "name": "Sarah",
  "role": "parent"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "email": "sarah@example.com",
      "name": "Sarah",
      "role": "parent"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login

Authenticate and receive a JWT token.

```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "sarah@example.com",
  "password": "securePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "email": "sarah@example.com",
      "name": "Sarah",
      "role": "parent"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### Get Profile

Get the currently authenticated user's profile.

```
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "email": "sarah@example.com",
    "name": "Sarah",
    "role": "parent"
  }
}
```

---

## 👶 Students

### List Students

Get all children linked to the authenticated parent.

```
GET /api/students
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "s1-...",
      "name": "Alex",
      "age": 8,
      "grade": 3,
      "role": "student",
      "parentId": "parent-uuid",
      "avatar": {
        "gender": "boy",
        "skinTone": "medium",
        "hairStyle": "short",
        "outfit": "casual",
        "accessory": null,
        "pet": null
      },
      "stats": {
        "coins": 1250,
        "gems": 47,
        "stars": 89,
        "xp": 2340,
        "level": 7,
        "streak": 5,
        "longestStreak": 12,
        "problemsSolved": 342,
        "correctAnswers": 304,
        "accuracy": 88.9,
        "lastActiveDate": "2025-06-08T10:30:00Z"
      },
      "worldProgress": [
        {
          "worldId": "addition-forest",
          "unlocked": true,
          "completedLevels": 12,
          "totalStars": 28,
          "bestScore": 950
        }
      ]
    }
  ]
}
```

---

### Add Student

Create a new student profile.

```
POST /api/students
```

**Request:**
```json
{
  "name": "Alex",
  "age": 8,
  "grade": 3
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* Student object */ }
}
```

---

### Update Avatar

Update a student's avatar customization.

```
PATCH /api/students/:id/avatar
```

**Request:**
```json
{
  "skinTone": "dark",
  "hairStyle": "curly",
  "outfit": "superhero",
  "accessory": "crown"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Updated Student object */ }
}
```

---

## 🌍 Worlds & Levels

### Get All Worlds

Retrieve all worlds with the student's progress.

```
GET /api/students/:id/worlds
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "addition-forest",
      "name": "Addition Forest",
      "description": "Master addition from simple sums to triple-digit challenges!",
      "emoji": "🌳",
      "color": "#22c55e",
      "gradientFrom": "from-green-400",
      "gradientTo": "to-emerald-600",
      "icon": "🌳",
      "isPremium": false,
      "order": 1,
      "levels": [
        {
          "id": "level-1",
          "worldId": "addition-forest",
          "number": 1,
          "title": "First Steps",
          "description": "Adding numbers up to 10",
          "difficulty": "easy",
          "starsRequired": 0,
          "status": "completed",
          "stars": 3,
          "bestScore": 950
        },
        {
          "id": "level-2",
          "worldId": "addition-forest",
          "number": 2,
          "title": "Going Up",
          "description": "Adding numbers up to 20",
          "difficulty": "easy",
          "starsRequired": 1,
          "status": "unlocked",
          "stars": 0,
          "bestScore": 0
        }
      ]
    }
  ]
}
```

**Level Status:** `locked` | `unlocked` | `completed`

**Difficulty:** `easy` | `medium` | `hard` | `expert`

---

### Get Single World

Retrieve a specific world with all its levels.

```
GET /api/students/:id/worlds/:worldId
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Single World object with levels */ }
}
```

---

## ➗ Math Problems

### Get Problem

Fetch an adaptive math problem for a specific level.

```
GET /api/students/:id/worlds/:worldId/levels/:levelId/problem
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prob-123",
    "operation": "addition",
    "operandA": 12,
    "operandB": 8,
    "answer": 20,
    "displayText": "12 + 8 = ?",
    "difficulty": "medium",
    "hints": [
      "Break it down: 10 + 8 = 18, then + 2",
      "Try counting on your fingers!"
    ],
    "visualAid": null,
    "options": [18, 20, 22, 24]
  }
}
```

**Operations:** `addition` | `subtraction` | `multiplication` | `division` | `fraction`

**Visual Aids:** `fraction-circle` | `number-line` | `array` | `ten-frame` | `null`

---

### Submit Answer

Submit a student's answer and receive results.

```
POST /api/students/:id/answer
```

**Request:**
```json
{
  "problemId": "prob-123",
  "studentId": "s1-...",
  "answerGiven": 20,
  "timeTaken": 4500,
  "hintsUsed": 1,
  "timestamp": "2025-06-08T10:35:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "correct": true,
    "xpEarned": 50,
    "coinsEarned": 10,
    "newStats": {
      "coins": 1260,
      "gems": 47,
      "stars": 90,
      "xp": 2390,
      "level": 7,
      "streak": 6,
      "longestStreak": 12,
      "problemsSolved": 343,
      "correctAnswers": 305,
      "accuracy": 88.9,
      "lastActiveDate": "2025-06-08T10:35:00Z"
    }
  }
}
```

---

## 📊 Progress & Analytics

### Get Student Stats

```
GET /api/students/:id/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "coins": 1250,
    "gems": 47,
    "stars": 89,
    "xp": 2340,
    "level": 7,
    "streak": 5,
    "longestStreak": 12,
    "problemsSolved": 342,
    "correctAnswers": 304,
    "accuracy": 88.9,
    "lastActiveDate": "2025-06-08T10:30:00Z"
  }
}
```

---

### Get Achievements

```
GET /api/students/:id/achievements
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ach-1",
      "title": "First Steps",
      "description": "Solve your first 10 problems",
      "emoji": "👣",
      "category": "milestone",
      "requirement": 10,
      "progress": 10,
      "unlocked": true,
      "unlockedAt": "2025-06-01T08:00:00Z",
      "xpReward": 100
    },
    {
      "id": "ach-2",
      "title": "Perfect 10",
      "description": "Get 10 correct answers in a row",
      "emoji": "🎯",
      "category": "accuracy",
      "requirement": 10,
      "progress": 7,
      "unlocked": false,
      "xpReward": 200
    }
  ]
}
```

**Categories:** `milestone` | `accuracy` | `streak` | `speed` | `completion`

---

### Get Daily Challenges

```
GET /api/students/:id/challenges
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dc-1",
      "title": "Speed Demon",
      "description": "Solve 10 problems in 2 minutes",
      "requirement": 10,
      "progress": 7,
      "completed": false,
      "xpReward": 50,
      "coinReward": 20,
      "expiresAt": "2025-06-09T00:00:00Z"
    }
  ]
}
```

---

### Get Reward Chests

```
GET /api/students/:id/chests
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "chest-1",
      "type": "bronze",
      "status": "available",
      "progress": 8,
      "maxProgress": 10,
      "rewards": {
        "coins": 100,
        "gems": 5,
        "item": "Golden Crown"
      }
    }
  ]
}
```

**Types:** `bronze` | `silver` | `gold` | `diamond`

**Statuses:** `locked` | `available` | `claimed`

---

### Get All Children's Progress (Parent)

```
GET /api/parents/children/progress
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "student": { /* Full Student object */ },
      "recentActivity": [
        {
          "id": "act-1",
          "studentId": "s1-...",
          "action": "level_completed",
          "detail": "Completed 3 levels in Addition Forest",
          "timestamp": "2025-06-08T10:30:00Z",
          "xpEarned": 120
        }
      ],
      "weeklyAccuracy": [85, 88, 82, 90, 92, 87, 89],
      "weeklyProblems": [15, 18, 12, 20, 22, 16, 19],
      "strengths": ["Addition", "Number patterns"],
      "weaknesses": ["Subtraction with regrouping", "Word problems"],
      "timeSpentToday": 24
    }
  ]
}
```

---

### Get Single Child's Progress (Parent)

```
GET /api/parents/children/:childId/progress
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Single ChildProgress object */ }
}
```

---

## 💳 Subscriptions

### Create Subscription

Create or upgrade a subscription plan.

```
POST /api/subscribe
```

**Request:**
```json
{
  "plan": "premium",
  "paymentMethodId": "pm_12345"
}
```

**Plan Options:** `premium` | `annual`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_12345",
    "plan": "premium",
    "status": "active",
    "currentPeriodStart": "2025-06-08T00:00:00Z",
    "currentPeriodEnd": "2025-07-08T00:00:00Z"
  }
}
```

---

### Get Subscription Status

```
GET /api/subscribe/status
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "premium",
    "status": "active",
    "currentPeriodEnd": "2025-07-08T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

**Statuses:** `active` | `canceled` | `past_due` | `trialing` | `none`

---

### Cancel Subscription

```
POST /api/subscribe/cancel
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "premium",
    "status": "active",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2025-07-08T00:00:00Z"
  }
}
```

---

## ❌ Error Handling

All endpoints return a consistent response format.

### Success Response
```json
{
  "success": true,
  "data": { /* Response payload */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|:----:|---------|-------------|
| **200** | OK | Request succeeded |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid input or validation error |
| **401** | Unauthorized | Missing or invalid authentication token |
| **403** | Forbidden | Authenticated but insufficient permissions |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Resource already exists (e.g., duplicate email) |
| **422** | Unprocessable Entity | Validation failed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected server failure |

### Validation Error Example (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Must be a valid email address",
    "password": "Must be at least 6 characters"
  }
}
```

### Authentication Error Example (401)
```json
{
  "success": false,
  "error": "Invalid or expired token. Please log in again."
}
```

---

## 📦 Rate Limiting

API requests are rate-limited to **100 requests per minute** per IP address. Exceed this limit and you'll receive a `429 Too Many Requests` response with a `Retry-After` header.

---

## 🔌 Client Library Usage

### Direct API Client
```typescript
import { apiClient } from './api/client';

// Login
const { data } = await apiClient.login({ email, password });

// Get stats
const stats = await apiClient.getStats(studentId);

// Submit answer
await apiClient.submitAnswer(studentId, {
  problemId: '...',
  studentId: '...',
  answerGiven: 42,
  timeTaken: 3000,
  hintsUsed: 0,
  timestamp: new Date().toISOString(),
});
```

### Using React Hooks (Recommended)
```typescript
import { useStudentStats } from './hooks/useStudentData';
import { LoadingSpinner, ErrorDisplay } from './hooks/useApi';

function ProgressCard({ studentId }: { studentId: string }) {
  const { stats, loading, error, refetch } = useStudentStats(studentId);

  if (loading) return <LoadingSpinner message="Loading stats..." />;
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />;

  return <div>{/* Render stats */}</div>;
}
```

---

*For questions or support, contact the development team.*