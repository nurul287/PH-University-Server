# AGENTS.md

Guidance for AI coding agents (Cursor, Claude Code, etc.) working in this
repository. Human contributors should read [`README.md`](README.md) and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## What this project is

A TypeScript + Express + MongoDB (Mongoose) REST API for a university management
system. All routes are served under `/api/v1`. Authentication is JWT-based with
role-based access control.

## Setup commands

```bash
npm install            # install dependencies
npm run start:dev      # run with hot reload (ts-node-dev)
npm run build          # compile to dist/
npm run start:prod     # run compiled build
npm run lint           # eslint over src
npm run prettier       # format src
```

A `.env` file is required. See the **Environment Variables** table in
[`README.md`](README.md) for the full list (DB URL, JWT secrets, bcrypt salt,
Cloudinary keys, etc.).

## Architecture (read before editing)

Request flow:

```
route → auth() → validateRequest(zodSchema) → controller → service → model → sendResponse
```

- **Controllers** are thin: parse request, call service, return `sendResponse`.
- **Services** contain business logic and all Mongoose/database access.
- **Validation** is done with Zod schemas applied via `validateRequest` in routes.
- **Errors** are thrown as `AppError(httpStatus, message)` and formatted centrally
  by `globalErrorHandler`.

## Module layout

Features live in `src/app/modules/<name>/` and are split into
`*.interface.ts`, `*.model.ts`, `*.validation.ts`, `*.controller.ts`,
`*.service.ts`, `*.route.ts` (+ optional `*.constant.ts` / `*.utils.ts`).
New modules must replicate this layout and register routes in
`src/app/routes/index.ts`.

## Conventions to follow

- Wrap async controllers in `catchAsync`.
- Send every response through `sendResponse` (`statusCode`, `success`, `message`, `data`).
- Throw `AppError` for expected errors; use `http-status` codes.
- Guard routes with `auth(...roles)` and `USER_ROLE` (`superAdmin`, `admin`, `faculty`, `student`).
- Use `QueryBuilder` for list endpoints (search/filter/sort/paginate/fields).
- Read env only through `src/app/config`.

## Conventions to avoid

- No direct Mongoose calls inside controllers.
- No endpoints that accept a body without a Zod schema.
- No hardcoded secrets.
- No new ORM / validation / HTTP framework.

## Notes / known quirks

- Two module folders are intentionally named with a trailing `.ts`
  (`academicFaculty.ts/`, `enrolledCourse.ts/`). Imports depend on this — leave it.
- Cloudinary env vars are spelled `COUDINARY_*` in the codebase; match exactly.
- There is no automated test suite yet (`npm test` is a stub). Verify changes by
  running the dev server and exercising endpoints (a Postman collection is included).

## Before you finish

1. `npm run lint` — fix issues.
2. `npm run prettier` — format.
3. Make sure new routes are registered in `src/app/routes/index.ts`.
4. Keep commits focused and descriptive.
