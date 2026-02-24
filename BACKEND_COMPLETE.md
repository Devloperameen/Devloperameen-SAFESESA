# EduFlow Backend — Complete Implementation Guide

> **Status:** ✅ All endpoints live and smoke-tested  
> **API Base:** `http://localhost:8000/api` (dev) · `VITE_API_URL` env var (production)  
> **Last verified:** 2026-02-24

---

## 1 — What Was Built (This Session)

| # | Item | File(s) Changed |
|---|------|-----------------|
| 1 | **Curriculum model** (standalone, separate from Course) | `src/models/Curriculum.ts` *(new)* |
| 2 | **Curriculum controller** (GET/POST/PATCH/DELETE) | `src/controllers/curriculumController.ts` *(new)* |
| 3 | **Curriculum routes** (role-guarded, optionalProtect for public GET) | `src/routes/curriculumRoutes.ts` *(new)* |
| 4 | **`restrictTo` middleware alias** (alias for `checkRole`) | `src/middleware/auth.ts` |
| 5 | **PATCH progress endpoint** (alongside existing PUT) | `src/routes/enrollmentRoutes.ts` |
| 6 | **Cinematic seed script** (5 gradient-thumbnail courses, correct users) | `src/scripts/seed.ts` *(rewritten)* |
| 7 | **Fixed `npm run seed` path** (was pointing to wrong file) | `package.json` |
| 8 | **Curriculum registered in app** | `src/app.ts` |
| 9 | **Duplicate index warning fixed** | `src/models/Curriculum.ts` |
| 10 | **Updated `.env.example` files** (consistent PORT=8000) | `backend/.env.example`, `frontend/.env.example` |

---

## 2 — Complete API Reference

### Authentication (`/api/auth`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/register` | Public | Register student or instructor |
| POST | `/auth/login` | Public | Login, returns JWT token |
| GET | `/auth/me` | Private | Get current user profile |
| PUT | `/auth/profile` | Private | Update name / bio / avatar |
| POST | `/auth/forgot-password` | Public | Request password reset link |
| POST | `/auth/reset-password/:token` | Public | Reset password with token |

**Token usage:** `Authorization: Bearer <token>` on every protected route.

---

### Courses (`/api/courses`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/courses` | Public | List published courses (filter: category, level, featured, search) |
| GET | `/courses/:id` | Public | Course detail |
| POST | `/courses` | Instructor | Create course (status=draft) |
| PUT | `/courses/:id` | Instructor (own) | Update course metadata |
| DELETE | `/courses/:id` | Instructor (own) | Delete course |
| PUT | `/courses/:id/submit` | Instructor (own) | Submit for admin publish approval |
| PUT | `/courses/:id/request-unpublish` | Instructor (own) | Request unpublish approval |
| GET | `/courses/instructor/my-courses` | Instructor | Paginated list of own courses |
| GET | `/courses/instructor/stats` | Instructor | **Aggregation pipeline** → totalStudents, totalEarnings, avgRating |
| GET | `/courses/instructor/revenue` | Instructor | Monthly earnings breakdown (last 6 months) |
| GET | `/courses/instructor/messages` | Instructor | Reviews + admin rejection notes |
| GET | `/courses/instructor/:id/students` | Instructor (own) | Enrolled students for a course |
| GET | `/courses/:id/reviews` | Public | Course reviews |
| GET | `/courses/:id/reviews/me` | Student | Your review on a course |
| POST | `/courses/:id/reviews` | Student | Submit / update review |

---

### Curriculum (`/api/curriculum`) ← **NEW**

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/curriculum/:courseId` | Public (optional auth) | Get full curriculum. `videoUrl` hidden for non-enrolled non-preview lessons |
| POST | `/curriculum/:courseId` | Instructor (own) / Admin | Create or fully replace curriculum. Mirrors to `Course.sections` |
| PATCH | `/curriculum/:courseId` | Instructor (own) / Admin | Partial update of sections |
| DELETE | `/curriculum/:courseId` | Instructor (own) / Admin | Delete curriculum (clears Course.sections too) |

**Response includes virtuals:**
```json
{
  "sections": [...],
  "totalLessons": 8,
  "totalDuration": 241
}
```

---

### Enrollments (`/api/enrollments`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/enrollments/:courseId` | Student | Enroll in course |
| GET | `/enrollments` | Student | My enrolled courses with progress |
| GET | `/enrollments/:courseId/progress` | Student | Enrollment detail + completed lessons |
| PUT | `/enrollments/:courseId/progress` | Student | **Update lesson completion** (legacy) |
| PATCH | `/enrollments/:courseId/progress` | Student | **Update lesson completion** ← NEW |

