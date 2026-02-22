# EduFlow Backend - Quick Start Guide

Get your EduFlow backend up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
cd eduflow-backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB URI:
```env
MONGODB_URI=mongodb://localhost:27017/eduflow
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduflow
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Login as Student
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@student.com",
    "password": "student123"
  }'
```

Save the token from the response!

### Get Courses
```bash
curl http://localhost:5000/api/courses
```

### Get My Profile (Protected)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 👥 Test Accounts

After running `npm run seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eduflow.com | admin123 |
| Instructor | sarah.johnson@eduflow.com | instructor123 |
| Student | john.doe@student.com | student123 |

## 🎯 Common Tasks

### Create a New Course (as Instructor)
1. Login as instructor
2. Use the token to POST to `/api/courses`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Course",
    "description": "Course description",
    "price": 49.99,
    "category": "Web Development",
    "level": "beginner"
  }'
```

### Enroll in a Course (as Student)
```bash
curl -X POST http://localhost:5000/api/enrollments/COURSE_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### Approve a Course (as Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/courses/COURSE_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'
```

## 🔧 Development Tips

### Watch Mode
```bash
npm run dev
```
Auto-reloads on file changes.

### Check Logs
The server logs all HTTP requests in development mode.

### Reset Database
```bash
npm run seed
```
This clears all data and reseeds with fresh sample data.

## 🌐 Connect Frontend

In your frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Then use in your code:
```typescript
const API_URL = import.meta.env.VITE_API_URL;

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Protected request
const response = await fetch(`${API_URL}/courses`, {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
});
```

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all endpoints
- Explore the code in `src/` directory
- Customize models, controllers, and routes for your needs

## ❓ Troubleshooting

**Port already in use?**
Change `PORT` in `.env` file.

**MongoDB connection failed?**
- Check if MongoDB is running: `mongod`
- Verify connection string in `.env`

**CORS errors?**
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🎉 You're Ready!

Your EduFlow backend is now running and ready to serve both the marketplace and admin hub frontends!
