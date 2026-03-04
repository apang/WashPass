# WashPass Development Plan Review

## 1. Technology stack

**What we accept:**
- We will use React (with Vite) for the frontend because it is modern, fast, and widely used in industry.
- We will use Node.js + Express for the backend because it matches our JavaScript knowledge and keeps the stack consistent.
- We will use PostgreSQL as the main database because it is reliable and production-ready. 
- We will use bcrypt for password hashing.
- We will use JWT (access + refresh tokens) for authentication.

**What we want to change or simplify:**
- We will start with Knex.js instead of Prisma because Prisma may feel abstract while we are still learning SQL deeply.
- We will not integrate AWS immediately. We will first:
- Run PostgreSQL locally (Docker or local install)
- Run backend and frontend locally
- We will delay ECS, CloudFront, and advanced AWS setup until the MVP works locally.

**Why:**
- We want to understand what is happening under the hood instead of hiding everything behind tools.
- Deploying to AWS too early could slow us down and distract from core learning.
- Our priority is building working features first, then improving infrastructure.

---

## 2. Architecture

**What we accept:**
- We will use a monolithic backend (single Express app).
- We will expose RESTful JSON APIs under ` /api/v1`.
- We will separate:
- routes
- controllers
- services
- models

**What we want to change or simplify:**
- No microservices.
- No event-driven architecture.
- No CQRS.
- No message queues.
- No advanced caching layers in MVP.

**Why:**
- This is a student project, not a high-scale startup yet.
- Microservices without scale just create complexity.
- We want to focus on understanding clean backend structure and secure coding.

---

## 3. Database schema

**What we accept:**
- We will implement these tables:
- users
- car_washes
- wash_services
- bookings
- payments

- We will:
- Use UUIDs for primary keys.
- Enforce foreign keys.
- Add indexes to:
- users.email
- bookings.customer_id
- bookings.car_wash_id

**What we want to change or simplify:**
- We may initially:
- Skip advanced location indexing.
- Store simple city and state instead of full geolocation.

- Payments table may initially be:
- “Mock payments” only.
- No real Stripe integration in v1.

**Why:**
- Over-designing early is risky.
- We need to validate core flows first:
- Register
- Login
- Create listing
- Book service
---

## 4. Project structure

**What we accept:**
- client/ for React
- server/ for Express
- docs/ for PRD and architecture
- Clear separation of controllers/services/models

**What we want to change or simplify:**
- We will delay:
- Docker (unless needed for PostgreSQL)
- GitHub Actions CI

- We will first:
- Ensure the app runs cleanly locally.
- Use manual testing during early development.

**Why:**
- CI/CD without a stable app creates noise.
- We want to focus on building features before automating pipelines.
- DevOps comes after core functionality works.

---

## 5. Sprints and priorities

**What we accept:**
- We will prioritize:
- Authentication (register/login/JWT)
- Role system (customer vs washer)
- Car wash creation
- Booking creation
- Viewing bookings

**What we want to change or simplify:**
- We may combine sprints depending on time.
- We may skip:
- Reviews
- Ratings
- Admin dashboards
- Complex analytics

**Why:**
- The goal is a working booking platform — not a full marketplace ecosystem.
- If auth + listing + booking works securely, MVP is successful.

---

## 6. Testing and security

**What we accept:**
- bcrypt for password hashing
- Input validation (Joi or express-validator)
- Environment variables (.env)
- Role-based authorization middleware
- Basic unit tests for:
- Auth logic
- Booking logic

**What we want to change or simplify:**
- We may delay:
- Full E2E testing
- 80%+ test coverage requirement
- We may initially skip:
- Rate limiting
- Audit logging
- Centralized logging system

**Why:**
- Time and scope constraints.
- However, because I am a studying Application & Infrastructure Security I strongly recommend least implement:
- Secure headers (helmet middleware)
- Proper error handling (no stack traces in production)
- Basic role enforcement
- SQL injection protection (parameterized queries via Knex)

---
## 7. Infrastructure & Deployment (Realistic Plan)
- Instead of AWS immediately:
- Phase 1:
- Run locally.
- PostgreSQL locally or via Docker.
- Phase 2:
- Deploy backend to:
- Render or Railway (simpler than ECS)
- Deploy frontend to:
- Vercel or Netlify
- Phase 3:
- Migrate to AWS:
- RDS
- S3
- CloudFront
- Possibly ECS

---

## 7. Summary
- We accept most of the architectural direction.
- We intentionally simplify:
- No microservices
- No advanced cloud architecture
- No over-engineered database logic
- No complex DevOps early
- We focus on:
- Clean structure
- Secure authentication
- Role-based access
- Working booking flow
- Solid database relationships