**PATCH/PUT body:**
```json
{ "lessonId": "<lessonObjectId>", "completed": true }
```
**Response:** `{ progress: 63, completedLessons: ["id1", "id2", ...] }`

---

### Admin (`/api/admin`) — All require `Admin` role

#### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/users` | List users (filter: role, status, search, paginated) |
| PUT | `/admin/users/:id/role` | Change user role |
| PUT | `/admin/users/:id/status` | **Suspend / Activate** user |

#### Courses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/courses` | All courses for moderation (filter: status, category, featured) |
| PUT | `/admin/courses/:id/status` | Approve (published) / Reject course |
| PUT | `/admin/courses/:id/featured` | **Toggle `isFeatured`** flag |

#### Enrollments (Manual Check-Verification)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/enrollments` | All enrollments (incl. `pending` payment ones) |
| POST | `/admin/enrollments` | Manually enroll a user in a course |
| PUT | `/admin/enrollments/:id/status` | **Approve (`active`) or Reject** a pending enrollment |
| DELETE | `/admin/enrollments/:id` | Remove enrollment |

#### Analytics & Activity
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/analytics` | Platform overview + revenue chart + category performance |
| GET | `/admin/activities` | Recent activity feed |

---

### Payments, Favorites, Categories, Announcements

All existing routes unchanged. See `postman_collection.json` for full collection.

---

## 3 — Middleware Architecture

```
protect          — Verifies JWT, attaches req.user, blocks suspended accounts
optionalProtect  — Same but silently skips if no token (used on public routes)
checkRole(...)   — Role whitelist middleware
restrictTo(...)  — Exact alias for checkRole (spec requirement)
```

**Usage examples:**
```typescript
// Students can't edit courses
router.put('/:id', protect, restrictTo('instructor', 'admin'), updateCourse);

// Instructors can't access admin tools
router.get('/users', protect, restrictTo('admin'), getUsers);

// Only students can enroll
router.post('/:courseId', protect, restrictTo('student'), enrollCourse);
```

---

## 4 — Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| email | String | unique, lowercase |
| password | String | bcrypt hashed, `select: false` |
| role | Enum | `student` · `instructor` · `admin` |
| profile.name | String | required |
| profile.avatar | String | DiceBear URL default |
| profile.bio | String | max 500 chars |
| status | Enum | `active` · `suspended` |
| resetPasswordToken | String | SHA256 hashed |
| resetPasswordExpire | Date | 10 min window |

### Course
| Field | Type | Notes |
|-------|------|-------|
| title | String | text-indexed |
| shortDescription | String | |
| slug | String | auto-generated from title |
| instructorId | ObjectId → User | |
| price | Number | ≥0 |
| category | String | |
| level | Enum | `beginner` · `intermediate` · `advanced` |
| thumbnail | String | CSS gradient or image URL |
| status | Enum | `draft` → `pending` → `published` ↔ `pending_unpublish` |
| isFeatured | Boolean | toggled by admin |
| sections | Array | embedded (also mirrored in Curriculum) |
| rating / reviewCount / students | Number | aggregated |

### Curriculum ← NEW
| Field | Type | Notes |
|-------|------|-------|
| courseId | ObjectId → Course | unique (1 curriculum per course) |
| sections[].title | String | |
| sections[].order | Number | |
| sections[].lessons[].title | String | |
| sections[].lessons[].videoUrl | String | hidden from public if not preview |
| sections[].lessons[].duration | Number | minutes |
| sections[].lessons[].contentType | Enum | `video` · `quiz` · `resource` · `text` |
| sections[].lessons[].isPreview | Boolean | free preview flag |
| **totalLessons** | Virtual | computed |
| **totalDuration** | Virtual | computed (minutes) |

### Enrollment
| Field | Type | Notes |
|-------|------|-------|
| studentId | ObjectId → User | |
| courseId | ObjectId → Course | |
| progress | Number | 0–100, auto-calculated |
| completedLessons | ObjectId[] | lesson IDs |
| status | Enum | `pending` · `active` · `rejected` |
| paymentReference | String | wire transfer / manual payment ref |
| lastAccessed | Date | updated on progress PATCH |

---

## 5 — Seed Database

```bash
# Full cinematic reset (5 courses, 2 instructors, 1 admin, 3 students)
npm run seed

