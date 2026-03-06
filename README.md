# WashPass

One subscription. Total flexibility. Zero friction.

WashPass is a two-sided membership marketplace that unifies the fragmented car wash industry. Consumers subscribe to a plan and redeem washes at any participating location. Operators get a tech stack to compete with national chains, plus a revenue-share payout model.

---

## Architecture

```
                     ┌──────────────────────┐
                     │   PostgreSQL 15      │
                     │   (Prisma ORM)       │
                     └──────────┬───────────┘
                                │
┌─────────────┐    ┌────────────┴────────────┐    ┌──────────────┐
│  Consumer   │    │     NestJS Server       │    │   Operator   │
│  Mobile App ├────►  (Port 5000)            ◄────┤  Dashboard   │
│  (Expo)     │    │                         │    │  (Next.js)   │
│  GraphQL    │    │  GraphQL + REST API     │    │  REST API    │
└─────────────┘    └────────────┬────────────┘    └──────────────┘
                                │
                     ┌──────────┴───────────┐
                     │   Redis 7            │
                     │   (Cache/Sessions)   │
                     └──────────────────────┘
```

| Component | Tech | API | Port |
|-----------|------|-----|------|
| **Server** | NestJS 11, TypeScript, Prisma 5.22 | GraphQL + REST | 5000 |
| **Consumer App** | Expo/React Native, Apollo Client | GraphQL | 8081 |
| **Operator Dashboard** | Next.js 16, Zustand, Tailwind v4 | REST (`/v1/*`) | 3000 |
| **Database** | PostgreSQL 15 | — | 5432 |
| **Cache** | Redis 7 (ioredis) | — | 6379 |
| **Payments** | Stripe (subscriptions + webhooks) | — | — |

---

## Project Structure

```
WashPass/
├── server/                    # NestJS API server
│   ├── prisma/
│   │   ├── schema.prisma      # 13 models, 8 enums
│   │   └── seed.ts            # Seeds 6 subscription plans
│   └── src/
│       ├── auth/              # JWT auth, passport, Redis blocklist
│       ├── members/           # Member profiles (GraphQL)
│       ├── vehicles/          # Vehicle CRUD (GraphQL)
│       ├── plans/             # Subscription plans (GraphQL)
│       ├── locations/         # Location CRUD (REST + GraphQL)
│       ├── stripe/            # Stripe integration + webhooks
│       ├── memberships/       # Subscribe/pause/cancel (GraphQL)
│       ├── redemptions/       # Code generation + validation (GraphQL + REST)
│       ├── ratings/           # Wash ratings (GraphQL)
│       ├── disputes/          # Issue reporting (GraphQL + REST)
│       ├── payouts/           # Operator payouts (REST)
│       ├── analytics/         # Dashboard analytics (REST)
│       ├── operator-staff/    # Staff management (REST)
│       ├── jobs/              # Scheduled cron jobs
│       ├── config/            # Centralized configuration
│       ├── prisma/            # Database service (global)
│       ├── redis/             # Redis service (global)
│       ├── health/            # Health check endpoint
│       └── common/            # Shared guards, decorators
├── client-consumer/           # Expo/React Native mobile app
│   ├── app/                   # Expo Router file-based routing
│   │   ├── (auth)/            # Login, register screens
│   │   ├── (tabs)/            # Map, history, profile tabs
│   │   ├── location/[id].tsx  # Location detail
│   │   └── redeem/[locationId].tsx  # QR code + countdown
│   └── src/
│       ├── graphql/           # Queries and mutations
│       └── providers/         # Auth + Apollo providers
├── client-operator/           # Next.js operator dashboard
│   └── src/
│       ├── app/
│       │   ├── login/         # Operator login
│       │   └── dashboard/     # Analytics, scan, locations, payouts, etc.
│       ├── lib/               # Axios client, auth helpers
│       ├── stores/            # Zustand auth store
│       └── components/        # Sidebar, StatCard
├── terraform/                 # AWS infrastructure (ECS, RDS, Redis, VPC)
└── docker-compose.yml         # Local development environment
```

---

## Prerequisites

- **Node.js** >= 20 (recommended; v18.17+ works with warnings)
- **Docker** and **Docker Compose**
- **Stripe account** (test mode) for payment features
- **Expo CLI** (`npx expo`) for the mobile app

---

## Local Development Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url> && cd WashPass

# Server
cd server && npm install

# Operator dashboard
cd ../client-operator && npm install

# Consumer mobile app
cd ../client-consumer && npm install

cd ..
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your values:

```env
PORT=5000
DATABASE_URL=postgres://washpass:washpass@localhost:5432/washpass
REDIS_URL=redis://localhost:6379
JWT_SECRET=<generate-a-strong-secret>
JWT_REFRESH_SECRET=<generate-a-different-strong-secret>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

### 3. Start infrastructure with Docker Compose

```bash
docker compose up postgres redis -d
```

This starts PostgreSQL and Redis in the background. Wait a few seconds for them to initialize.

### 4. Initialize the database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed subscription plans (6 plans: Basic/Plus/Premium x Monthly/Annual)
npx prisma db seed
```

