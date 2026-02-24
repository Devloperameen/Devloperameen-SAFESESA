# EduFlow Platform - Quick Reference Guide

## 🚀 Server Status

### Backend Server
- **URL**: http://localhost:8000
- **API**: http://localhost:8000/api
- **Health**: http://localhost:8000/health
- **Status**: ✅ Running
- **Database**: ✅ Connected to MongoDB Atlas

### Frontend Application
- **URL**: http://localhost:8081
- **Status**: ✅ Running
- **API Connection**: ✅ Connected to backend

## 🔑 Test Credentials

### Admin Account
- **Email**: admin@eduflow.com
- **Password**: admin123
- **Access**: Full platform control

### Instructor Account
- **Email**: sarah.johnson@eduflow.com
- **Password**: instructor123
- **Access**: Course creation, dashboard, revenue

### Student Account
- **Email**: john.doe@student.com
- **Password**: student123
- **Access**: Course enrollment, learning, reviews

## 📱 Key Pages

### Public Pages
- **Home**: http://localhost:8081/
- **Courses**: http://localhost:8081/courses
- **Course Details**: http://localhost:8081/course/:id
- **Login**: http://localhost:8081/login
- **Signup**: http://localhost:8081/signup

### Student Pages (Login Required)
- **My Learning**: http://localhost:8081/my-learning
- **Course Player**: http://localhost:8081/learn/:id
- **Favorites**: http://localhost:8081/favorites
- **Payment**: http://localhost:8081/payment/:id

### Instructor Pages (Login Required)
- **Dashboard**: http://localhost:8081/instructor
- **My Courses**: http://localhost:8081/instructor/courses
- **Revenue**: http://localhost:8081/instructor/revenue
- **Messages**: http://localhost:8081/instructor/messages
- **Create Course**: http://localhost:8081/instructor/create
- **Edit Course**: http://localhost:8081/instructor/edit/:id

### Admin Pages (Login Required)
- **Overview**: http://localhost:8081/admin
- **Users**: http://localhost:8081/admin/users
- **Courses**: http://localhost:8081/admin/courses
- **Enrollments**: http://localhost:8081/admin/enrollments
- **Categories**: http://localhost:8081/admin/categories
- **Announcements**: http://localhost:8081/admin/announcements

## 🎯 Testing Workflow

### 1. Test Student Flow
```
1. Login as student (john.doe@student.com / student123)
2. Browse courses at /courses
3. Click on a course to view details
4. Click "Enroll Now" button
5. On payment page, enter any reference (e.g., "TEST-123")
6. Click "Bypass & Enroll"
7. See pending verification message
8. Go to /my-learning to see pending enrollment
```

### 2. Test Admin Verification
```
1. Logout and login as admin (admin@eduflow.com / admin123)
2. Go to /admin/enrollments
3. Find the pending enrollment
4. Click "Approve" to activate
5. Logout and login back as student
6. Go to /my-learning - enrollment is now active
7. Click "Continue Learning" to access course player
```

### 3. Test Video Watching
```
1. As student with active enrollment
2. Go to /learn/:courseId
3. Video player loads with first lesson
4. Click lessons in sidebar to switch
5. Click "Mark Complete" to track progress
6. Progress saves automatically
7. Complete 10%+ to unlock review option
```

### 4. Test Instructor Flow
```
1. Login as instructor (sarah.johnson@eduflow.com / instructor123)
2. Go to /instructor - see dashboard with stats
3. Go to /instructor/courses - see your courses
4. Click "Create Course" to add new course
5. Fill in course details and curriculum
6. Submit for review (status: pending)
7. Admin can approve/reject from /admin/courses
```

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Seed database with sample data
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://[credentials]
JWT_SECRET=[your-secret]
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:8081,...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## 🎨 Design System

### Colors
- **Primary**: #5B7FFF (Blue)
- **Background**: #020617 (Slate-950)
- **Card**: #0f172a (Slate-900)
- **Border**: #1e293b (Slate-800)
- **Success**: #10b981 (Emerald)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

### Typography
- **Headings**: Space Grotesk (bold, black)
- **Body**: Inter (regular, medium)
- **Code**: Monospace

### Spacing
- **Base**: 4px (Tailwind default)
- **Container**: max-w-7xl with padding
- **Cards**: p-4 to p-8
- **Gaps**: gap-4 to gap-8

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Instructor)
- `PUT /api/courses/:id` - Update course (Instructor)
- `DELETE /api/courses/:id` - Delete course (Instructor)

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `GET /api/enrollments/:courseId/progress` - Get progress
- `PUT /api/enrollments/:courseId/progress` - Update progress

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/enrollments` - Get all enrollments
- `PUT /api/admin/enrollments/:id/status` - Approve/reject

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID [process-id] /F

# Restart backend
cd backend
npm run dev
```

### Frontend won't start
```bash
# Check if port is in use
netstat -ano | findstr :8081

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database connection error
- Check MongoDB Atlas connection string
- Verify network access in Atlas
- Check if IP is whitelisted
- Verify credentials are correct

### API requests failing
- Check backend is running on port 8000
- Verify CORS settings in backend/.env
- Check frontend .env has correct API URL
- Open browser console for error details

## 📝 Notes

### Payment System
- Currently intentional (non-functional)
- Shows professional UI with clear notice
- Allows bypass for testing purposes
- Creates pending enrollment for admin verification
- Will be integrated with real payment gateway later

### Video Support
- YouTube (all formats)
- Vimeo (standard URLs)
- Direct video files (.mp4, .webm, .ogg, .m3u8)
- Paste video URL in course curriculum

### Image Recommendations
- Course thumbnails: 800x450px (16:9 ratio)
- User avatars: 200x200px (square)
- Use Unsplash for high-quality stock images
- Format: JPEG or WebP for best performance

---

**Quick Start**: Login as student → Browse courses → Enroll → Admin approves → Watch videos → Track progress

**Support**: Check DEPLOYMENT_STATUS.md and IMPROVEMENTS_SUMMARY.md for detailed information
