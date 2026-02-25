# GreenCampus Rooms

A campus room management system built with **Spring Boot 3.4** (backend) and **React 18 + Vite** (frontend).

## Features

- **Room Management** — CRUD operations, visual room layouts, health scores
- **Asset Tracking** — PCs, projectors, teacher PCs with status management
- **Ticketing** — Maintenance tickets with priority/status tracking
- **Schedule** — Weekly timetable grid, CSV import
- **Teacher Absence** — Declare absences, free room suggestions
- **Authentication** — JWT-based login with role-based access (Admin, Technician, Staff)
- **Admin Tools** — Room/user management, system overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.4, Spring Data JPA |
| Database | PostgreSQL (prod), H2 in-memory (dev) |
| Migrations | Flyway |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | TanStack Query |
| HTTP | Axios |
| Auth | JWT (HMAC-SHA256) |

## Quick Start

### Prerequisites
- Java 21+
- Node.js 18+

### 1. Start Backend (H2 dev mode)
```bash
cd backend
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```
Backend starts on **http://localhost:8080**.

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on **http://localhost:5173** (or next available port).

### 3. Login
Navigate to `http://localhost:5173/login` and use one of the demo accounts:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin — Full access |
| `tech` | `tech123` | Technician |
| `staff` | `staff123` | Teaching Staff |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Dashboard KPIs |
| GET | `/api/rooms` | List rooms (supports `?q=`, `?type=`, `?status=`) |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/{id}` | Update room |
| DELETE | `/api/rooms/{id}` | Delete room |
| GET | `/api/rooms/{id}` | Room detail |
| PATCH | `/api/assets/{id}/status` | Toggle asset status |
| GET | `/api/tickets` | List tickets |
| POST | `/api/tickets` | Create ticket |
| PUT | `/api/tickets/{id}` | Update ticket |
| DELETE | `/api/tickets/{id}` | Delete ticket |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/sessions/room/{id}` | Sessions by room |
| POST | `/api/sessions/import` | Import CSV |
| DELETE | `/api/sessions/room/{id}` | Clear room sessions |
| GET | `/api/absences` | List absences |
| POST | `/api/absences` | Declare absence |
| DELETE | `/api/absences/{id}` | Delete absence |
| GET | `/api/absences/free-rooms` | Free room suggestions |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Validate token |

## Production Database

To run with PostgreSQL, set these environment variables:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/greencampus
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=yourpassword
```

Then start without the dev profile:
```bash
./mvnw spring-boot:run
```

## Project Structure

```
backend/
├── src/main/java/com/greencampus/
│   ├── model/          # JPA entities (Room, Asset, Ticket, Session, Absence, User)
│   ├── repository/     # Spring Data repositories
│   ├── service/        # Business logic
│   ├── controller/     # REST controllers
│   ├── dto/            # Data transfer objects
│   ├── security/       # JWT utilities
│   └── config/         # WebConfig, DataSeeder
└── src/main/resources/
    ├── db/migration/   # Flyway migrations (V1-V6)
    └── application*.yml

frontend/
├── src/
│   ├── api/            # Axios client + API functions
│   ├── components/     # Reusable components (AuthGuard, AddRoomModal, etc.)
│   ├── layouts/        # DashboardLayout with sidebar
│   ├── pages/          # Route pages
│   └── types/          # TypeScript interfaces
└── vite.config.ts      # Dev server + API proxy
```

## Seed Data

In dev mode, the application automatically seeds:
- **5 rooms** (A1, LAB-A1, AMPHI-01, B2, LAB-B1) with assets
- **5 tickets** across different rooms
- **9 sessions** across the weekly schedule
- **3 users** (admin, tech, staff)
