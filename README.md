# 🎓 PH University Server

A backend REST API for a university management system, built with **TypeScript**, **Express**, and **MongoDB (Mongoose)**. It handles the full academic domain — users and roles, academic structure (faculties → departments → semesters), courses, semester registration, course offerings, and student enrollment with grading — behind JWT-based, role-aware authentication.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Overview](#-api-overview)
- [Authentication & Roles](#-authentication--roles)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

- **Role-based access control** — `superAdmin`, `admin`, `faculty`, `student`.
- **JWT authentication** with access + refresh tokens, password change/reset, and token invalidation on password change.
- **Modular architecture** — every domain feature is a self-contained module (interface / model / validation / controller / service / route).
- **Request validation** with [Zod](https://zod.dev/) via a reusable `validateRequest` middleware.
- **Reusable `QueryBuilder`** for search, filter, sort, pagination, and field selection.
- **Centralized error handling** for Zod, Mongoose validation/cast, and duplicate-key errors.
- **Image uploads** to Cloudinary (via Multer).
- **Transactional email** (password reset) via Nodemailer.
- **Auto-seeding** of a super admin on startup.

---

## 🛠 Tech Stack

| Category        | Technology                                  |
| --------------- | ------------------------------------------- |
| Language        | TypeScript                                  |
| Runtime         | Node.js                                     |
| Framework       | Express 4                                   |
| Database        | MongoDB + Mongoose 8                         |
| Validation      | Zod (primary), Joi                          |
| Auth            | JSON Web Tokens (`jsonwebtoken`), bcrypt    |
| File Upload     | Multer + Cloudinary                         |
| Email           | Nodemailer                                  |
| Tooling         | ESLint, Prettier, ts-node-dev               |

---

## 🏗 Project Architecture

The app follows a **layered, modular pattern**. The request lifecycle is:

```
Request
  → Route            (defines endpoint, attaches middleware)
  → auth()           (verifies JWT + role)
  → validateRequest  (validates body with a Zod schema)
  → Controller       (thin; wraps logic in catchAsync, sends response)
  → Service          (business logic + database access)
  → Model            (Mongoose schema / DB)
  → sendResponse     (uniform JSON response)
```

Cross-cutting concerns live outside the modules:

- **`middlewares/`** — `auth`, `validateRequest`, `globalErrorHandler`, `notFound`, `parseText`.
- **`builder/QueryBuilder.ts`** — chainable query helper used by list endpoints.
- **`errors/`** — `AppError` + dedicated handlers per error type.
- **`utils/`** — `catchAsync`, `sendResponse`, `sendEmail`, `sendImageToCloudinary`.

> 📖 See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a deeper dive.

---

## 📂 Folder Structure

```
src/
├── app.ts                      # Express app: middleware, routes, error handlers
├── server.ts                   # Entry point: DB connect, seed, start server
└── app/
    ├── DB/                      # Super-admin seeding
    ├── builder/                 # QueryBuilder
    ├── config/                  # Env config loader
    ├── errors/                  # AppError + error handlers
    ├── interface/               # Shared types / Express type augmentation
    ├── middlewares/             # auth, validateRequest, error handlers, etc.
    ├── routes/                  # Central route registry (/api/v1)
    ├── utils/                   # catchAsync, sendResponse, email, cloudinary
    └── modules/                 # Feature modules (see below)
        ├── user/                # Account creation, status, /me
        ├── auth/                # Login, password flows, refresh token
        ├── student/
        ├── faculty/
        ├── Admin/
        ├── academicSemester/
        ├── academicFaculty.ts/
        ├── academicDepartment/
        ├── course/
        ├── semesterRegistration/
        ├── offeredCourse/
        └── enrolledCourse.ts/
```

Each module typically contains:

```
<module>.interface.ts   # TypeScript types
<module>.model.ts       # Mongoose schema/model
<module>.validation.ts  # Zod validation schemas
<module>.controller.ts  # Request handlers
<module>.service.ts     # Business logic
<module>.route.ts       # Express routes
<module>.constant.ts    # (optional) constants
<module>.utils.ts       # (optional) helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account (for image uploads)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd PH-University-Server

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env   # then fill in the values (see below)

# 4. Run in development
npm run start:dev
```

The server starts on the port defined in `.env` (e.g. `http://localhost:5000`). The base path for all routes is `/api/v1`.

---

## 🔐 Environment Variables

Create a `.env` file in the project root. The application reads these in `src/app/config/index.ts`:

| Variable                 | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `NODE_ENV`               | `development` or `production`                     |
| `PORT`                   | Port the server listens on (e.g. `5000`)          |
| `DATABASE_URL`           | MongoDB connection string                         |
| `BCRYPT_SALT_ROUNDS`     | Salt rounds for password hashing (e.g. `12`)      |
| `DEFAULT_PASS`           | Default password assigned to new users            |
| `JWT_ACCESS_SECRET`      | Secret for signing access tokens                  |
| `JWT_REFRESH_SECRET`     | Secret for signing refresh tokens                 |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifetime (e.g. `10d`)                |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `365d`)              |
| `APP_URL`                | Frontend URL used in password-reset links         |
| `COUDINARY_API_KEY`      | Cloudinary API key                                |
| `COUDINARY_API_SECRET`   | Cloudinary API secret                             |
| `SUPER_ADMIN_PASSWORD`   | Password for the auto-seeded super admin           |

> ⚠️ The Cloudinary env var names are spelled `COUDINARY_*` in the codebase — match them exactly.

> 💡 On first launch a super admin is auto-seeded (`id: 0001`) if none exists — see `src/app/DB/index.ts`.

---

## 📜 Available Scripts

| Script                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run start:dev`    | Run in dev mode with hot reload (`ts-node-dev`)   |
| `npm run build`        | Compile TypeScript to `dist/`                     |
| `npm run start:prod`   | Run the compiled build (`node ./dist/server.js`)  |
| `npm run lint`         | Lint the `src` directory                          |
| `npm run lint:fix`     | Lint and auto-fix                                 |
| `npm run prettier`     | Format source files                               |
| `npm run prettier:fix` | Format the `src` directory                        |

---

## 🌐 API Overview

All routes are prefixed with **`/api/v1`**.

| Resource                | Base Path                  | Purpose                                        |
| ----------------------- | -------------------------- | ---------------------------------------------- |
| Auth                    | `/auth`                    | Login, change/forget/reset password, refresh   |
| Users                   | `/users`                   | Create student/faculty/admin, status, `/me`    |
| Students                | `/students`                | Manage student records                         |
| Faculties               | `/faculties`               | Manage faculty records                         |
| Admins                  | `/admins`                  | Manage admin records                           |
| Academic Semesters      | `/academic-semesters`      | Academic semester catalog                      |
| Academic Faculties      | `/academic-faculties`      | Academic faculty catalog                       |
| Academic Departments    | `/academic-departments`    | Academic department catalog                    |
| Courses                 | `/courses`                 | Course catalog + faculty assignment            |
| Semester Registrations  | `/semester-registrations`  | Open/manage registration periods               |
| Offered Courses         | `/offered-courses`         | Courses offered in a registration              |
| Enrolled Courses        | `/enrolled-courses`        | Student enrollment + grading                   |

A ready-to-use **Postman collection** is included: [`PH University.postman_collection.json`](./PH%20University.postman_collection.json).

> 📖 Full endpoint reference (methods, paths, allowed roles): [`docs/API.md`](docs/API.md).

---

## 🔑 Authentication & Roles

Protected endpoints expect a JWT in the `Authorization` header:

```
Authorization: <access_token>
```

Roles are defined in `src/app/modules/user/user.constant.ts`:

| Role         | Capability summary                                                    |
| ------------ | --------------------------------------------------------------------- |
| `superAdmin` | Full access, including creating admins                                |
| `admin`      | Manages students, faculties, academic structure, courses, offerings   |
| `faculty`    | Views assigned data, grades enrolled courses                          |
| `student`    | Enrolls in courses, views own offered/enrolled courses                |

The `auth(...roles)` middleware verifies the token, confirms the user exists and is neither deleted nor blocked, invalidates tokens issued before a password change, and enforces the allowed roles.

---

## 📚 Documentation

| Document                                   | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Design, request lifecycle, module anatomy   |
| [`docs/API.md`](docs/API.md)               | Complete endpoint reference with roles          |
| [`AGENTS.md`](AGENTS.md)                    | Conventions for AI coding agents (Cursor, etc.) |
| [`.cursor/rules/`](.cursor/rules)          | Cursor IDE project rules                         |

---

## 🤝 Contributing

1. Create a feature branch.
2. Follow the existing modular structure — keep controllers thin and business logic in services.
3. Validate every request body with a Zod schema.
4. Run `npm run lint` and `npm run prettier` before committing.
5. Open a pull request with a clear description.

---

> Built as part of a university management system. Maintained by the project owner.