### 5. Start the server

```bash
# From server/
npm run start:dev
```

Verify at:
- Health check: `GET http://localhost:5000/health`
- GraphQL Playground: `http://localhost:5000/graphql`

### 6. Start the operator dashboard

```bash
# From client-operator/
npm run dev
```

Open `http://localhost:3000` in your browser.

### 7. Start the consumer mobile app

```bash
# From client-consumer/
npx expo start
```

Scan the QR code with Expo Go on your device, or press `i` for iOS simulator / `a` for Android emulator.

### Alternative: Run everything with Docker

```bash
docker compose up
```

This starts the server (port 5000), operator dashboard (port 3000), PostgreSQL, and Redis together. Note: you still need to run the database migration manually on first setup:

```bash
docker compose exec server npx prisma migrate dev --name init
docker compose exec server npx prisma db seed
```

---

## Stripe Setup (Test Mode)

1. Create a [Stripe account](https://dashboard.stripe.com/register) and switch to **Test Mode**
2. Copy your **Secret key** (`sk_test_...`) to `STRIPE_SECRET_KEY` in `.env`
3. Create products/prices in Stripe matching the 6 seeded plans, then update the `stripePriceId` field in each plan record
4. For webhooks locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:5000/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET` in `.env`.

The server handles these webhook events:
- `checkout.session.completed` - Creates membership after payment
- `invoice.paid` - Renews membership period
- `invoice.payment_failed` - Suspends membership
- `customer.subscription.updated` - Syncs subscription changes
- `customer.subscription.deleted` - Cancels membership

---

## API Overview

### Auth Endpoints (REST)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register member or operator |
| POST | `/auth/login` | Login, returns JWT + refresh token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate tokens (Redis blocklist) |

### Consumer API (GraphQL at `/graphql`)

| Operation | Type | Description |
|-----------|------|-------------|
| `plans` | Query | List subscription plans |
| `nearbyLocations` | Query | Find locations by lat/lng/radius |
| `location` | Query | Location detail by ID |
| `memberProfile` | Query | Current member profile |
| `myMembership` | Query | Current membership + plan |
| `myVehicles` | Query | Member's vehicles |
| `washHistory` | Query | Paginated redemption history |
| `subscribe` | Mutation | Start Stripe checkout for a plan |
| `pauseMembership` | Mutation | Pause membership (max 30 days) |
| `cancelMembership` | Mutation | Cancel at period end |
| `generateRedemptionCode` | Mutation | Generate wash code + QR |
| `addVehicle` | Mutation | Add a vehicle |
| `removeVehicle` | Mutation | Remove a vehicle |
| `submitRating` | Mutation | Rate a completed wash (1-5 stars) |
| `reportIssue` | Mutation | File a dispute on a redemption |

### Operator API (REST at `/v1/*`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/redemptions/validate` | Validate a member's wash code |
| GET | `/v1/redemptions` | Operator's redemption history |
| PUT | `/v1/locations/:id/profile` | Update location details |
| PATCH | `/v1/locations/:id/status` | Change location status |
| GET | `/v1/locations` | List operator's locations |
| GET | `/v1/analytics/dashboard` | Dashboard stats (redemptions, revenue, ratings) |
| GET | `/v1/payouts` | Payout history |
| POST | `/v1/disputes` | Report a dispute |
| GET | `/v1/disputes` | List disputes for operator |
| PATCH | `/v1/disputes/:id/status` | Update dispute status |
| POST | `/v1/staff` | Add scanner staff |
| DELETE | `/v1/staff/:id` | Remove staff (invalidates sessions) |
| GET | `/v1/staff` | List operator staff |
| PATCH | `/v1/staff/:id/role` | Change staff role |

---

## Database Schema

13 models across the membership lifecycle:

| Model | Purpose |
|-------|---------|
| `User` | Authentication (email, passwordHash, role) |
| `Member` | Consumer profile (linked to User) |
| `Vehicle` | Member's registered vehicles |
| `Plan` | Subscription tiers (Basic/Plus/Premium x Monthly/Annual) |
| `Membership` | Active subscription (status, washes remaining, rollover) |
| `Operator` | Business profile (linked to User) |
| `OperatorStaff` | Scanner staff (linked to Operator) |
| `Location` | Car wash locations with coordinates |
| `Redemption` | Wash codes (generate/validate/expire) |
| `Rating` | Post-wash ratings (1-5 stars) |
| `Dispute` | Quality/damage/service issues |
| `Payout` | Operator revenue payouts (70/30 split) |
| `RefreshToken` | JWT refresh token storage |

Inspect the full schema: `server/prisma/schema.prisma`

Browse data locally: `cd server && npx prisma studio`

---

## Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Membership Reset | Daily midnight | Reset `washesRemaining` for new billing periods; apply rollover (capped at 1 month's allocation) |
| Pause Resume | Hourly | Auto-resume memberships where `pausedUntil` has passed |
| Expired Codes | Every 5 minutes | Mark PENDING redemption codes past `expiresAt` as EXPIRED |
| Payout Calculation | Monday 11:59 PM | Calculate operator payouts for the past week (70% of per-wash fee, $20 minimum) |

---

## Deployment (AWS)

Infrastructure is defined in `terraform/` for AWS deployment:

| Resource | Config |
|----------|--------|
| **VPC** | 2 AZ, public + private subnets, NAT gateway |
| **ECS Fargate** | Cluster + ALB with HTTPS (port 443) |
| **RDS PostgreSQL 15** | `db.t3.medium`, multi-AZ, 20 GB |
| **ElastiCache Redis 7** | `cache.t3.micro` |

### Deploy steps

1. Configure AWS credentials and Terraform backend:

```bash
cd terraform
```

2. Update `variables.tf` with your values (region, DB credentials, domain).

3. Initialize and apply:

```bash
terraform init
terraform plan
terraform apply
```

4. After infrastructure is created:
   - Build and push the server Docker image to ECR
   - Create an ECS task definition and service (not yet in Terraform, see below)
   - Deploy the operator dashboard to Vercel or the same ECS cluster
   - Configure Stripe webhook endpoint to your production URL
   - Set all environment variables in ECS task definition

### Production environment variables

All variables from `server/.env.example` must be set in your ECS task definition or deployment platform, with production-grade values:

- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Use cryptographically strong secrets (min 64 chars)
- `DATABASE_URL` - Point to RDS instance
- `REDIS_URL` - Point to ElastiCache endpoint
- `STRIPE_SECRET_KEY` - Use live Stripe key (`sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` - Configure for production webhook endpoint
- `FRONTEND_URL` - Your production operator dashboard URL
- `NODE_ENV=production` - Disables GraphQL Playground

---

## What's Remaining

### Security Fixes (Pre-Production)

- [ ] **JWT logout decode** - `auth.controller.ts:43-46` manually decodes JWT without signature verification; should use `req.user` from the validated guard
- [ ] **Auth rate limiting** - Add stricter `@Throttle()` on `/auth/login`, `/auth/register`, `/auth/refresh` (currently only global 100/min)
- [ ] **JWT secret validation** - `config/configuration.ts` falls back to `'dev-jwt-secret'` silently; should throw in production
- [ ] **Missing DTOs** - `disputes.controller.ts` and `operator-staff.controller.ts` use inline types instead of validated DTOs with class-validator
- [ ] **CORS multi-origin** - `main.ts` only allows a single `FRONTEND_URL`; needs array for multiple clients
- [ ] **Stripe env vars in docker-compose** - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` not in `docker-compose.yml`

### Consumer App (Feature Gaps)

- [ ] **Plan browsing & subscription screen** - GraphQL queries/mutations exist but no UI
- [ ] **Vehicle management** - Profile shows vehicles but no add/remove/set-default actions
- [ ] **Membership management** - No pause/cancel buttons on profile screen
- [ ] **Rating submission** - No UI after completing a wash
- [ ] **Issue reporting** - No dispute filing UI
- [ ] **Device geolocation** - Hardcoded to Los Angeles; needs `expo-location` integration for real GPS

### Operator Dashboard (Feature Gaps)

- [ ] **Location edit page** - Server has `PUT /v1/locations/:id/profile` but no `locations/[id]/page.tsx`
- [ ] **Revenue charts** - `recharts` installed but not used on dashboard page
- [ ] **Data tables** - `@tanstack/react-table` installed but not used

### Infrastructure (Pre-Production)

- [ ] **ECS task definitions** - `terraform/ecs.tf` has cluster and ALB but no task definitions or services
- [ ] **IAM roles** - Missing ECS execution and task roles
- [ ] **RDS encryption** - Add `storage_encrypted = true` to `terraform/rds.tf`
- [ ] **Redis encryption** - Add `transit_encryption_enabled` and `at_rest_encryption_enabled`
- [ ] **Redis auth token** - No authentication configured
- [ ] **RDS deletion protection** - Add `deletion_protection = true` for production
- [ ] **Terraform state encryption** - Add `encrypt = true` and DynamoDB lock table

### Testing

- [ ] **Unit tests** - No `.spec.ts` files for any service (auth, memberships, redemptions, etc.)
- [ ] **Integration tests** - No database integration tests
- [ ] **E2E tests** - Only boilerplate `app.e2e-spec.ts` exists

### Code Quality

- [ ] **Enum string literal** - `analytics.service.ts:55` uses `'PENDING'` instead of `PayoutStatus.PENDING`
- [ ] **`process.env` direct access** - `memberships.service.ts:50` bypasses ConfigService
- [ ] **Dockerfile non-root user** - Server container runs as root
- [ ] **`.dockerignore`** - Missing for server (increases image size)
- [ ] **Unused dependencies** - Both client apps have `zod`, `react-hook-form`, `@hookform/resolvers` installed but unused

---

## License

UNLICENSED - Private repository.
