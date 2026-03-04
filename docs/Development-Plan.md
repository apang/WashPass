# WashPass Development Plan

## 1. Recommended technology stack

**Frontend:**
- React + Vite (SPA)
- React Router for routing
- Axios for API calls
**Why:** Popular, well-documented, fast dev experience, easy to deploy as static assets behind a CDN.

**Backend:**
- Node.js + Express
- RESTful JSON APIs
**Why:** Simple, widely used, good ecosystem, fits well with JS frontend and your existing experience.

**Database:**
- PostgreSQL
**Why:** Relational, strong consistency, good for transactional data (users, bookings, payments).

**ORM / Query Layer:**
- Knex.js or Prisma
**Why:** Safer queries, migrations, schema management.

**Authentication & Authorization:**
- JWT-based auth (access + refresh tokens)
- bcrypt for password hashing
**Why:** Standard pattern, stateless, works well with SPA.

**Infrastructure / Cloud:**
- AWS (baseline target)
  - RDS for PostgreSQL
  - ECS or Elastic Beanstalk for backend
  - S3 + CloudFront for frontend
**Why:** Managed DB, scalable app hosting, cheap static hosting.

**Dev Tooling:**
- GitHub for version control + PRs
- GitHub Actions for CI
- Docker + docker-compose for local dev

---

## 2. Application architecture

**Style:** Monolithic backend (for MVP)

- **Frontend:** React SPA served separately (S3/CloudFront in prod, Vite dev server locally).
- **Backend:** Single Express app exposing REST APIs.
- **DB:** Single PostgreSQL instance.

**API design:**
- RESTful endpoints, versioned under `/api/v1`.
- Example routes:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/washes`
  - `POST /api/v1/bookings`
  - `GET /api/v1/users/me`

**Reasoning:**
- Monolith is simpler to build, debug, and deploy for a student/startup MVP.
- You can later extract services (e.g., payments) if needed.

---

## 3. Database schema design

**Core tables (MVP):**

1. **users**
   - `id` (PK, UUID)
   - `email` (unique, indexed)
   - `password_hash`
   - `full_name`
   - `role` (`customer`, `washer`, `admin`)
   - `created_at`, `updated_at`

2. **car_washes**
   - `id` (PK, UUID)
   - `owner_id` (FK → users.id, washer)
   - `name`
   - `description`
   - `location` (city, state, or lat/long fields)
   - `base_price`
   - `is_active`
   - `created_at`, `updated_at`
   - Index on `(location)` and `(is_active)`

3. **wash_services**
   - `id` (PK, UUID)
   - `car_wash_id` (FK → car_washes.id)
   - `name` (e.g., “Basic Wash”, “Premium Detail”)
   - `price`
   - `duration_minutes`
   - `created_at`, `updated_at`

4. **bookings**
   - `id` (PK, UUID)
   - `customer_id` (FK → users.id)
   - `car_wash_id` (FK → car_washes.id)
   - `wash_service_id` (FK → wash_services.id)
   - `scheduled_time`
   - `status` (`pending`, `confirmed`, `completed`, `cancelled`)
   - `total_price`
   - `created_at`, `updated_at`
   - Index on `(customer_id)`, `(car_wash_id, scheduled_time)`

5. **payments**
   - `id` (PK, UUID)
   - `booking_id` (FK → bookings.id)
   - `provider` (e.g., `stripe`)
   - `provider_payment_id`
   - `amount`
   - `currency`
   - `status` (`pending`, `succeeded`, `failed`)
   - `created_at`, `updated_at`
   - Index on `(booking_id)`, `(provider_payment_id)`

**Indexing strategy:**
- Unique index on `users.email`
- Indexes on foreign keys and frequent query fields (e.g., `bookings.customer_id`, `car_washes.location`).

---

## 4. Project file/folder structure

```text
WashPass/
├── docs/
│   ├── PRD.md
│   └── Development-Plan.md
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── api/
│   ├── public/
│   └── vite.config.js
├── server/              # Node/Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/      # DB access / ORM
│   │   ├── middleware/
│   │   └── utils/
│   ├── tests/
│   └── index.js
├── docker-compose.yml
├── Dockerfile.server
├── Dockerfile.client
├── .env.example
├── .gitignore
└── README.md

