# GreenCampus Rooms — MakeGuide

## Executive Summary
GreenCampus Rooms is a university operations dashboard used to manage classrooms, labs, and amphitheatres, monitor equipment health (projectors and PCs), track maintenance tickets, and review teaching schedules. It combines a Java/Spring Boot backend with a React/TypeScript frontend so staff can quickly see room availability and condition, technicians can handle incidents, and administrators can manage rooms, permissions, and audit activity.

## Table of Contents
- [What This Product Does](#what-this-product-does)
- [Who Uses It](#who-uses-it)
- [Core Concepts (Plain Language)](#core-concepts-plain-language)
- [Feature List by Role](#feature-list-by-role)
- [System Architecture](#system-architecture)
- [Tech Stack and Why It Was Chosen](#tech-stack-and-why-it-was-chosen)
- [Repo Structure (JSON)](#repo-structure-json)
- [BACKEND (Java / Spring Boot)](#backend-java--spring-boot)
- [FRONTEND (React / TypeScript)](#frontend-react--typescript)
- [Database, Migrations, and Domain Model](#database-migrations-and-domain-model)
- [API Guide (Key Endpoints)](#api-guide-key-endpoints)
- [Permission Model (Admin / Technician / Staff)](#permission-model-admin--technician--staff)
- [How to Run Locally](#how-to-run-locally)
- [How to Demo (2 Minutes)](#how-to-demo-2-minutes)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

## What This Product Does
GreenCampus Rooms helps a school or university keep teaching rooms usable and organized. In one place, teams can see which rooms exist, what equipment is inside each room, which devices are broken, what maintenance work is still open, and what the teaching schedule looks like. The goal is to reduce classroom disruptions and make room operations easier to manage.

## Who Uses It
### Admin
Administrators manage room records, review system data, access admin tools, and inspect audit logs. They have the broadest visibility and control.

### Technician
Technicians monitor rooms and equipment status, create maintenance tickets, and update ticket status while working on issues. They can view room layouts but do not manage room definitions.

### Staff
Teaching staff use the app mainly for visibility: they can view rooms, room details, and ticket information, but they do not modify operational data.

## Core Concepts (Plain Language)
### Rooms
A room is a physical teaching space (classroom, computer lab, or amphitheatre). Each room has basic information such as code, capacity, status (open/closed), and notes.

### Assets
Assets are the devices inside rooms that affect usability, such as a projector, a teacher PC, and optional PCs on student tables. Each asset can be marked as working or broken.

### Tickets
A ticket is a maintenance task created when something is wrong (for example, a broken projector or PC). Tickets help the support team track what still needs attention and what has been resolved.

### Schedule / Planning Import
The app can import a timetable (CSV-based in the current codebase) so teams can see planned room usage across the week.

### Room Occupancy and Free-Room Logic
Based on sessions and teacher absences, the backend can compute occupancy and suggest rooms that are free during a selected time window.

### Room Layout Visualization
Each room can be displayed as a top-down layout, including student tables and table PCs. This makes it easier to identify where broken equipment is located.

## Feature List by Role
### Admin
- View all dashboard modules and data
- Create, update, and delete rooms (room inventory management)
- Manage room-related assets and statuses (as implemented in the current code)
- View, update, and delete tickets
- Access schedule and absence management tools
- Access admin tools and audit log history

### Technician
- View rooms and room details (including visual layouts)
- View tickets
- Create maintenance tickets
- Update ticket status while handling incidents
- Cannot manage room definitions or delete tickets
- Cannot access admin-only pages

### Staff
- View rooms and room details
- View tickets and ticket details
- Read-only experience (no create/update/delete actions)
- Cannot access admin-only pages

## System Architecture
```mermaid
flowchart LR
    U[Users: Admin / Technician / Staff] --> F[React Frontend (Vite)]
    F -->|HTTP /api| B[Spring Boot Backend]
    B --> S[Services & Business Rules]
    S --> R[Spring Data JPA Repositories]
    R --> D[(PostgreSQL / H2 in Dev)]
    B --> M[Flyway Migrations]
```

## Tech Stack and Why It Was Chosen
### Backend (Java / Spring Boot)
- **Java 21**: A modern long-term-support Java version that is stable for business systems.
- **Spring Boot (Web)**: Speeds up building REST APIs and reduces setup work.
- **Spring Data JPA / Hibernate**: Makes database access easier using Java classes (entities) instead of writing raw SQL for every action.
- **Jackson**: Converts Java objects to/from JSON so the frontend can communicate with the backend.
- **Flyway**: Applies database schema changes in a controlled order using migration files.
- **H2 (development)**: Fast in-memory database for local development and demos.
- **PostgreSQL (production/runtime target)**: Reliable relational database for real deployments.

Why this backend stack fits this project:
- The app is data-heavy (rooms, assets, tickets, sessions), so a structured relational backend is a good fit.
- Spring Boot + JPA is a common, maintainable choice for internal university/enterprise dashboards.

### Frontend (React / TypeScript)
- **React 18**: Builds an interactive dashboard UI with reusable components.
- **TypeScript**: Reduces UI bugs by giving clear data shapes for rooms, tickets, sessions, and audit logs.
- **Vite**: Fast local development server and frontend build tool.
- **TanStack Query**: Manages API fetching, caching, and refresh behavior for dashboard data.
- **Axios**: Simplifies API calls and request/response interceptors (for auth tokens and error handling).
- **Tailwind CSS**: Speeds up consistent styling and layout work.
- **lucide-react**: Lightweight icon set used across the dashboard UI.

Why this frontend stack fits this project:
- Dashboard apps need many screens with shared state and repeated API calls.
- React + Query + TypeScript improves clarity and reduces accidental UI regressions.

### Database Stack
- **PostgreSQL**: Main persistent database for production-style runs.
- **H2 (dev profile)**: Used locally for quick startup without needing a separate database server.

Why this is practical:
- Teams can demo quickly with H2, then use PostgreSQL for a real environment with the same domain model.

### DevOps / Local Run Options
- **Docker Compose**: Provides a full stack run option (PostgreSQL + backend + frontend) with one command.
- **Separate local processes**: Developers can run backend and frontend independently for faster debugging.

Why both options matter:
- Docker Compose helps non-developers and demo environments.
- Separate runs are faster during day-to-day coding and troubleshooting.

## Repo Structure (JSON)

```json
{
  "name": "repo-root",
  "type": "dir",
  "sizeBytes": 0,
  "children": [
    {
      "name": ".git",
      "type": "dir",
      "sizeBytes": 0,
      "summary": "Git metadata/history directory (compressed here; not part of application source).",
      "children": []
    },
    {
      "name": ".vscode",
      "type": "dir",
      "sizeBytes": 0,
      "summary": "Editor workspace settings (compressed here; optional for development).",
      "children": []
    },
    {
      "name": "backend",
      "type": "dir",
      "sizeBytes": 0,
      "children": [
        {
          "name": "src",
          "type": "dir",
          "sizeBytes": 0,
          "children": [
            {
              "name": "main",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "java",
                  "type": "dir",
                  "sizeBytes": 0,
                  "children": [
                    {
                      "name": "com",
                      "type": "dir",
                      "sizeBytes": 0,
                      "children": [
                        {
                          "name": "greencampus",
                          "type": "dir",
                          "sizeBytes": 0,
                          "children": [
                            {
                              "name": "config",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "DataSeeder.java",
                                  "type": "file",
                                  "sizeBytes": 13244,
                                  "summary": "Seeds demo rooms, assets, tickets, sessions, and users so the app is usable immediately in development."
                                },
                                {
                                  "name": "WebConfig.java",
                                  "type": "file",
                                  "sizeBytes": 874,
                                  "summary": "Configures web-related behavior such as CORS and frontend/backend communication settings."
                                }
                              ]
                            },
                            {
                              "name": "controller",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "AbsenceController.java",
                                  "type": "file",
                                  "sizeBytes": 3617,
                                  "summary": "REST controller for absence endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "AssetController.java",
                                  "type": "file",
                                  "sizeBytes": 1317,
                                  "summary": "REST controller for asset endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "AuditLogController.java",
                                  "type": "file",
                                  "sizeBytes": 1581,
                                  "summary": "REST controller for auditlog endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "AuthController.java",
                                  "type": "file",
                                  "sizeBytes": 2730,
                                  "summary": "REST controller for auth endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "HealthController.java",
                                  "type": "file",
                                  "sizeBytes": 518,
                                  "summary": "REST controller for health endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "RoomController.java",
                                  "type": "file",
                                  "sizeBytes": 5173,
                                  "summary": "REST controller for room endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "SessionController.java",
                                  "type": "file",
                                  "sizeBytes": 4098,
                                  "summary": "REST controller for session endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "StatsController.java",
                                  "type": "file",
                                  "sizeBytes": 1547,
                                  "summary": "REST controller for stats endpoints; receives HTTP requests and returns JSON responses."
                                },
                                {
                                  "name": "TicketController.java",
                                  "type": "file",
                                  "sizeBytes": 4212,
                                  "summary": "REST controller for ticket endpoints; receives HTTP requests and returns JSON responses."
                                }
                              ]
                            },
                            {
                              "name": "dto",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "AbsenceDTO.java",
                                  "type": "file",
                                  "sizeBytes": 507,
                                  "summary": "Data transfer object used to send/receive absence data through the API."
                                },
                                {
                                  "name": "AssetDTO.java",
                                  "type": "file",
                                  "sizeBytes": 371,
                                  "summary": "Data transfer object used to send/receive asset data through the API."
                                },
                                {
                                  "name": "AssetStatusUpdateDTO.java",
                                  "type": "file",
                                  "sizeBytes": 230,
                                  "summary": "Data transfer object used to send/receive assetstatusupdate data through the API."
                                },
                                {
                                  "name": "FreeRoomDTO.java",
                                  "type": "file",
                                  "sizeBytes": 267,
                                  "summary": "Data transfer object used to send/receive freeroom data through the API."
                                },
                                {
                                  "name": "RoomCreateDTO.java",
                                  "type": "file",
                                  "sizeBytes": 602,
                                  "summary": "Data transfer object used to send/receive roomcreate data through the API."
                                },
                                {
                                  "name": "RoomDetailDTO.java",
                                  "type": "file",
                                  "sizeBytes": 864,
                                  "summary": "Data transfer object used to send/receive roomdetail data through the API."
                                },
                                {
                                  "name": "RoomListDTO.java",
                                  "type": "file",
                                  "sizeBytes": 818,
                                  "summary": "Data transfer object used to send/receive roomlist data through the API."
                                },
                                {
                                  "name": "SessionDTO.java",
                                  "type": "file",
                                  "sizeBytes": 443,
                                  "summary": "Data transfer object used to send/receive session data through the API."
                                },
                                {
                                  "name": "TicketCreateDTO.java",
                                  "type": "file",
                                  "sizeBytes": 316,
                                  "summary": "Data transfer object used to send/receive ticketcreate data through the API."
                                },
                                {
                                  "name": "TicketDTO.java",
                                  "type": "file",
                                  "sizeBytes": 549,
                                  "summary": "Data transfer object used to send/receive ticket data through the API."
                                }
                              ]
                            },
                            {
                              "name": "model",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "enums",
                                  "type": "dir",
                                  "sizeBytes": 0,
                                  "children": [
                                    {
                                      "name": "AssetStatus.java",
                                      "type": "file",
                                      "sizeBytes": 86,
                                      "summary": "Enum defining allowed assetstatus values used by backend models and APIs."
                                    },
                                    {
                                      "name": "AssetType.java",
                                      "type": "file",
                                      "sizeBytes": 100,
                                      "summary": "Enum defining allowed assettype values used by backend models and APIs."
                                    },
                                    {
                                      "name": "DayOfWeekEnum.java",
                                      "type": "file",
                                      "sizeBytes": 135,
                                      "summary": "Enum defining allowed dayofweek values used by backend models and APIs."
                                    },
                                    {
                                      "name": "RoomStatus.java",
                                      "type": "file",
                                      "sizeBytes": 82,
                                      "summary": "Enum defining allowed roomstatus values used by backend models and APIs."
                                    },
                                    {
                                      "name": "RoomType.java",
                                      "type": "file",
                                      "sizeBytes": 85,
                                      "summary": "Enum defining allowed roomtype values used by backend models and APIs."
                                    },
                                    {
                                      "name": "TicketPriority.java",
                                      "type": "file",
                                      "sizeBytes": 84,
                                      "summary": "Enum defining allowed ticketpriority values used by backend models and APIs."
                                    },
                                    {
                                      "name": "TicketStatus.java",
                                      "type": "file",
                                      "sizeBytes": 99,
                                      "summary": "Enum defining allowed ticketstatus values used by backend models and APIs."
                                    },
                                    {
                                      "name": "UserRole.java",
                                      "type": "file",
                                      "sizeBytes": 92,
                                      "summary": "Enum defining allowed userrole values used by backend models and APIs."
                                    }
                                  ]
                                },
                                {
                                  "name": "Absence.java",
                                  "type": "file",
                                  "sizeBytes": 936,
                                  "summary": "JPA entity representing absence records stored in the relational database."
                                },
                                {
                                  "name": "Asset.java",
                                  "type": "file",
                                  "sizeBytes": 847,
                                  "summary": "JPA entity representing asset records stored in the relational database."
                                },
                                {
                                  "name": "AuditLog.java",
                                  "type": "file",
                                  "sizeBytes": 1805,
                                  "summary": "JPA entity representing auditlog records stored in the relational database."
                                },
                                {
                                  "name": "Room.java",
                                  "type": "file",
                                  "sizeBytes": 1024,
                                  "summary": "JPA entity representing room records stored in the relational database."
                                },
                                {
                                  "name": "Session.java",
                                  "type": "file",
                                  "sizeBytes": 896,
                                  "summary": "JPA entity representing session records stored in the relational database."
                                },
                                {
                                  "name": "Ticket.java",
                                  "type": "file",
                                  "sizeBytes": 1262,
                                  "summary": "JPA entity representing ticket records stored in the relational database."
                                },
                                {
                                  "name": "User.java",
                                  "type": "file",
                                  "sizeBytes": 621,
                                  "summary": "JPA entity representing user records stored in the relational database."
                                }
                              ]
                            },
                            {
                              "name": "repository",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "AbsenceRepository.java",
                                  "type": "file",
                                  "sizeBytes": 490,
                                  "summary": "Spring Data repository for absence persistence queries and database access."
                                },
                                {
                                  "name": "AssetRepository.java",
                                  "type": "file",
                                  "sizeBytes": 629,
                                  "summary": "Spring Data repository for asset persistence queries and database access."
                                },
                                {
                                  "name": "AuditLogRepository.java",
                                  "type": "file",
                                  "sizeBytes": 297,
                                  "summary": "Spring Data repository for auditlog persistence queries and database access."
                                },
                                {
                                  "name": "RoomRepository.java",
                                  "type": "file",
                                  "sizeBytes": 997,
                                  "summary": "Spring Data repository for room persistence queries and database access."
                                },
                                {
                                  "name": "SessionRepository.java",
                                  "type": "file",
                                  "sizeBytes": 1241,
                                  "summary": "Spring Data repository for session persistence queries and database access."
                                },
                                {
                                  "name": "TicketRepository.java",
                                  "type": "file",
                                  "sizeBytes": 1200,
                                  "summary": "Spring Data repository for ticket persistence queries and database access."
                                },
                                {
                                  "name": "UserRepository.java",
                                  "type": "file",
                                  "sizeBytes": 285,
                                  "summary": "Spring Data repository for user persistence queries and database access."
                                }
                              ]
                            },
                            {
                              "name": "security",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "AuthContext.java",
                                  "type": "file",
                                  "sizeBytes": 613,
                                  "summary": "Builds a typed authenticated user context from the Authorization header for controller-level role checks."
                                },
                                {
                                  "name": "AuthenticatedUser.java",
                                  "type": "file",
                                  "sizeBytes": 149,
                                  "summary": "Small record that carries authenticated username and role inside backend request handling."
                                },
                                {
                                  "name": "JwtUtil.java",
                                  "type": "file",
                                  "sizeBytes": 4356,
                                  "summary": "Creates and validates JWT tokens and extracts username/role claims for authentication checks."
                                }
                              ]
                            },
                            {
                              "name": "service",
                              "type": "dir",
                              "sizeBytes": 0,
                              "children": [
                                {
                                  "name": "AbsenceService.java",
                                  "type": "file",
                                  "sizeBytes": 4652,
                                  "summary": "Business logic service for absence workflows and rules between controllers and repositories."
                                },
                                {
                                  "name": "AuditLogService.java",
                                  "type": "file",
                                  "sizeBytes": 2220,
                                  "summary": "Business logic service for auditlog workflows and rules between controllers and repositories."
                                },
                                {
                                  "name": "RoomService.java",
                                  "type": "file",
                                  "sizeBytes": 13737,
                                  "summary": "Business logic service for room workflows and rules between controllers and repositories."
                                },
                                {
                                  "name": "SessionService.java",
                                  "type": "file",
                                  "sizeBytes": 4978,
                                  "summary": "Business logic service for session workflows and rules between controllers and repositories."
                                },
                                {
                                  "name": "TicketService.java",
                                  "type": "file",
                                  "sizeBytes": 3039,
                                  "summary": "Business logic service for ticket workflows and rules between controllers and repositories."
                                }
                              ]
                            },
                            {
                              "name": "GreenCampusApplication.java",
                              "type": "file",
                              "sizeBytes": 328,
                              "summary": "Spring Boot entry point that starts the backend application and wires auto-configuration."
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "name": "resources",
                  "type": "dir",
                  "sizeBytes": 0,
                  "children": [
                    {
                      "name": "db",
                      "type": "dir",
                      "sizeBytes": 0,
                      "children": [
                        {
                          "name": "migration",
                          "type": "dir",
                          "sizeBytes": 0,
                          "children": [
                            {
                              "name": "V1__init.sql",
                              "type": "file",
                              "sizeBytes": 127,
                              "summary": "Initial Flyway migration creating the base schema foundation used by later migrations."
                            },
                            {
                              "name": "V2__rooms_and_assets.sql",
                              "type": "file",
                              "sizeBytes": 942,
                              "summary": "Creates room and asset tables used for room inventory and equipment tracking."
                            },
                            {
                              "name": "V3__tickets.sql",
                              "type": "file",
                              "sizeBytes": 595,
                              "summary": "Creates ticket tables for maintenance issue tracking and workflow status management."
                            },
                            {
                              "name": "V4__sessions.sql",
                              "type": "file",
                              "sizeBytes": 517,
                              "summary": "Creates session/schedule tables used for timetable imports and occupancy calculations."
                            },
                            {
                              "name": "V5__absences.sql",
                              "type": "file",
                              "sizeBytes": 518,
                              "summary": "Creates teacher absence tables used to track cancellations and free-room suggestions."
                            },
                            {
                              "name": "V6__users.sql",
                              "type": "file",
                              "sizeBytes": 251,
                              "summary": "Creates user/auth tables for login accounts and roles."
                            },
                            {
                              "name": "V7__audit_log.sql",
                              "type": "file",
                              "sizeBytes": 306,
                              "summary": "Initial audit log table migration for tracking admin actions."
                            },
                            {
                              "name": "V8__audit_log_rich_fields.sql",
                              "type": "file",
                              "sizeBytes": 613,
                              "summary": "Extends audit log schema with richer actor, action, and before/after JSON fields."
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "application-dev.yml",
                      "type": "file",
                      "sizeBytes": 476,
                      "summary": "Development profile configuration using H2 in-memory database for fast local startup."
                    },
                    {
                      "name": "application.yml",
                      "type": "file",
                      "sizeBytes": 582,
                      "summary": "Default backend runtime configuration (database, JPA, Flyway, server) for PostgreSQL-style environments."
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "target",
          "type": "dir",
          "sizeBytes": 0,
          "summary": "Generated backend build artifacts (JARs/classes); compressed here because they are not source code.",
          "children": []
        },
        {
          "name": ".gitignore",
          "type": "file",
          "sizeBytes": 27,
          "summary": "Project file required for build, runtime, or documentation."
        },
        {
          "name": "Dockerfile",
          "type": "file",
          "sizeBytes": 351,
          "summary": "Container build recipe for the corresponding backend or frontend service."
        },
        {
          "name": "mvnw",
          "type": "file",
          "sizeBytes": 10069,
          "summary": "Project file required for build, runtime, or documentation."
        },
        {
          "name": "pom.xml",
          "type": "file",
          "sizeBytes": 3096,
          "summary": "Backend Maven build file defining Java version and Spring/JPA/Flyway/PostgreSQL dependencies."
        }
      ]
    },
    {
      "name": "docs",
      "type": "dir",
      "sizeBytes": 0,
      "children": [
        {
          "name": "README.md",
          "type": "file",
          "sizeBytes": 166,
          "summary": "Primary project overview, features, tech stack, local startup steps, and demo credentials."
        }
      ]
    },
    {
      "name": "frontend",
      "type": "dir",
      "sizeBytes": 0,
      "children": [
        {
          "name": "dist",
          "type": "dir",
          "sizeBytes": 0,
          "summary": "Generated frontend production build output; compressed here because it is not maintained source code.",
          "children": []
        },
        {
          "name": "node_modules",
          "type": "dir",
          "sizeBytes": 0,
          "summary": "Third-party frontend dependencies installed by npm; compressed here because they are generated.",
          "children": []
        },
        {
          "name": "src",
          "type": "dir",
          "sizeBytes": 0,
          "children": [
            {
              "name": "api",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "client.ts",
                  "type": "file",
                  "sizeBytes": 5579,
                  "summary": "Axios API client plus typed request helpers for rooms, tickets, sessions, auth, and admin data."
                }
              ]
            },
            {
              "name": "components",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "AddRoomModal.tsx",
                  "type": "file",
                  "sizeBytes": 9563,
                  "summary": "Form modal used by admins to create or edit room records from the frontend."
                },
                {
                  "name": "AuthGuard.tsx",
                  "type": "file",
                  "sizeBytes": 247,
                  "summary": "Protects authenticated routes by redirecting users without a stored token to the login page."
                },
                {
                  "name": "RoleGuard.tsx",
                  "type": "file",
                  "sizeBytes": 568,
                  "summary": "Blocks access to admin-only/schedule routes for unauthorized roles and redirects safely."
                },
                {
                  "name": "RoomDetailErrorBoundary.tsx",
                  "type": "file",
                  "sizeBytes": 2101,
                  "summary": "Prevents a room detail runtime crash from causing a white screen by showing a fallback panel."
                },
                {
                  "name": "RoomLayout.tsx",
                  "type": "file",
                  "sizeBytes": 6849,
                  "summary": "Renders the visual top-down room layout with table PCs, projector, teacher PC, and status indicators."
                }
              ]
            },
            {
              "name": "layouts",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "DashboardLayout.tsx",
                  "type": "file",
                  "sizeBytes": 7386,
                  "summary": "Main shell layout with sidebar navigation, top bar, health indicator, and shared error toast area."
                }
              ]
            },
            {
              "name": "lib",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "auth.ts",
                  "type": "file",
                  "sizeBytes": 1106,
                  "summary": "Frontend auth helpers for reading/storing current user and JWT token in local storage."
                },
                {
                  "name": "permissions.ts",
                  "type": "file",
                  "sizeBytes": 1057,
                  "summary": "Centralized UI permission checks for Admin/Technician/Staff visibility and actions."
                }
              ]
            },
            {
              "name": "pages",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "AdminPage.tsx",
                  "type": "file",
                  "sizeBytes": 16256,
                  "summary": "Frontend page component for the admin screen in the dashboard."
                },
                {
                  "name": "LoginPage.tsx",
                  "type": "file",
                  "sizeBytes": 5372,
                  "summary": "Frontend page component for the login screen in the dashboard."
                },
                {
                  "name": "OverviewPage.tsx",
                  "type": "file",
                  "sizeBytes": 5244,
                  "summary": "Frontend page component for the overview screen in the dashboard."
                },
                {
                  "name": "RoomDetailPage.tsx",
                  "type": "file",
                  "sizeBytes": 15546,
                  "summary": "Frontend page component for the roomdetail screen in the dashboard."
                },
                {
                  "name": "RoomsPage.tsx",
                  "type": "file",
                  "sizeBytes": 13459,
                  "summary": "Frontend page component for the rooms screen in the dashboard."
                },
                {
                  "name": "SchedulePage.tsx",
                  "type": "file",
                  "sizeBytes": 22911,
                  "summary": "Frontend page component for the schedule screen in the dashboard."
                },
                {
                  "name": "TicketsPage.tsx",
                  "type": "file",
                  "sizeBytes": 17665,
                  "summary": "Frontend page component for the tickets screen in the dashboard."
                }
              ]
            },
            {
              "name": "types",
              "type": "dir",
              "sizeBytes": 0,
              "children": [
                {
                  "name": "audit.ts",
                  "type": "file",
                  "sizeBytes": 316,
                  "summary": "TypeScript types for audit log entries shown in the Admin page."
                },
                {
                  "name": "auth.ts",
                  "type": "file",
                  "sizeBytes": 266,
                  "summary": "Frontend auth helpers for reading/storing current user and JWT token in local storage."
                },
                {
                  "name": "room.ts",
                  "type": "file",
                  "sizeBytes": 2652,
                  "summary": "Core TypeScript types for rooms, assets, tickets, sessions, and absence-related frontend data."
                }
              ]
            },
            {
              "name": "App.tsx",
              "type": "file",
              "sizeBytes": 2002,
              "summary": "Top-level frontend route map connecting login, dashboard pages, and role-guarded screens."
            },
            {
              "name": "index.css",
              "type": "file",
              "sizeBytes": 1712,
              "summary": "Global styles and Tailwind-based theme definitions used across the UI."
            },
            {
              "name": "main.tsx",
              "type": "file",
              "sizeBytes": 663,
              "summary": "Frontend bootstrap file that mounts React, routing, and TanStack Query providers."
            },
            {
              "name": "vite-env.d.ts",
              "type": "file",
              "sizeBytes": 38,
              "summary": "Frontend source file used by the React application."
            }
          ]
        },
        {
          "name": ".gitignore",
          "type": "file",
          "sizeBytes": 25,
          "summary": "Project file required for build, runtime, or documentation."
        },
        {
          "name": "Dockerfile",
          "type": "file",
          "sizeBytes": 136,
          "summary": "Container build recipe for the corresponding backend or frontend service."
        },
        {
          "name": "index.html",
          "type": "file",
          "sizeBytes": 765,
          "summary": "Project file required for build, runtime, or documentation."
        },
        {
          "name": "package-lock.json",
          "type": "file",
          "sizeBytes": 206803,
          "summary": "Exact frontend dependency lockfile to reproduce installs consistently."
        },
        {
          "name": "package.json",
          "type": "file",
          "sizeBytes": 1538,
          "summary": "Frontend scripts and dependency list for React, Vite, Tailwind, and API/data libraries."
        },
        {
          "name": "postcss.config.js",
          "type": "file",
          "sizeBytes": 92,
          "summary": "PostCSS configuration used by Tailwind during frontend builds."
        },
        {
          "name": "tailwind.config.js",
          "type": "file",
          "sizeBytes": 836,
          "summary": "Tailwind theme configuration (colors, tokens, plugins) for the dashboard UI style."
        },
        {
          "name": "tsconfig.app.json",
          "type": "file",
          "sizeBytes": 751,
          "summary": "Project file required for build, runtime, or documentation."
        },
        {
          "name": "tsconfig.json",
          "type": "file",
          "sizeBytes": 751,
          "summary": "Project file required for build, runtime, or documentation."
        },
        {
          "name": "vite.config.ts",
          "type": "file",
          "sizeBytes": 445,
          "summary": "Vite dev/build configuration, including local API proxy settings for the frontend."
        }
      ]
    },
    {
      "name": "docker-compose.yml",
      "type": "file",
      "sizeBytes": 1530,
      "summary": "Local multi-container stack definition for PostgreSQL, backend API, and frontend app."
    },
    {
      "name": "README.md",
      "type": "file",
      "sizeBytes": 4328,
      "summary": "Primary project overview, features, tech stack, local startup steps, and demo credentials."
    }
  ]
}
```

## BACKEND (Java / Spring Boot)

### Purpose
The backend is the system of record for rooms, assets, tickets, schedules, absences, users, and audit logs. It exposes REST APIs under `/api/*`, applies role checks, computes derived values (like room health score), and reads/writes data to the database through JPA repositories.

### Backend Architecture (How It Is Organized)
The backend follows a standard layered structure:
- **Controllers**: Receive HTTP requests and return JSON responses.
- **Services**: Implement business rules and data transformations.
- **Repositories**: Run database queries through Spring Data JPA.
- **Entities (`model`)**: Java classes mapped to database tables.
- **DTOs**: API-specific payload shapes sent to the frontend.
- **Security utilities**: JWT creation/validation and role extraction helpers.
- **Config**: Bootstrapping, web config, and demo data seeding.

### Key Backend Folders and Files
- `backend/src/main/java/com/greencampus/controller` — REST endpoints by module
- `backend/src/main/java/com/greencampus/service` — business logic layer
- `backend/src/main/java/com/greencampus/repository` — persistence interfaces
- `backend/src/main/java/com/greencampus/model` — JPA entities and enums
- `backend/src/main/java/com/greencampus/dto` — API request/response objects
- `backend/src/main/java/com/greencampus/security` — JWT and authenticated user helpers
- `backend/src/main/resources/db/migration` — Flyway schema migrations
- `backend/src/main/java/com/greencampus/config/DataSeeder.java` — demo seed data

### Major Backend Modules
#### Rooms and Room Details
- **Controller**: `backend/src/main/java/com/greencampus/controller/RoomController.java`
- **Service**: `backend/src/main/java/com/greencampus/service/RoomService.java`
- **Entity**: `backend/src/main/java/com/greencampus/model/Room.java`
- **DTOs**: `RoomListDTO`, `RoomDetailDTO`, `RoomCreateDTO`

What it does:
- Lists rooms with optional search/filter parameters (`q`, `type`, `status`)
- Returns detailed room information including computed health score and assets
- Creates/updates/deletes rooms (admin-only)
- Initializes table PCs when needed

Important behavior:
- `RoomService` computes **health score** using PC health, projector status, and unresolved high-priority tickets.
- Room detail payload includes `assets`, which the frontend uses to render the visual layout.

#### Assets (Projector / Teacher PC / Table PCs)
- **Controller**: `backend/src/main/java/com/greencampus/controller/AssetController.java`
- **Entity**: `backend/src/main/java/com/greencampus/model/Asset.java`
- **DTOs**: `AssetDTO`, `AssetStatusUpdateDTO`

What it does:
- Updates asset status (working/broken) via API (admin-only in current code)
- Stores special asset types (`PROJECTOR`, `TEACHER_PC`, `TABLE_PC`)
- Uses `tableIndex` for table PC positioning in the room layout

#### Ticketing (Maintenance Workflow)
- **Controller**: `backend/src/main/java/com/greencampus/controller/TicketController.java`
- **Service**: `backend/src/main/java/com/greencampus/service/TicketService.java`
- **Entity**: `backend/src/main/java/com/greencampus/model/Ticket.java`

What it does:
- Lists tickets with status/priority/room filters
- Creates maintenance tickets
- Updates ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`)
- Deletes tickets (admin-only)

Current permission behavior (actual code):
- Ticket creation is **technician-only**
- Ticket status updates are **technician + admin**
- Ticket deletion is **admin-only**

#### Sessions / Schedule Import (Planning)
- **Controller**: `backend/src/main/java/com/greencampus/controller/SessionController.java`
- **Service**: `backend/src/main/java/com/greencampus/service/SessionService.java`
- **Entity**: `backend/src/main/java/com/greencampus/model/Session.java`

What it does:
- Returns imported sessions
- Imports schedule CSV files
- Clears sessions per room
- Reports occupancy count

Current permission behavior:
- Session endpoints are admin-only in current code.

#### Teacher Absences and Free-Room Suggestions
- **Controller**: `backend/src/main/java/com/greencampus/controller/AbsenceController.java`
- **Service**: `backend/src/main/java/com/greencampus/service/AbsenceService.java`
- **Entity**: `backend/src/main/java/com/greencampus/model/Absence.java`

What it does:
- Stores teacher absences linked to sessions
- Suggests free rooms during affected time windows
- Supports admin-only absence creation/deletion in current code

#### Authentication, Roles, and Permissions
- **Controllers / helpers**:
  - `backend/src/main/java/com/greencampus/controller/AuthController.java`
  - `backend/src/main/java/com/greencampus/security/JwtUtil.java`
  - `backend/src/main/java/com/greencampus/security/AuthContext.java`
  - `backend/src/main/java/com/greencampus/security/AuthenticatedUser.java`

What it does:
- Logs users in with username/password
- Returns a JWT containing role information
- Validates tokens and returns `/api/auth/me`
- Enforces permissions mainly in controllers (manual role checks)

#### Audit Logging
- **Controller**: `backend/src/main/java/com/greencampus/controller/AuditLogController.java`
- **Service**: `backend/src/main/java/com/greencampus/service/AuditLogService.java`
- **Entity**: `backend/src/main/java/com/greencampus/model/AuditLog.java`

What it does:
- Records admin actions (currently room create/delete and ticket delete in the code reviewed)
- Stores actor metadata, action type, entity type/id, summary, and optional before/after JSON snapshots
- Exposes admin-only audit log list endpoint with basic filters (`from`, `to`, `entityType`)

#### Stats and Health
- **Controllers**:
  - `backend/src/main/java/com/greencampus/controller/StatsController.java`
  - `backend/src/main/java/com/greencampus/controller/HealthController.java`

What it does:
- Health endpoint confirms backend responsiveness
- Stats endpoint aggregates dashboard KPIs (rooms, open tickets, broken PCs, sessions)

### Data Flow (Plain Language Examples)
#### Example 1: User opens a room detail page
1. User clicks a room card in the frontend Rooms page.
2. Frontend calls `GET /api/rooms/{id}` using `frontend/src/api/client.ts`.
3. `RoomController` checks authentication and calls `RoomService.getRoomDetail(...)`.
4. `RoomService` reads the `Room` entity and related `Asset` entities, computes health score, and maps to `RoomDetailDTO`.
5. JSON returns to the frontend.
6. `frontend/src/pages/RoomDetailPage.tsx` renders room information and passes assets into `frontend/src/components/RoomLayout.tsx`.

#### Example 2: Technician updates a ticket status
1. Technician clicks the status button in `frontend/src/pages/TicketsPage.tsx`.
2. Frontend sends `PATCH /api/tickets/{id}/status`.
3. `TicketController` validates the user role (technician or admin).
4. `TicketService.updateTicketStatus(...)` updates the `Ticket` record.
5. Frontend refreshes ticket and room queries to show latest state.

### Key Backend Endpoints (Major, Not Exhaustive)
- `POST /api/auth/login` — sign in and receive JWT
- `GET /api/auth/me` — validate token and return current user
- `GET /api/rooms` — list/search rooms
- `GET /api/rooms/{id}` — room detail with assets and computed fields
- `POST /api/rooms` / `PUT /api/rooms/{id}` / `DELETE /api/rooms/{id}` — room management (admin-only)
- `PATCH /api/assets/{id}/status` — update asset status (admin-only)
- `GET /api/tickets` — list tickets
- `POST /api/tickets` — create ticket (technician-only)
- `PATCH /api/tickets/{id}/status` — update ticket status
- `DELETE /api/tickets/{id}` — delete ticket (admin-only)
- `GET /api/sessions` and `POST /api/sessions/import` — scheduling tools (admin-only)
- `GET /api/absences/free-rooms` — room suggestion logic (admin-only in current code)
- `GET /api/audit-log` — audit entries (admin-only)

### Where to Change X (Backend Maintainer Pointers)
- Change room business rules or health score calculation: `backend/src/main/java/com/greencampus/service/RoomService.java`
- Change ticket workflow/status rules: `backend/src/main/java/com/greencampus/service/TicketService.java`
- Change room/ticket endpoint permissions: `backend/src/main/java/com/greencampus/controller/RoomController.java`, `backend/src/main/java/com/greencampus/controller/TicketController.java`
- Change auth token shape (JWT claims): `backend/src/main/java/com/greencampus/security/JwtUtil.java`
- Change login behavior or `/me` response: `backend/src/main/java/com/greencampus/controller/AuthController.java`
- Change audit log fields/recording behavior: `backend/src/main/java/com/greencampus/model/AuditLog.java`, `backend/src/main/java/com/greencampus/service/AuditLogService.java`
- Change demo users/rooms/tickets seed data: `backend/src/main/java/com/greencampus/config/DataSeeder.java`

### AI / Advanced Analytics Note
- **No dedicated AI module is present in the current repository.**
- The dashboard includes stats/health calculations and scheduling utilities, but there is no separate machine-learning or AI service in the codebase reviewed.

## FRONTEND (React / TypeScript)

### Purpose
The frontend is a role-aware dashboard interface for viewing room health, managing tickets, browsing room layouts, and using admin tools. It turns backend JSON APIs into a usable campus operations experience.

### Frontend Architecture (How It Is Organized)
- **Routes (`App.tsx`)** define which page loads for each URL.
- **Guards** control access:
  - `AuthGuard` requires login
  - `RoleGuard` protects admin-only pages
- **Layout (`DashboardLayout.tsx`)** provides the sidebar, top bar, API status, and shared error toast UI.
- **Pages** represent screens (Rooms, Tickets, Schedule, Admin, etc.).
- **Components** are reusable UI pieces (room layout, modals, guards).
- **API client** centralizes HTTP calls, auth token injection, and error handling.
- **Type definitions** keep data shapes consistent with backend DTOs.

### Key Frontend Folders and Files
- `frontend/src/App.tsx` — route map and route guards
- `frontend/src/layouts/DashboardLayout.tsx` — main dashboard shell
- `frontend/src/pages` — screen-level pages
- `frontend/src/components` — reusable components (layout visualizer, modals, guards)
- `frontend/src/api/client.ts` — Axios API client and request helpers
- `frontend/src/lib/auth.ts` — token/current user storage helpers
- `frontend/src/lib/permissions.ts` — UI role permissions
- `frontend/src/types` — TypeScript interfaces for backend data

### Important Screens and What They Do
#### Overview Dashboard
- **File**: `frontend/src/pages/OverviewPage.tsx`
- Shows KPI cards (rooms, tickets, broken PCs, sessions)
- Displays backend connection health status
- Provides quick links to key modules

#### Rooms List (Search / Filter)
- **File**: `frontend/src/pages/RoomsPage.tsx`
- Shows room cards with health score, room type, occupancy status, and quick asset indicators
- Supports search and filters
- Hides “Add Room” for non-admin users

#### Room Detail + Layout Visualization
- **Files**:
  - `frontend/src/pages/RoomDetailPage.tsx`
  - `frontend/src/components/RoomLayout.tsx`
- Displays:
  - room info and status
  - projector and teacher PC status indicators
  - table PC statuses
  - visual table-grid layout
- Non-admin users can open the page but get read-only controls
- Uses `RoomDetailErrorBoundary` to prevent a runtime crash from becoming a blank page

#### Tickets Page
- **File**: `frontend/src/pages/TicketsPage.tsx`
- Ticket list with filters, status controls, and role-based action buttons
- Technician-only “New Ticket” button in current code
- Staff sees read-only ticket status UI
- Admin can delete tickets

#### Schedule Page (Timetable + Absences)
- **File**: `frontend/src/pages/SchedulePage.tsx`
- Timetable view for imported sessions (weekly grid)
- CSV import action for sessions
- Absence declaration and free-room suggestions UI
- In current frontend routing, access is guarded to admin-only

#### Admin Tools Page
- **File**: `frontend/src/pages/AdminPage.tsx`
- System KPI cards and room management table
- Demo user account reference table
- Audit log table (recent entries)
- Admin-only route in current code

#### Login Page
- **File**: `frontend/src/pages/LoginPage.tsx`
- Username/password login form
- Stores JWT and current user info in local storage via `setAuthSession(...)`
- Includes demo credentials for convenience

### Role-Based UI Behavior (Actual Code)
#### Admin
- Sees all tabs, including Admin and Schedule
- Can manage rooms and assets in the UI
- Can update and delete tickets (ticket creation is technician-only in current code)
- Can view audit log table in Admin page

#### Technician
- Sees Rooms and Tickets pages (no Admin tab, no Schedule tab)
- Can create tickets and update ticket status
- Cannot delete tickets
- Room and asset management controls are hidden/disabled

#### Staff
- Sees read-only Rooms and Tickets views
- No ticket creation, no ticket edit status actions, no ticket delete
- No Admin tab, no Schedule tab
- Room layout is viewable but not editable

### Frontend Data Flow (Example)
1. Page component calls an API helper from `frontend/src/api/client.ts`.
2. Axios automatically attaches the JWT from local storage.
3. Backend returns JSON.
4. TanStack Query stores/caches the result.
5. The page renders typed data using components and role-based visibility rules.

### Where to Change X (Frontend Maintainer Pointers)
- Change routes / guarded pages: `frontend/src/App.tsx`
- Change sidebar tabs or top-level layout behavior: `frontend/src/layouts/DashboardLayout.tsx`
- Change room list UI and search/filter behavior: `frontend/src/pages/RoomsPage.tsx`
- Change room detail layout and room visualization logic: `frontend/src/pages/RoomDetailPage.tsx`, `frontend/src/components/RoomLayout.tsx`
- Change ticket permissions in UI: `frontend/src/lib/permissions.ts`, `frontend/src/pages/TicketsPage.tsx`
- Change auth storage/session behavior: `frontend/src/lib/auth.ts`, `frontend/src/components/AuthGuard.tsx`
- Change API calls and interceptors (including global 401/403 toast handling): `frontend/src/api/client.ts`

## Database, Migrations, and Domain Model

### Database Overview (Non-Technical)
The database stores the operational facts the dashboard depends on: what rooms exist, what equipment is inside them, which maintenance issues are open, what sessions are scheduled, and who is allowed to use the app. This allows the system to show reliable room status and support daily operations.

### Key Tables / Entities (Plain-English)
- **`rooms` / `Room`**: The list of teaching spaces (classrooms, labs, amphitheatres).
- **`assets` / `Asset`**: Equipment inside a room (projector, teacher PC, table PCs) with health status.
- **`tickets` / `Ticket`**: Maintenance issues linked to rooms.
- **`sessions` / `Session`**: Scheduled teaching sessions imported from timetable data.
- **`absences` / `Absence`**: Teacher absence records, optionally linked to a session.
- **`users` / `User`**: Login accounts and roles (Admin / Technician / Staff).
- **`audit_log` / `AuditLog`**: History of selected admin actions (with actor/action metadata).

### Relationships (How Data Connects)
- A **room has many assets** (`Room` → `Asset` one-to-many)
- A **ticket belongs to one room** (`Ticket` → `Room` many-to-one)
- A **session belongs to one room** (`Session` → `Room` many-to-one)
- An **absence may be linked to one session** (`Absence` → `Session` many-to-one, nullable)
- An **audit log record stores actor details** (username/role and optional `actorUserId` reference value)

### What Is Not Present in This Codebase
- There is **no `booking` table/entity** in the current repo.
- There is **no `closure` table/entity** in the current repo.
- Room closures are currently represented using the room `status` field (for example `CLOSED`).

### Migrations (Flyway)
Migration files live in:
- `backend/src/main/resources/db/migration`

Current migration sequence in this repo:
- `V1__init.sql` — baseline initialization
- `V2__rooms_and_assets.sql` — room and asset tables
- `V3__tickets.sql` — tickets
- `V4__sessions.sql` — sessions (schedule)
- `V5__absences.sql` — absences
- `V6__users.sql` — users
- `V7__audit_log.sql` — initial audit log table
- `V8__audit_log_rich_fields.sql` — richer audit log columns

### Dev vs Production Database Behavior
- **Development**: `application-dev.yml` uses H2 (in-memory) for fast startup and seeding.
- **Production-style runtime**: `application.yml` + env vars target PostgreSQL and Flyway migrations.

## API Guide (Key Endpoints)

### Notes
- All business endpoints are under `/api`.
- Most endpoints require a Bearer token.
- The examples below are short and meant for orientation (not full API documentation).

### Login
**Request**
```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (example)**
```json
{
  "token": "[REDACTED_JWT]",
  "username": "admin",
  "role": "ADMIN",
  "displayName": "Admin User"
}
```

### Current User (`/me`)
**Request**
```http
GET /api/auth/me
Authorization: Bearer [JWT]
```

**Response (example)**
```json
{
  "username": "tech",
  "role": "TECHNICIAN",
  "displayName": "Tech Support"
}
```

### List Rooms
**Request**
```http
GET /api/rooms?q=LAB&type=LAB
Authorization: Bearer [JWT]
```

**Response (truncated example)**
```json
[
  {
    "id": 2,
    "code": "LAB-A1",
    "type": "LAB",
    "capacity": 40,
    "healthScore": 62.0,
    "occupancyStatus": "IDLE"
  }
]
```

### Room Detail (used by Room Layout page)
**Request**
```http
GET /api/rooms/1
Authorization: Bearer [JWT]
```

**Response (truncated example)**
```json
{
  "id": 1,
  "code": "A1",
  "totalTables": 6,
  "projectorStatus": "WORKING",
  "teacherPcStatus": "WORKING",
  "assets": [
    { "id": 1, "type": "PROJECTOR", "status": "WORKING" },
    { "id": 2, "type": "TEACHER_PC", "status": "WORKING" },
    { "id": 3, "type": "TABLE_PC", "tableIndex": 1, "status": "WORKING" }
  ]
}
```

### Create Ticket (Technician-only in current code)
**Request**
```http
POST /api/tickets
Authorization: Bearer [JWT]
Content-Type: application/json
```

```json
{
  "roomId": 1,
  "title": "Projector not displaying",
  "description": "No image after powering on",
  "priority": "P2"
}
```

### Update Ticket Status
**Request**
```http
PATCH /api/tickets/12/status
Authorization: Bearer [JWT]
Content-Type: application/json
```

```json
{ "status": "IN_PROGRESS" }
```

## Permission Model (Admin / Technician / Staff)

### Permission Matrix (Current Code Behavior)
| Role | Can View Rooms | Can Create Rooms | Can Edit Rooms | Can Create Tickets | Can Edit Tickets | Can Delete Tickets | Can See Admin Tab | Actions Logged |
|---|---|---:|---:|---:|---:|---:|---:|---|
| ADMIN | Yes | Yes | Yes | **No (current code)** | Yes (status) | Yes | Yes | Room create/delete, ticket delete (current code paths) |
| TECHNICIAN | Yes | No | No | Yes | Yes (status) | No | No | No |
| STAFF | Yes | No | No | No | No | No | No | No |

### Backend Enforcement (Where It Happens)
Current backend permissions are enforced mainly through **controller-level role checks**, not Spring Security annotations.

Key files:
- `backend/src/main/java/com/greencampus/security/AuthContext.java` — converts auth header into a typed user context
- `backend/src/main/java/com/greencampus/security/JwtUtil.java` — extracts token claims (username/role)
- Controllers such as:
  - `backend/src/main/java/com/greencampus/controller/RoomController.java`
  - `backend/src/main/java/com/greencampus/controller/TicketController.java`
  - `backend/src/main/java/com/greencampus/controller/SessionController.java`
  - `backend/src/main/java/com/greencampus/controller/AbsenceController.java`
  - `backend/src/main/java/com/greencampus/controller/AuditLogController.java`

Behavior pattern:
- No/invalid token → `401 Not authenticated`
- Valid token but wrong role → `403 ... access required`

### Frontend Enforcement (Where Users See It)
The frontend mirrors backend permissions for a cleaner user experience:
- **Route guards**:
  - `frontend/src/components/AuthGuard.tsx`
  - `frontend/src/components/RoleGuard.tsx`
- **Permission helpers**:
  - `frontend/src/lib/permissions.ts`
- **Hidden tabs / buttons**:
  - `frontend/src/layouts/DashboardLayout.tsx`
  - `frontend/src/pages/RoomsPage.tsx`
  - `frontend/src/pages/TicketsPage.tsx`
  - `frontend/src/pages/RoomDetailPage.tsx`
- **403/401 user feedback**:
  - `frontend/src/api/client.ts` (Axios response interceptor dispatches error events)
  - `frontend/src/layouts/DashboardLayout.tsx` (shows toast/banner)

### Audit Logging (Current Implementation)
Audit log records are stored in `audit_log` and represented by `backend/src/main/java/com/greencampus/model/AuditLog.java`.

Fields currently include (current code):
- `id`
- `eventTimestamp`
- `actorUserId`
- `actorUsername`
- `actorRole`
- `actionType`
- `entityType`
- `entityId`
- `summary`
- `beforeJson`
- `afterJson`

Current logged actions (from reviewed controller code):
- Room create (`CREATE ROOM`)
- Room delete (`DELETE ROOM`)
- Ticket delete (`DELETE TICKET`)

Admin UI viewer:
- `frontend/src/pages/AdminPage.tsx` (basic audit log table)

## How to Run Locally

### Option 1: Fast Developer Mode (Separate Backend + Frontend)
#### Backend (H2 dev mode)
```bash
cd backend
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`.

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### Option 2: Docker Compose (PostgreSQL + Backend + Frontend)
```bash
docker compose up --build
```
Services (from `docker-compose.yml`):
- PostgreSQL: `localhost:5432`
- Backend: `localhost:8080`
- Frontend: `localhost:5173`

### Demo / Seed Accounts (Current README)
These are demo credentials present in project documentation and seed data for local use:
- `admin / admin123`
- `tech / tech123`
- `staff / staff123`

> Security note: These are demo credentials only. Real credentials, tokens, and secrets should never be committed. Replace with secure values in production.

## How to Demo (2 Minutes)

### 2-Minute Demo Script
1. **Start with login**
   - Open `http://localhost:5173/login`
   - Sign in as `admin`
   - Explain that roles control what each user can do

2. **Show the dashboard overview**
   - Point out KPI cards (rooms, open tickets, broken PCs, sessions)
   - Show API health indicator in the layout

3. **Open Rooms**
   - Use search/filter to find a lab
   - Click a room (for example `A1` or `LAB-A1`)

4. **Show Room Detail + Visual Layout**
   - Highlight room info (capacity/type/status)
   - Show projector and teacher PC indicators
   - Show table PC grid layout and status visualization

5. **Show Tickets**
   - Explain ticket list and status workflow
   - Optionally log in as `tech` to demonstrate ticket creation and status updates

6. **Show Admin Tools**
   - Return as `admin`
   - Open Admin page
   - Show room management table and audit log entries

### Role Demo Tips
- Log in as `tech` to show technician-only ticket creation
- Log in as `staff` to show read-only views and hidden admin UI

## Troubleshooting

### 1) Frontend shows a blank/white page
Possible causes:
- A runtime React error in a page component
- Backend API is down and a page is not handling errors correctly

What to check:
- Browser DevTools Console for stack traces
- Network tab for failed `/api/*` requests
- `frontend/src/components/RoomDetailErrorBoundary.tsx` currently protects Room Detail specifically

### 2) Backend does not start
Common causes:
- Wrong Java version (requires Java 21+)
- Port `8080` already in use
- Build cache issues after dependency changes

What to check:
- Terminal logs from `./mvnw spring-boot:run`
- Java version: `java -version`
- Port usage: `lsof -i :8080` (or equivalent)

### 3) Frontend cannot reach backend (API disconnected)
Common causes:
- Backend is not running
- Wrong proxy target or Docker networking issue
- CORS/proxy mismatch in local environment

What to check:
- `http://localhost:8080/api/health`
- `frontend/vite.config.ts`
- `backend/src/main/java/com/greencampus/config/WebConfig.java`
- `docker-compose.yml` service names / ports

### 4) Login works but actions fail with 401/403
Common causes:
- Expired or invalid token in local storage
- Role-based restriction (working as designed)

What to check:
- Sign out and sign back in
- Browser local storage keys (`gc_token`, `gc_user`)
- Backend controller permission checks in the relevant module

### 5) Database schema problems / missing tables
Common causes:
- Running with PostgreSQL config but DB not initialized
- Flyway migration mismatch
- Switching between H2 and PostgreSQL without clearing assumptions

What to check:
- Active Spring profile (`dev` vs default)
- Migration files under `backend/src/main/resources/db/migration`
- Backend startup logs for Flyway errors

### 6) Schedule import does not work
Common causes:
- CSV format does not match expected columns
- User is not admin (endpoint is admin-only in current code)

What to check:
- CSV format example shown in the Schedule page UI
- Browser network response for `/api/sessions/import`
- Backend error response message

### Secrets and Redaction Reminder
If you inspect environment files, logs, or deployment configs and find real secrets (API keys, tokens, passwords), do not copy them into documentation. Replace with `[REDACTED]`.

## Glossary
- **API**: A set of endpoints that lets the frontend and backend talk to each other.
- **Asset**: A piece of room equipment (projector, teacher PC, or table PC).
- **Audit Log**: A history record of important actions (for accountability and review).
- **Backend**: The server application that processes requests, applies rules, and talks to the database.
- **CSV**: A simple spreadsheet-like text file format used here for importing schedules.
- **DTO (Data Transfer Object)**: A backend object shape used to send data to the frontend in a clean way.
- **Entity**: A backend Java class that maps to a database table.
- **Frontend**: The user interface (the dashboard users interact with in a browser).
- **Flyway Migration**: A versioned SQL file that safely changes the database schema over time.
- **H2**: A lightweight in-memory database used for local development.
- **JPA**: A Java persistence approach used here to map Java objects to relational database tables.
- **JWT (JSON Web Token)**: A token used after login so the backend knows who the user is and what role they have.
- **KPI**: Key performance indicator (summary numbers shown on the dashboard).
- **Role Guard**: Frontend logic that blocks users from pages they are not allowed to access.
- **Session**: A scheduled class/teaching event in a specific room.
- **TanStack Query**: A frontend library that manages API data fetching and caching.
