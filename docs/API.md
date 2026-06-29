# API Reference

Base URL: **`/api/v1`**

All protected endpoints require a JWT in the `Authorization` header:

```
Authorization: <access_token>
```

The **Allowed Roles** column lists which roles may call each endpoint. Endpoints
with no roles listed are public. Roles: `superAdmin`, `admin`, `faculty`, `student`.

> Tip: a ready-to-import Postman collection is available at
> [`../PH University.postman_collection.json`](../PH%20University.postman_collection.json).

---

## Auth — `/auth`

| Method | Path               | Description                                | Allowed Roles                          |
| ------ | ------------------ | ------------------------------------------ | -------------------------------------- |
| POST   | `/login`           | Log in, returns access + refresh tokens    | Public                                 |
| POST   | `/change-password` | Change the current user's password         | admin, superAdmin, faculty, student    |
| POST   | `/refresh-token`   | Issue a new access token from refresh token | Public (refresh token required)        |
| POST   | `/forget-password` | Send a password reset link via email       | Public                                 |
| POST   | `/reset-password`  | Reset password using the emailed token      | Public (token required)                |

---

## Users — `/users`

| Method | Path                 | Description                          | Allowed Roles        |
| ------ | -------------------- | ------------------------------------ | -------------------- |
| POST   | `/create-student`    | Create a student (multipart `file`)  | admin, superAdmin    |
| POST   | `/create-faculty`    | Create a faculty (multipart `file`)  | admin, superAdmin    |
| POST   | `/create-admin`      | Create an admin (multipart `file`)   | superAdmin           |
| POST   | `/change-status/:id` | Block / activate a user              | admin, superAdmin    |
| GET    | `/me`                | Get the current user's profile       | admin, faculty, student |

> `create-*` endpoints accept `multipart/form-data` with a `file` field (profile
> image, uploaded to Cloudinary) and a `data` field containing the JSON payload,
> which is parsed by the `parseText` middleware before validation.

---

## Students — `/students`

| Method | Path     | Description          | Allowed Roles                  |
| ------ | -------- | -------------------- | ------------------------------ |
| GET    | `/`      | List all students    | Public                         |
| GET    | `/:id`   | Get a single student | admin, superAdmin, faculty     |
| PATCH  | `/:id`   | Update a student     | admin, superAdmin              |
| DELETE | `/:id`   | Soft-delete a student | admin, superAdmin             |

---

## Faculties — `/faculties`

| Method | Path     | Description           | Allowed Roles              |
| ------ | -------- | --------------------- | -------------------------- |
| GET    | `/`      | List all faculties    | admin, superAdmin, faculty |
| GET    | `/:id`   | Get a single faculty  | admin, superAdmin, faculty |
| PATCH  | `/:id`   | Update a faculty      | admin, superAdmin          |
| DELETE | `/:id`   | Soft-delete a faculty | admin, superAdmin          |

---

## Admins — `/admins`

| Method | Path     | Description         | Allowed Roles      |
| ------ | -------- | ------------------- | ------------------ |
| GET    | `/`      | List all admins     | superAdmin, admin  |
| GET    | `/:id`   | Get a single admin  | superAdmin, admin  |
| PATCH  | `/:id`   | Update an admin     | superAdmin         |
| DELETE | `/:id`   | Soft-delete an admin | superAdmin        |

---

## Academic Semesters — `/academic-semesters`

| Method | Path                          | Description                  | Allowed Roles                          |
| ------ | ----------------------------- | ---------------------------- | -------------------------------------- |
| POST   | `/create-academic-semester`   | Create an academic semester  | admin, superAdmin                      |
| GET    | `/`                           | List academic semesters      | admin, superAdmin, faculty, student    |
| GET    | `/:semesterId`                | Get a single semester        | admin, superAdmin, faculty, student    |
| PATCH  | `/:semesterId`                | Update a semester            | admin, superAdmin                      |

---

## Academic Faculties — `/academic-faculties`

