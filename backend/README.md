# EduFlow Backend API

Production-ready Node.js/Express backend with TypeScript and MongoDB for the EduFlow learning platform. This backend serves both the **eduflow-marketplace** (Student/Instructor) and **eduflow-admin-hub** (Admin) frontends.

## 🚀 Features

- **TypeScript** - Type-safe backend development
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Student, Instructor, and Admin roles
- **RESTful API** - Clean and organized API endpoints
- **Security** - Helmet, CORS, rate limiting, password hashing
- **Validation** - Express-validator for input validation
- **Error Handling** - Centralized error handling middleware
- **Logging** - Morgan for HTTP request logging
- **Compression** - Response compression for better performance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to the backend directory:**
```bash
cd eduflow-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eduflow?retryWrites=true&w=majority
```

## 🗄️ Database Setup

**Seed the database with sample data:**
```bash
npm run seed
```

This will create:
- Admin, Instructor, and Student users
- Sample courses with curriculum
- Categories
- Enrollments
- Favorites
- Activities
- Announcements

**Test Credentials:**
- Admin: `admin@eduflow.com` / `admin123`
- Instructor: `sarah.johnson@eduflow.com` / `instructor123`
- Student: `john.doe@student.com` / `student123`

## 🏃 Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `PUT /profile` - Update user profile (Protected)

### Courses (`/api/courses`)
- `GET /` - Get all courses (Public, with filters)
- `GET /:id` - Get single course (Public)
- `POST /` - Create course (Instructor)
- `PUT /:id` - Update course (Instructor)
- `DELETE /:id` - Delete course (Instructor)
- `GET /instructor/my-courses` - Get instructor's courses (Instructor)
- `GET /instructor/stats` - Get instructor dashboard stats (Instructor)

### Enrollments (`/api/enrollments`)
- `POST /:courseId` - Enroll in course (Student)
- `GET /` - Get user enrollments (Student)
- `GET /:courseId/progress` - Get enrollment progress (Student)
- `PUT /:courseId/progress` - Update lesson completion (Student)

### Favorites (`/api/favorites`)
- `GET /` - Get user favorites (Protected)
- `POST /:courseId` - Add to favorites (Protected)
- `DELETE /:courseId` - Remove from favorites (Protected)

### Categories (`/api/categories`)
- `GET /` - Get all categories (Public)
- `POST /` - Create category (Admin)
- `PUT /:id` - Update category (Admin)
- `DELETE /:id` - Delete category (Admin)

### Announcements (`/api/announcements`)
- `GET /` - Get all announcements (Public)
- `POST /` - Create announcement (Admin)
- `PUT /:id` - Update announcement (Admin)
- `DELETE /:id` - Delete announcement (Admin)
- `PUT /:id/active` - Toggle active status (Admin)

### Admin (`/api/admin`)
- `GET /users` - Get all users (Admin)
- `PUT /users/:id/role` - Update user role (Admin)
- `PUT /users/:id/status` - Suspend/activate user (Admin)
- `PUT /courses/:id/status` - Approve/reject course (Admin)
- `PUT /courses/:id/featured` - Toggle featured status (Admin)
- `GET /analytics` - Get platform analytics (Admin)
- `GET /activities` - Get recent activities (Admin)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

**Example login request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

**Example authenticated request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🎭 Role-Based Access

- **Student**: Browse courses, enroll, track progress, manage favorites
- **Instructor**: Create/edit courses, view dashboard stats, manage curriculum
- **Admin**: User management, course moderation, platform analytics, announcements

## 📊 Database Schema

### User
```typescript
{
  email: string;
  password: string (hashed);
  role: 'student' | 'instructor' | 'admin';
  profile: {
    name: string;
    avatar: string;
    bio: string;
  };
  status: 'active' | 'suspended';
  joinDate: Date;
}
```

### Course
```typescript
{
  title: string;
  slug: string;
  description: string;
  instructorId: ObjectId (ref: User);
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  rejectionReason: string;
  isFeatured: boolean;
  sections: [{
    title: string;
    lessons: [{
      title: string;
      videoUrl: string;
      duration: number;
      order: number;
    }]
  }];
  rating: number;
  reviewCount: number;
  students: number;
}
```

### Enrollment
```typescript
{
  studentId: ObjectId (ref: User);
  courseId: ObjectId (ref: Course);
  progress: number (0-100);
  completedLessons: ObjectId[];
  enrolledAt: Date;
  lastAccessed: Date;
}
```

## 🔒 Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Configured for multiple frontend origins
- **Rate Limiting** - Prevents brute force attacks
- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure authentication
- **Input Validation** - Express-validator
- **MongoDB Injection Protection** - Mongoose sanitization

## 🧪 Testing

**Health check:**
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "EduFlow API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📁 Project Structure

```
eduflow-backend/
├── src/
│   ├── config/
│   │   └── db.ts                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts     # Authentication logic
│   │   ├── courseController.ts   # Course CRUD
│   │   ├── enrollmentController.ts
│   │   ├── adminController.ts
│   │   ├── favoriteController.ts
│   │   ├── categoryController.ts
│   │   └── announcementController.ts
│   ├── middleware/
│   │   ├── auth.ts               # JWT & role checking
│   │   ├── errorHandler.ts       # Error handling
│   │   └── validator.ts          # Input validation
│   ├── models/
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── Enrollment.ts
│   │   ├── Favorite.ts
│   │   ├── Category.ts
│   │   ├── Activity.ts
│   │   └── Announcement.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── enrollmentRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── favoriteRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   └── announcementRoutes.ts
│   ├── scripts/
│   │   └── seed.ts               # Database seeding
│   └── server.ts                 # Express app setup
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚢 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://your-marketplace.com,https://your-admin.com
```

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### Start Production Server

```bash
npm start
```

## 🤝 Frontend Integration

### Marketplace Frontend (Student/Instructor)
Configure API base URL: `http://localhost:5000/api`

### Admin Hub Frontend
Configure API base URL: `http://localhost:5000/api`

Both frontends use the same backend with role-based access control.

## 📝 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access in MongoDB Atlas

**CORS Error:**
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

**Authentication Error:**
- Check JWT_SECRET is set in `.env`
- Verify token is included in Authorization header

## 📄 License

MIT

## 👨‍💻 Support

For issues or questions, please create an issue in the repository.
