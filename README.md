# Attendance Management System

A full-stack attendance tracking application with role-based access for Admin and Employee users.

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, JWT, Mongoose
- Database: MongoDB
- Containerization: Docker, Docker Compose, Nginx

## Features

- User registration and login
- JWT-based protected APIs
- Role-based authorization (`Admin`, `Employee`)
- Mark attendance and view personal attendance
- Monthly attendance summary
- Leave application and leave status workflow
- Admin attendance management
- Admin leave approval/rejection
- Admin user management

## Project Structure

```text
Attendance Management System/
	backend/
		src/
			controllers/
			middlewares/
			models/
			routes/
			utils/
		scripts/
			markAbsent.js
			fixPresentAndHalfDay.js
		index.js
		docker-compose.yml
	frontend/
		src/
			api/
			pages/
			styles/
		nginx.conf
	README.md
```

## API Base Paths

- Auth: `/api/auth`
- Attendance: `/api/attendance`
- Leave: `/api/leave`
- Users: `/api/user`

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Attendance

- `POST /api/attendance/mark` (protected)
- `GET /api/attendance/my` (protected)
- `GET /api/attendance/monthly-summary` (protected)
- `GET /api/attendance/all` (admin)
- `PUT /api/attendance/update/:id` (admin)

### Leave

- `POST /api/leave/apply` (protected)
- `GET /api/leave/my` (protected)
- `GET /api/leave/all` (admin)
- `PUT /api/leave/status/:id` (admin)

### User

- `GET /api/user/me` (protected)
- `GET /api/user/all` (admin)
- `POST /api/user/role/:id` (admin)
- `PATCH /api/user/deactivate/:id` (admin)
- `DELETE /api/user/:id` (admin)

## Environment Variables

Backend uses these environment variables:

- `PORT` (default: `5000`)
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

Example `.env` for `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/company
JWT_SECRET=replace_with_strong_secret
FRONTEND_URL=http://localhost:5173
```

Env file usage:

- Local run (`npm start`, script execution): uses `backend/.env` via `dotenv.config()`.
- Docker run (`docker compose up` from `backend/`): uses `backend/.env.docker` through `docker-compose.yml` `env_file`.

## Run With Docker (Recommended)

From the `backend/` directory:

```bash
docker compose up -d --build
```

Services:

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`

Stop services:

```bash
docker compose down
```

## Run Locally (Without Docker)

### 1) Start MongoDB

Run MongoDB locally and ensure `MONGO_URI` points to it.

### 2) Start backend

```bash
cd backend
npm install
node index.js 
```

Backend runs on `http://localhost:5000`.

### 3) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Important note for local dev:

- Frontend Axios base URL is `/api`.
- For local split ports (`5173` and `5000`), configure a Vite proxy or use Docker/Nginx setup where `/api` is proxied automatically.

## Backend Utility Scripts

These scripts are in `backend/scripts/` and are backend-only utilities.

- `markAbsent.js`: marks users absent or on leave automatically for the day.
- `fixPresentAndHalfDay.js`: recalculates `present` vs `half-day` based on working hours.

Run manually:

```bash
cd backend
npm run attendance:mark-absent
npm run attendance:fix
```

## Authentication Flow

- Login returns a JWT token.
- Frontend stores token in `localStorage`.
- Axios interceptor sends `Authorization: Bearer <token>` for protected requests.

## CORS

Backend allows these origins:

- `FRONTEND_URL` from environment
- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Troubleshooting

- `401 Unauthorized` on login: check email/password and user existence in DB.
- `500 Internal Server Error`: check backend logs for stack trace.
- Frontend API not connecting in local mode: add Vite proxy or run via Docker setup.
- CORS issues: verify `FRONTEND_URL` and frontend origin.

## Future Improvements

- Add tests for controllers and middleware
- Add refresh-token/session invalidation flow
- Add input validation layer (Joi/Zod)
- Add automated scheduler for utility scripts