| Method | Path                        | Description                 | Allowed Roles              |
| ------ | --------------------------- | --------------------------- | -------------------------- |
| POST   | `/create-academic-faculty`  | Create an academic faculty  | admin, superAdmin          |
| GET    | `/`                         | List academic faculties     | admin, superAdmin, faculty |
| GET    | `/:facultyId`               | Get a single faculty        | admin, superAdmin, faculty |
| PATCH  | `/:facultyId`               | Update a faculty            | admin, superAdmin          |

---

## Academic Departments — `/academic-departments`

| Method | Path                           | Description                    | Allowed Roles              |
| ------ | ------------------------------ | ------------------------------ | -------------------------- |
| POST   | `/create-academic-department`  | Create an academic department  | admin, superAdmin          |
| GET    | `/`                            | List academic departments      | admin, superAdmin, faculty |
| GET    | `/:departmentId`               | Get a single department        | admin, superAdmin, faculty |
| PATCH  | `/:departmentId`               | Update a department            | admin, superAdmin          |

---

## Courses — `/courses`

| Method | Path                          | Description                        | Allowed Roles                          |
| ------ | ----------------------------- | ---------------------------------- | -------------------------------------- |
| POST   | `/create-course`              | Create a course                    | admin, superAdmin                      |
| GET    | `/`                           | List courses                       | admin, superAdmin, faculty, student    |
| GET    | `/:id`                        | Get a single course                | admin, superAdmin, faculty, student    |
| PATCH  | `/:id`                        | Update a course                    | admin, superAdmin                      |
| DELETE | `/:id`                        | Delete a course                    | admin, superAdmin                      |
| PUT    | `/:courseId/assign-faculties` | Assign faculties to a course       | admin, superAdmin                      |
| GET    | `/:courseId/get-faculties`    | Get faculties assigned to a course | admin, superAdmin, faculty, student    |
| DELETE | `/:courseId/remove-faculties` | Remove faculties from a course     | admin, superAdmin                      |

---

## Semester Registrations — `/semester-registrations`

| Method | Path                                | Description                       | Allowed Roles                          |
| ------ | ----------------------------------- | --------------------------------- | -------------------------------------- |
| POST   | `/create-semester-registration`     | Open a semester registration      | admin, superAdmin                      |
| GET    | `/`                                 | List semester registrations       | admin, superAdmin, faculty, student    |
| GET    | `/:id`                              | Get a single registration         | admin, superAdmin, faculty, student    |
| PATCH  | `/:id`                              | Update a registration (status)    | admin, superAdmin                      |
| DELETE | `/:id`                              | Delete a registration             | admin, superAdmin                      |

---

## Offered Courses — `/offered-courses`

| Method | Path                       | Description                       | Allowed Roles                          |
| ------ | -------------------------- | --------------------------------- | -------------------------------------- |
| POST   | `/create-offered-course`   | Create an offered course          | admin, superAdmin                      |
| GET    | `/`                        | List offered courses              | admin, superAdmin, faculty             |
| GET    | `/my-offered-courses`      | Courses offered to current student | student                               |
| GET    | `/:id`                     | Get a single offered course       | admin, superAdmin, faculty, student    |
| PATCH  | `/:id`                     | Update an offered course          | admin, superAdmin                      |
| DELETE | `/:id`                     | Delete an offered course          | admin, superAdmin                      |

---

## Enrolled Courses — `/enrolled-courses`

| Method | Path                             | Description                          | Allowed Roles                    |
| ------ | -------------------------------- | ------------------------------------ | -------------------------------- |
| POST   | `/create-enrolled-course`        | Enroll the current student in a course | student                        |
| GET    | `/my-enrolled-courses`           | List the current student's enrollments | student                        |
| PATCH  | `/update-enrolled-course-marks`  | Update a student's marks/grades      | faculty, superAdmin, admin       |

---

## Response shape

Successful responses use a consistent envelope produced by `sendResponse`:

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 },
  "data": { }
}
```

`meta` is present on paginated list endpoints. Error responses are normalized by
the global error handler:

```json
{
  "success": false,
  "message": "Validation Error",
  "errorSources": [{ "path": "email", "message": "Invalid email" }],
  "stack": "…"
}
```
