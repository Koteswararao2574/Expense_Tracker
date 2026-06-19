# 💰 ExpenseTracker — Full-Stack Application

A secure, production-ready expense tracking application built with:
- **Frontend**: React 18 + Vite + Tailwind CSS + React Query + Recharts
- **Backend**: Spring Boot 3.3 + Spring Security + Spring Data JPA
- **Database**: MySQL 8
- **Auth**: JWT (access + refresh tokens, silent refresh)

---

## Prerequisites

| Tool          | Version  |
|---------------|----------|
| Java          | 21+      |
| Maven         | 3.9+     |
| Node.js       | 20+      |
| MySQL         | 8+       |

---

## 1. Database Setup

```sql
CREATE DATABASE expense_tracker_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE expense_tracker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> The dev profile uses `ddl-auto: update` so tables are created automatically.
> The prod profile uses `ddl-auto: validate` — run migrations manually.

---

## 2. Backend Setup

```bash
cd expense-tracker-api

# Copy and configure
cp src/main/resources/application-dev.yml.example src/main/resources/application-dev.yml
# Edit DB credentials in application-dev.yml

# Run (dev profile active by default)
./mvnw spring-boot:run

# Or build jar
./mvnw clean package -DskipTests
java -jar target/expense-tracker-api-1.0.0.jar
```

### Key environment variables (production)

| Variable       | Description                        |
|----------------|------------------------------------|
| `DB_URL`       | JDBC connection string             |
| `DB_USERNAME`  | MySQL username                     |
| `DB_PASSWORD`  | MySQL password                     |
| `JWT_SECRET`   | 256-bit+ secret key for JWT signing|
| `CORS_ORIGINS` | Comma-separated allowed origins    |

```bash
# Production run
SPRING_PROFILES_ACTIVE=prod \
JWT_SECRET=your_very_long_secret_here \
DB_URL=jdbc:mysql://prod-host:3306/expense_tracker_prod \
DB_USERNAME=appuser \
DB_PASSWORD=strongpassword \
CORS_ORIGINS=https://yourfrontend.com \
java -jar target/expense-tracker-api-1.0.0.jar
```

### Swagger UI

Available at: `http://localhost:8080/swagger-ui.html`

---

## 3. Frontend Setup

```bash
cd expense-tracker-ui

# Install dependencies
npm install

# Start dev server (proxies /api to Spring Boot on :8080)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Open: `http://localhost:5173`

---

## 4. API Endpoints Reference

### Auth
```
POST /api/v1/auth/register      Register new user
POST /api/v1/auth/login         Login → { accessToken, refreshToken }
POST /api/v1/auth/refresh       Refresh access token
```

### Users
```
GET    /api/v1/users/me                  Get profile
PATCH  /api/v1/users/me                  Update profile
POST   /api/v1/users/me/change-password  Change password
```

### Transactions
```
GET    /api/v1/transactions          List (paginated, ?page=0&size=20)
GET    /api/v1/transactions/{id}     Get one
POST   /api/v1/transactions          Create
PUT    /api/v1/transactions/{id}     Update
DELETE /api/v1/transactions/{id}     Delete
```

### Budgets
```
GET    /api/v1/budgets          List with live status
POST   /api/v1/budgets          Create budget
DELETE /api/v1/budgets/{id}     Delete
```

### Analytics
```
GET /api/v1/analytics/categories?from=2024-01-01&to=2024-01-31
GET /api/v1/analytics/trend?months=12
```

### Recurring
```
GET    /api/v1/recurring             List rules
POST   /api/v1/recurring             Create rule
PATCH  /api/v1/recurring/{id}/toggle Toggle active/inactive
DELETE /api/v1/recurring/{id}        Delete rule
```

### Categories
```
GET    /api/v1/categories        List all (system + user's own)
POST   /api/v1/categories        Create custom category
DELETE /api/v1/categories/{id}   Delete custom category
```

### Currencies
```
GET /api/v1/currencies                               List all
GET /api/v1/currencies/convert?amount=100&from=USD&to=INR
```

### Export
```
GET /api/v1/export/csv?from=2024-01-01&to=2024-01-31
GET /api/v1/export/excel?from=2024-01-01&to=2024-01-31
```

---

## 5. Architecture Decisions

| Decision                  | Choice                         | Reason                                      |
|---------------------------|--------------------------------|---------------------------------------------|
| Auth storage              | `localStorage` (tokens)        | Simple SPA; use httpOnly cookies for higher security |
| Token refresh             | Silent (Axios interceptor)     | Seamless UX, queue concurrent 401s          |
| State management          | React Query + Zustand          | Server state vs. UI state separation        |
| DTO mapping               | Static factory methods         | Simple, readable, no extra dep              |
| Budget alerts             | Synchronous post-save check    | Upgrade to async/WebSocket as scale grows   |
| Recurring job             | `@Scheduled` cron              | Simple; migrate to Quartz for distributed   |
| Currency rates            | Static DB seed                 | Integrate OpenExchangeRates API for live rates |
| Password hashing          | BCrypt strength 12             | Industry standard, configurable cost factor |
| Pagination                | Spring Data `Pageable`         | Zero-boilerplate, consistent API contract   |

---

## 6. Security Checklist

- [x] Passwords hashed with BCrypt (strength 12)
- [x] JWT signed with HMAC-SHA256, short-lived access tokens (15 min)
- [x] Refresh token rotation on every use
- [x] CORS restricted to configured origins only
- [x] CSRF disabled (stateless JWT API)
- [x] Input validated with JSR-380 (`@Valid`) on all endpoints
- [x] Ownership enforced — every query scoped to `userId`
- [x] `ddl-auto: validate` in production (no auto schema changes)
- [x] Sensitive config via environment variables
- [ ] Rate limiting (add Spring Cloud Gateway or Bucket4j)
- [ ] HTTPS enforced (configure in production reverse proxy)

---

## 7. Project Structure

```
expense-tracker/
├── backend/   → Spring Boot API
└── frontend/  → React + Vite SPA
```

See `ARCHITECTURE.md` for the full directory tree.
