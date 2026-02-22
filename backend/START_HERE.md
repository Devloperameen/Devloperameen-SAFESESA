# 🚀 EduFlow Backend - START HERE

Welcome to the EduFlow backend! This is your starting point.

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Navigate to backend
cd eduflow-backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env and set your MongoDB URI

# 4. Seed database
npm run seed

# 5. Start server
npm run dev
```

Server runs at: `http://localhost:5000`

## 📋 Test Credentials

After seeding, use these to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eduflow.com | admin123 |
| Instructor | sarah.johnson@eduflow.com | instructor123 |
| Student | john.doe@student.com | student123 |

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@student.com","password":"student123"}'

# Get courses
curl http://localhost:5000/api/courses
```

## 📚 Documentation

Choose your path:

### 🏃 I want to start quickly
→ Read **QUICK_START.md**

### 📖 I want complete setup instructions
→ Read **INSTALLATION_GUIDE.md**

### 🔍 I want to understand the API
→ Read **API_DOCUMENTATION.md**

### 🚀 I want to deploy to production
→ Read **DEPLOYMENT.md**

### 📊 I want project overview
→ Read **PROJECT_SUMMARY.md**

### 📘 I want everything
→ Read **README.md**

## 🎯 What This Backend Does

✅ Serves both marketplace and admin hub frontends
✅ Handles authentication for 3 roles (Student, Instructor, Admin)
✅ Manages courses, enrollments, and progress tracking
✅ Provides admin dashboard with analytics
✅ Implements role-based access control
✅ Includes 35+ RESTful API endpoints
✅ Uses MongoDB with Mongoose ODM
✅ Built with TypeScript for type safety
✅ Production-ready with security best practices

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Atlas or local)
- **ODM:** Mongoose
- **Auth:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate limiting

## 📡 API Endpoints

- `/api/auth` - Authentication (register, login, profile)
- `/api/courses` - Course management
- `/api/enrollments` - Student enrollments
- `/api/favorites` - Favorite courses
- `/api/categories` - Course categories
- `/api/announcements` - Platform announcements
- `/api/admin` - Admin operations

## 🔗 Connect Frontend

In your frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Then in your code:
```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL}/courses`);
```

## 🐛 Troubleshooting

**MongoDB connection failed?**
- Check if MongoDB is running
- Verify connection string in `.env`

**Port 5000 in use?**
- Change `PORT` in `.env`

**CORS errors?**
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

## 📞 Need Help?

1. Check the documentation files listed above
2. Review error messages in terminal
3. Verify environment variables in `.env`
4. Ensure MongoDB is running and accessible

## ✅ Checklist

- [ ] Dependencies installed
- [ ] MongoDB configured
- [ ] Environment variables set
- [ ] Database seeded
- [ ] Server running
- [ ] Health check passed
- [ ] Login tested
- [ ] Frontend connected

## 🎉 You're Ready!

Once the server is running and tests pass, you're all set!

**Next steps:**
1. Test the API with Postman (import `postman_collection.json`)
2. Connect your frontend applications
3. Customize the code for your needs
4. Deploy to production when ready

---

**Happy coding! 🚀**

For detailed information, see the documentation files in this directory.
