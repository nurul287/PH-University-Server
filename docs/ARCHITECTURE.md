# Architecture

This document explains how the PH University Server is organized and how a
request flows through it. For setup and scripts, see the [README](../README.md).

## Overview

The application is a layered, modular Express API:

- **`src/server.ts`** — process entry point. Connects to MongoDB, seeds the super
  admin, starts the HTTP server, and registers `unhandledRejection` /
  `uncaughtException` handlers for graceful shutdown.
- **`src/app.ts`** — builds the Express application: JSON body parsing, CORS
  (credentials enabled, origin `http://localhost:5173`), cookie parsing, mounts
  the API router at `/api/v1`, and finally the `notFound` + `globalErrorHandler`
  middleware.
- **`src/app/routes/index.ts`** — a single registry that mounts every module's
  router under its base path.

## Request lifecycle

```
HTTP Request
   │
   ▼
Express app (src/app.ts)
   │   json(), cors(), cookieParser()
   ▼
Router (/api/v1)  ──►  Module route (e.g. /students)
   │
   ▼
auth(...roles)            verifies JWT, loads user, checks status/role
   │
   ▼
validateRequest(schema)   validates req.body against a Zod schema
   │
   ▼
Controller                thin handler, wrapped in catchAsync
   │
   ▼
Service                   business logic + Mongoose data access
   │
   ▼
Model (Mongoose)          MongoDB
   │
   ▼
sendResponse              uniform JSON: { success, message, data, meta? }
   │
   ▼ (on error anywhere)
globalErrorHandler        formats AppError / Zod / Mongoose errors
```

## Layers and responsibilities

| Layer          | Location                         | Responsibility                                            |
| -------------- | -------------------------------- | --------------------------------------------------------- |
| Entry          | `server.ts`, `app.ts`            | Bootstrap, middleware wiring, server lifecycle             |
| Routing        | `app/routes`, `*/*.route.ts`     | Map HTTP verbs/paths to handlers; attach middleware        |
| Middleware     | `app/middlewares`                | Auth, validation, error handling, not-found, body parsing  |
| Controller     | `*/*.controller.ts`              | Read request, call service, send response (thin)           |
| Service        | `*/*.service.ts`                 | Business logic and all database access                     |
| Model          | `*/*.model.ts`                   | Mongoose schemas, statics, hooks                           |
| Validation     | `*/*.validation.ts`              | Zod schemas for request payloads                           |
| Types          | `*/*.interface.ts`               | TypeScript interfaces/types                                |

## Module anatomy

Every feature is a self-contained module under `src/app/modules/<name>/`:

```
<module>.interface.ts   # TypeScript types
<module>.model.ts       # Mongoose schema/model
<module>.validation.ts  # Zod schemas
<module>.controller.ts  # Request handlers (catchAsync)
<module>.service.ts     # Business logic + DB access
<module>.route.ts       # Express routes, exported as <Name>Routes
<module>.constant.ts    # (optional) constants, searchable fields
<module>.utils.ts       # (optional) helpers
```

The domain modules and their relationships:

```
academicFaculty ──┐
                  ├─► academicDepartment ──► student / faculty
academicSemester ─┘

course ──► offeredCourse ──► (within) semesterRegistration ──► enrolledCourse ──► student
```

- **user** — the account record (`id`, `email`, `password`, `role`, `status`).
  Creating a student/faculty/admin also creates the underlying user.
- **auth** — login, change/forget/reset password, refresh token.
- **student / faculty / Admin** — profile records linked to a user.
- **academicSemester / academicFaculty / academicDepartment** — the academic catalog.
- **course** — course definitions and faculty assignment.
- **semesterRegistration** — opens a registration window for a semester.
- **offeredCourse** — a course offered within a semester registration.
- **enrolledCourse** — a student's enrollment and grading record.

## Cross-cutting building blocks

### Authentication — `app/middlewares/auth.ts`

`auth(...requiredRoles)` returns middleware that:

1. Reads the `Authorization` header and verifies the JWT with `JWT_ACCESS_SECRET`.
2. Loads the user via `User.isUserExistsByCustomId`.
3. Rejects deleted or blocked users.
4. Rejects tokens issued before the user's last password change.
5. Enforces that the user's role is in `requiredRoles`.
6. Attaches the decoded payload to `req.user`.

Roles come from `USER_ROLE` (`superAdmin`, `admin`, `faculty`, `student`).

### Validation — `app/middlewares/validateRequest.ts`

Wraps a Zod schema and validates incoming requests before the controller runs,
so controllers can assume well-formed input.

### QueryBuilder — `app/builder/QueryBuilder.ts`

A chainable helper over a Mongoose query supporting `.search()`, `.filter()`,
`.sort()`, `.paginate()`, `.fields()`, and `.countTotal()` for pagination meta.
List endpoints use it to provide consistent search/filter/sort/pagination.

### Error handling — `app/errors/` + `globalErrorHandler`

- `AppError` — custom error carrying an HTTP status code.
- Dedicated handlers normalize Zod errors, Mongoose validation errors, cast
  errors, and duplicate-key errors into a single response shape.
- `globalErrorHandler` is the last middleware and produces the final error JSON.

### Utilities — `app/utils/`

- `catchAsync` — wraps async handlers and forwards errors to the error handler.
- `sendResponse` — standardizes the success response envelope.
- `sendEmail` — sends mail (used by the password-reset flow) via Nodemailer.
- `sendImageToCloudinary` — Multer storage + Cloudinary upload for profile images.

## Startup seeding — `app/DB/index.ts`

On boot, `seedSuperAdmin()` checks whether a `superAdmin` user exists and, if
not, creates one (`id: 0001`) using `SUPER_ADMIN_PASSWORD`. This guarantees there
is always an account capable of creating admins.

## Configuration — `app/config/index.ts`

All environment variables are loaded once via `dotenv` and exported as a typed
`config` object. The rest of the codebase imports `config` rather than reading
`process.env` directly.