# Marketplace data only (courses on top of existing users)
npm run seed:data
```

### Seeded Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | `admin@eduflow.com` | `admin123` |
| 🟡 Instructor | `sarah.runtime@eduflow.com` | `instructor123` |
| 🟡 Instructor | `marcus.dataforge@eduflow.com` | `instructor123` |
| 🟢 Student | `john.cipher@student.com` | `student123` |
| 🟢 Student | `maya.pixel@student.com` | `student123` |
| 🟢 Student | `leo.bytes@student.com` | `student123` |

### Seeded Courses (with cinematic gradients)

| # | Title | Instructor | Price | Status |
|---|-------|------------|-------|--------|
| 1 | Full-Stack React & Node.js | Sarah Runtime | $94.99 | Published ⭐ |
| 2 | Python & Machine Learning A-to-Z | Marcus Dataforge | $84.99 | Published ⭐ |
| 3 | Advanced Node.js: Microservices, GraphQL & Kafka | Sarah Runtime | $109.99 | Published ⭐ |
| 4 | UI/UX Design Systems: Figma to Production | Marcus Dataforge | $74.99 | Published |
| 5 | Blockchain & Web3: Build DeFi Apps | Sarah Runtime | $119.99 | Published |

**Pending enrollment for demo:** `leo.bytes@student.com` → Course 5  
→ Admin Nexus › Enrollments › Approve/Reject this to demo manual check-verification.

---

## 6 — CORS Configuration

```
Development: All localhost:* origins are automatically allowed
Production:  ALLOWED_ORIGINS env var (comma-separated Vercel/Render URLs)
             Any *.vercel.app domain is whitelisted automatically
```

---

## 7 — Frontend Integration

The frontend already uses `VITE_API_URL` from `.env`:

```
frontend/.env  →  VITE_API_URL=http://localhost:8000/api
```

The `lib/api.ts` `getApiBaseUrl()` function reads this variable first, then falls back to auto-detecting the Render production URL. **No frontend changes were needed** — all service files (`courseService.ts`, `enrollmentService.ts`, `adminService.ts`, etc.) already consume the correct endpoints.

**New curriculum endpoint** — add to `frontend/src/services/curriculumService.ts` when needed:
```typescript
export async function getCurriculum(courseId: string) {
  return apiRequest(`/curriculum/${courseId}`);
}
```

---

## 8 — Smoke Test Results (2026-02-24)

```
✅ GET  /health                          → { success: true }
✅ POST /auth/login (admin)              → JWT token issued
✅ GET  /courses                         → 5 courses, gradient thumbnails
✅ GET  /courses/instructor/stats        → totalStudents:4, earnings:$419.96
✅ GET  /curriculum/:id                  → 3 sections, 8 lessons, 241 min
✅ PATCH /enrollments/:id/progress       → 50% → 63% (5 completed lessons)
✅ GET  /admin/analytics                 → 6 users, 5 courses, $579.94 revenue
✅ GET  /admin/enrollments               → 1 pending (Leo Bytes, Blockchain course)
✅ PUT  /admin/enrollments/:id/status    → pending → active (manual verification ✓)
✅ PUT  /admin/courses/:id/featured      → isFeatured toggled false → true
✅ PUT  /admin/users/:id/status          → Maya Pixel suspended
✅ POST /auth/login (suspended user)     → 403 "Your account has been suspended"
✅ PUT  /admin/users/:id/status          → User restored to active
```
