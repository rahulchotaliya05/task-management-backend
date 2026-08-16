# Real-time Collaborative Task Board — Backend

A production-ready REST API for a real-time Kanban board application. Built with Node.js, Express, MongoDB, and Socket.io. Supports JWT authentication with refresh token rotation, role-based access control, real-time collaboration, and atomic card operations using Mongoose transactions.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (access + refresh token with rotation)
- **Real-time:** Socket.io (room-based event scoping)
- **Validation:** Joi
- **Logging:** Morgan (structured request logging)
- **Security:** bcrypt (cost factor 10), HTTP-only cookies, express-rate-limit, CORS, input sanitization

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB Atlas account (or local MongoDB instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/rahulchotaliya05/task-management-backend.git
cd task-management-backend

# Install dependencies
npm install

# Copy environment file and configure
cp env.example .env
```

### Configure Environment

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/task-management

JWT_ACCESS_SECRET=jwtsecret
JWT_REFRESH_SECRET=jwtsecret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

### Seed Database

```bash
npm run seed
```

This creates demo data: 10 users, 4 boards, 12 columns, and 40 cards.

### Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:5000`

## Project Structure

```
src/
├── config/           # Database connection
├── controllers/      # Request handlers (business logic)
├── middlewares/       # Auth, validation, error handling, role & board access checks
├── models/           # Mongoose schemas with indexes (User, Board, Column, Card, RefreshToken)
├── routes/           # Express route definitions
├── socket/           # Socket.io initialization and event broadcasting
├── utils/            # asyncHandler, ApiError, ApiResponse
├── validations/      # Joi schemas for request validation
└── seed.js           # Database seeder
```

## API Design

### Authentication Flow

1. User registers → credentials stored with bcrypt hash (cost factor 10)
2. User logs in → receives access token (15 min) in response body + refresh token (7 day) in HTTP-only secure cookie
3. Access token expires → client calls `/auth/refresh` → cookie sent automatically → new access token issued, refresh token rotated
4. User logs out → refresh token deleted from DB + cookie cleared → token cannot be reused

### Endpoints Overview

| Area | Endpoints |
|------|-----------|
| Auth | POST /register, /login, /refresh, /logout, GET /me |
| Users | GET / (list all for member allocation) |
| Boards | POST /, GET /, GET /:id, PATCH /:id, DELETE /:id |
| Members | POST /boards/:id/members, DELETE /boards/:id/members/:userId |
| Columns | POST /boards/:id/columns, PATCH /columns/:id, DELETE /columns/:id |
| Cards | POST /columns/:id/cards, PATCH /cards/:id, DELETE /cards/:id, POST /cards/:id/move |

All endpoints prefixed with `/api/v1`.

### HTTP Status Codes

- 200 — Success
- 201 — Created
- 400 — Validation error / Bad request
- 401 — Unauthorized (missing or invalid token)
- 403 — Forbidden (valid token but insufficient permissions)
- 404 — Resource not found
- 409 — Conflict (duplicate email, member already exists)
- 429 — Too many requests (rate limited)
- 500 — Internal server error

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": ["field-level errors if validation failed"]
}
```

## Architecture Decisions

### Authentication & Security

| Decision | Reasoning |
|----------|-----------|
| Access token in response body | Short-lived (15 min), stored in memory. Client attaches via Authorization header. |
| Refresh token in HTTP-only cookie | Never accessible to JavaScript. Prevents XSS-based token theft. |
| Refresh token stored in MongoDB | Enables true logout (delete token → cannot refresh). TTL index auto-cleans expired tokens. |
| Token rotation on refresh | Old token deleted, new one issued. Prevents replay attacks with stolen cookies. |
| Rate limiting on auth endpoints | 10 requests per 15 min window. Prevents brute-force credential attacks. |
| bcrypt cost factor 10 | Industry standard. Balances security with acceptable hashing time (~100ms per hash). |

### Database Design

| Decision | Reasoning |
|----------|-----------|
| Reference-based relationships | Board → Owner (User), Board → Members (User[]), Column → Board, Card → Column + Board. Avoids data duplication. |
| Soft-delete pattern | `deletedAt` timestamp on Board, Column, Card. Enables data recovery, audit trail. Queries filter `deletedAt: null`. |
| Position field (integer) | Simple ordering for columns and cards. Gap-based ordering not needed at this scale. |
| Mongoose transactions for card move | Atomic update of source column positions + destination column positions + card's column/position. Prevents inconsistent state on failure. |
| Separate RefreshToken collection | Clean separation from User model. Supports multiple devices (multiple tokens per user). TTL index for auto-expiry. |

### Real-time Sync (Socket.io)

| Decision | Reasoning |
|----------|-----------|
| Room-based scoping | Users join a room by board ID. Events only broadcast to users viewing that board. |
| Server-authoritative | All mutations go through REST API first. Socket only broadcasts confirmed state. No client-side conflict resolution needed. |
| Last-write-wins | Simple, predictable. Server commits the latest valid request. If two users move the same card simultaneously, the last API call wins. |
| No OT/CRDT | Over-engineering for a Kanban board. Positional conflicts are rare and LWW is acceptable. |

## Index Justifications

| Collection | Index | Query Pattern |
|-----------|-------|---------------|
| User | `{ email: 1 }` unique | Login lookup, duplicate prevention |
| Board | `{ owner: 1, deletedAt: 1 }` | "My boards" query for board owners |
| Board | `{ members: 1, deletedAt: 1 }` | "Boards I belong to" query for members |
| Column | `{ board: 1, position: 1 }` | Fetch ordered columns for a board |
| Card | `{ column: 1, position: 1 }` | Fetch ordered cards within a column |
| Card | `{ board: 1, deletedAt: 1 }` | Fetch all active cards for a board (used in board detail) |
| RefreshToken | `{ user: 1 }` | Find/delete tokens on logout |
| RefreshToken | `{ token: 1 }` | Validate token on refresh |
| RefreshToken | `{ expiresAt: 1 }` TTL | MongoDB auto-deletes expired documents |

## Conflict Resolution

**Strategy: Server-Authoritative + Last-Write-Wins**

1. Client performs optimistic UI update (card moves instantly)
2. Client sends REST API request to server
3. Server validates, applies Mongoose transaction, commits to DB
4. Server broadcasts confirmed state via Socket.io to all room members
5. If API fails → client rolls back to previous state
6. If two clients move the same card simultaneously → both send API requests → server processes sequentially → last one wins → both clients receive the final confirmed state via socket

This approach is simple, correct, and sufficient for a collaborative Kanban board.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskboard.com | admin123 |
| User | john@taskboard.com | user123 |
| User | sarah@taskboard.com | user123 |
| User | mike@taskboard.com | user123 |
| User | alice@taskboard.com | user123 |
| User | bob@taskboard.com | user123 |
| User | charlie@taskboard.com | user123 |
| User | diana@taskboard.com | user123 |
| User | evan@taskboard.com | user123 |
| User | fiona@taskboard.com | user123 |

## Docker

### Run with Docker Compose (full stack)

```bash
# From the workspace root (where docker-compose.yml is)
cp docker.env.example docker.env
# Edit docker.env with your JWT secrets

docker compose up --build
```

This starts: MongoDB (port 27017) + Backend (port 5000) + Frontend (port 80)

### Backend image size

The multi-stage Dockerfile produces an image under 200MB:
- Base: node:18-alpine (~180MB with dependencies)
- Only production `node_modules` + source code copied to final stage
- No dev dependencies, no source maps

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon  |


