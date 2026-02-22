import dotenv from 'dotenv';
import connectDB from '../config/db';
import User from '../models/User';
import Course from '../models/Course';
import Category from '../models/Category';
import Enrollment from '../models/Enrollment';
import Favorite from '../models/Favorite';
import Activity from '../models/Activity';
import Announcement from '../models/Announcement';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Category.deleteMany({});
    await Enrollment.deleteMany({});
    await Favorite.deleteMany({});
    await Activity.deleteMany({});
    await Announcement.deleteMany({});

    console.log('👥 Creating users...');
    
    // Create admin
    await User.create({
      email: 'admin@eduflow.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        name: 'Admin User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    });

    // Create instructors
    const instructors = await User.create([
      {
        email: 'sarah.johnson@eduflow.com',
        password: 'instructor123',
        role: 'instructor',
        profile: {
          name: 'Sarah Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          bio: 'Full-stack developer with 10+ years of experience in web development.',
        },
      },
      {
        email: 'michael.chen@eduflow.com',
        password: 'instructor123',
        role: 'instructor',
        profile: {
          name: 'Michael Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
          bio: 'Data scientist and machine learning expert.',
        },
      },
      {
        email: 'emily.davis@eduflow.com',
        password: 'instructor123',
        role: 'instructor',
        profile: {
          name: 'Emily Davis',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
          bio: 'UI/UX designer passionate about creating beautiful interfaces.',
        },
      },
    ]);

    // Create students
    const students = await User.create([
      {
        email: 'john.doe@student.com',
        password: 'student123',
        role: 'student',
        profile: {
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        },
      },
      {
        email: 'jane.smith@student.com',
        password: 'student123',
        role: 'student',
        profile: {
          name: 'Jane Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        },
      },
    ]);

    console.log('📚 Creating categories...');
    await Category.create([
      { name: 'Web Development', description: 'Learn modern web development technologies' },
      { name: 'Data Science', description: 'Master data analysis and machine learning' },
      { name: 'Mobile Development', description: 'Build native and cross-platform mobile apps' },
      { name: 'Design', description: 'UI/UX design and graphic design courses' },
      { name: 'Business', description: 'Business strategy and entrepreneurship' },
      { name: 'Marketing', description: 'Digital marketing and social media' },
    ]);

    console.log('🎓 Creating courses...');
    const courses = await Course.create([
      {
        title: 'Complete React Developer Course',
        description: 'Master React.js by building real-world projects. Learn hooks, context, Redux, and more.',
        instructorId: instructors[0]._id,
        price: 89.99,
        category: 'Web Development',
        level: 'intermediate',
        thumbnail: '/placeholder.svg',
        status: 'published',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 1250,
        students: 5420,
        sections: [
          {
            title: 'Getting Started',
            lessons: [
              { title: 'Introduction to React', videoUrl: 'https://example.com/video1', duration: 15, order: 1 },
              { title: 'Setting Up Development Environment', videoUrl: 'https://example.com/video2', duration: 20, order: 2 },
            ],
          },
          {
            title: 'React Fundamentals',
            lessons: [
              { title: 'Components and Props', videoUrl: 'https://example.com/video3', duration: 25, order: 1 },
              { title: 'State and Lifecycle', videoUrl: 'https://example.com/video4', duration: 30, order: 2 },
            ],
          },
        ],
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming and data analysis with pandas, numpy, and matplotlib.',
        instructorId: instructors[1]._id,
        price: 79.99,
        category: 'Data Science',
        level: 'beginner',
        thumbnail: '/placeholder.svg',
        status: 'published',
        isFeatured: true,
        rating: 4.7,
        reviewCount: 980,
        students: 3200,
        sections: [
          {
            title: 'Python Basics',
            lessons: [
              { title: 'Variables and Data Types', videoUrl: 'https://example.com/video5', duration: 18, order: 1 },
              { title: 'Control Flow', videoUrl: 'https://example.com/video6', duration: 22, order: 2 },
            ],
          },
        ],
      },
      {
        title: 'UI/UX Design Masterclass',
        description: 'Learn user interface and user experience design from scratch.',
        instructorId: instructors[2]._id,
        price: 69.99,
        category: 'Design',
        level: 'beginner',
        thumbnail: '/placeholder.svg',
        status: 'published',
        isFeatured: false,
        rating: 4.9,
        reviewCount: 750,
        students: 2100,
        sections: [
          {
            title: 'Design Principles',
            lessons: [
              { title: 'Color Theory', videoUrl: 'https://example.com/video7', duration: 20, order: 1 },
              { title: 'Typography', videoUrl: 'https://example.com/video8', duration: 25, order: 2 },
            ],
          },
        ],
      },
      {
        title: 'Advanced Node.js Development',
        description: 'Build scalable backend applications with Node.js and Express.',
        instructorId: instructors[0]._id,
        price: 99.99,
        category: 'Web Development',
        level: 'advanced',
        thumbnail: '/placeholder.svg',
        status: 'published',
        isFeatured: false,
        rating: 4.6,
        reviewCount: 620,
        students: 1800,
        sections: [
          {
            title: 'Node.js Fundamentals',
            lessons: [
              { title: 'Event Loop', videoUrl: 'https://example.com/video9', duration: 30, order: 1 },
            ],
          },
        ],
      },
      {
        title: 'Machine Learning A-Z',
        description: 'Complete guide to machine learning algorithms and applications.',
        instructorId: instructors[1]._id,
        price: 94.99,
        category: 'Data Science',
        level: 'intermediate',
        thumbnail: '/placeholder.svg',
        status: 'pending',
        isFeatured: false,
        rating: 0,
        reviewCount: 0,
        students: 0,
        sections: [],
      },
      {
        title: 'Mobile App Development with React Native',
        description: 'Build cross-platform mobile apps using React Native.',
        instructorId: instructors[0]._id,
        price: 84.99,
        category: 'Mobile Development',
        level: 'intermediate',
        thumbnail: '/placeholder.svg',
        status: 'draft',
        isFeatured: false,
        rating: 0,
        reviewCount: 0,
        students: 0,
        sections: [],
      },
    ]);

    // Update category counts
    await Category.findOneAndUpdate({ name: 'Web Development' }, { courseCount: 3 });
    await Category.findOneAndUpdate({ name: 'Data Science' }, { courseCount: 2 });
    await Category.findOneAndUpdate({ name: 'Design' }, { courseCount: 1 });
    await Category.findOneAndUpdate({ name: 'Mobile Development' }, { courseCount: 1 });

    console.log('📝 Creating enrollments...');
    await Enrollment.create([
      {
        studentId: students[0]._id,
        courseId: courses[0]._id,
        progress: 45,
        completedLessons: [courses[0].sections[0].lessons[0]._id],
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: students[0]._id,
        courseId: courses[1]._id,
        progress: 20,
        completedLessons: [],
        lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: students[1]._id,
        courseId: courses[0]._id,
        progress: 80,
        completedLessons: [
          courses[0].sections[0].lessons[0]._id,
          courses[0].sections[0].lessons[1]._id,
        ],
        lastAccessed: new Date(),
      },
    ]);

    console.log('⭐ Creating favorites...');
    await Favorite.create([
      { userId: students[0]._id, courseId: courses[2]._id },
      { userId: students[0]._id, courseId: courses[3]._id },
    ]);

    console.log('📢 Creating announcements...');
    await Announcement.create([
      {
        title: 'Welcome to EduFlow!',
        content: 'We are excited to have you here. Start learning today!',
        active: true,
      },
      {
        title: 'New Courses Added',
        content: 'Check out our latest courses in Data Science and Web Development.',
        active: true,
      },
      {
        title: 'Platform Maintenance',
        content: 'Scheduled maintenance on Sunday 2AM-4AM EST.',
        active: false,
      },
    ]);

    console.log('📊 Creating activities...');
    await Activity.create([
      {
        type: 'signup',
        message: `${students[0].profile.name} joined as student`,
        userId: students[0]._id,
      },
      {
        type: 'enrollment',
        message: `${students[0].profile.name} enrolled in "${courses[0].title}"`,
        userId: students[0]._id,
        courseId: courses[0]._id,
      },
      {
        type: 'course_created',
        message: `New course "${courses[0].title}" created`,
        userId: instructors[0]._id,
        courseId: courses[0]._id,
      },
      {
        type: 'course_approved',
        message: `Course "${courses[0].title}" approved`,
        courseId: courses[0]._id,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@eduflow.com / admin123');
    console.log('Instructor: sarah.johnson@eduflow.com / instructor123');
    console.log('Student: john.doe@student.com / student123');
    console.log('\n📊 Summary:');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Courses: ${await Course.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Enrollments: ${await Enrollment.countDocuments()}`);
    console.log(`Favorites: ${await Favorite.countDocuments()}`);
    console.log(`Activities: ${await Activity.countDocuments()}`);
    console.log(`Announcements: ${await Announcement.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
