# Hostel Management System

Full-stack Hostel Management System with:

- Frontend: React (hooks), React Router, Axios, plain CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt password hashing

## Project Structure

```text
Hostelapp/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    scripts/
    server.js
  frontend/
    src/
      components/
      pages/
      services/
      App.js
      App.jsx
```

## Backend Setup

1. Go to backend:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
copy .env.example .env
```

4. Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Open new terminal and go to frontend:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
copy .env.example .env
```

4. Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Seed Sample Data

After backend `.env` is set:

```bash
cd backend
npm run seed
```

Seed creates:

- Admin user: `admin@hostel.com`
- Password: `admin123`
- Sample rooms, tenants, payments, complaints, and expenses

## Implemented API Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`

### Tenants

- `GET /api/tenants` (supports pagination, search, unpaidMonth filter)
- `POST /api/tenants`
- `PUT /api/tenants/:id`
- `DELETE /api/tenants/:id`

### Rooms

- `GET /api/rooms`
- `POST /api/rooms`
- `PUT /api/rooms/:id` (supports room update + tenant assignment)

### Payments

- `GET /api/payments` (supports status/month/unpaidOnly; returns monthly summary)
- `POST /api/payments`

### Expenses

- `GET /api/expenses` (supports from/to/category filters; returns daily/weekly/monthly summary)
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Complaints

- `GET /api/complaints`
- `POST /api/complaints` (public for tenant complaint creation)
- `PUT /api/complaints/:id`

### Dashboard

- `GET /api/dashboard/stats`

## Notes

- All admin endpoints are JWT-protected via `Authorization: Bearer <token>`.
- Room occupancy is synchronized when tenant is added/updated/deleted.
- Payment records are upserted by tenant + month.
- Basic error handler and not-found middleware are included.
