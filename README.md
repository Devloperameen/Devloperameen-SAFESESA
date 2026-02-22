# EduFlow - Learning Management System

A complete, production-ready Learning Management System with role-based access control for Students, Instructors, and Administrators.

## 🚀 Features

### For Students
- Browse and search courses
- Enroll in courses
- Track learning progress
- Save favorite courses
- View course curriculum and lessons

### For Instructors
- Create and manage courses
- Add curriculum with sections and lessons
- Track course analytics
- Manage enrollments
- View revenue

### For Administrators
- User management
- Course moderation and approval
- Category management
- System announcements
- Platform analytics

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **TypeScript** - Type safety

### Frontend
- **React 18** + **TypeScript** - UI Framework
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **React Router** - Navigation
- **Shadcn/ui** - UI Components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## 📁 Project Structure

```
SKILL FINAL PROJECT/
├── eduflow-backend/          # Backend API
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth & validation
│   │   └── server.ts         # Entry point
│   └── package.json
│
├── eduflow-admin-hub-eebbc729/  # Frontend App
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── lib/              # Utilities & API
│   │   └── App.tsx           # Main app
│   └── package.json
│
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remote)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Devloperameen/new-Edu-market.git
cd new-Edu-market
```

### 2. Setup Backend
```bash
cd eduflow-backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduflow
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
Backend runs on: http://localhost:5000

### 3. Setup Frontend
```bash
cd eduflow-admin-hub-eebbc729
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Student** | john.doe@student.com | student123 |
| **Instructor** | sarah.johnson@eduflow.com | instructor123 |
| **Admin** | admin@eduflow.com | admin123 |

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Instructor)
- `PUT /api/courses/:id` - Update course (Instructor)
- `DELETE /api/courses/:id` - Delete course (Instructor)
- `GET /api/courses/instructor/my-courses` - Get instructor courses

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `GET /api/enrollments/:courseId/progress` - Get progress
- `PUT /api/enrollments/:courseId/progress` - Update progress

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/courses/:id/status` - Approve/reject course
- `GET /api/admin/analytics` - Get platform analytics

**Total: 35+ API endpoints**

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- Protected routes

## 🎨 UI Features

- Responsive design
- Dark/Light mode support
- Smooth animations
- Loading states
- Error handling
- Toast notifications
- Profile dialog
- Course management

## 📖 Documentation

- [Backend Documentation](./eduflow-backend/README.md)
- [API Documentation](./eduflow-backend/API_DOCUMENTATION.md)
- [Installation Guide](./eduflow-backend/INSTALLATION_GUIDE.md)
- [Deployment Guide](./eduflow-backend/DEPLOYMENT.md)
- [Integration Guide](./INTEGRATION_COMPLETE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ameen**
- GitHub: [@Devloperameen](https://github.com/Devloperameen)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular LMS platforms
- UI components from Shadcn/ui

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 2026
