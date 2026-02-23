
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import Course from '../models/Course';
import Category from '../models/Category';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import Review from '../models/Review';
import Activity from '../models/Activity';

dotenv.config();

const categories = [
    { name: 'Web Development', slug: 'web-development', icon: 'Code', description: 'Build modern websites and web applications.' },
    { name: 'Data Science', slug: 'data-science', icon: 'data-science', description: 'Analyze data and build machine learning models.' },
    { name: 'Business', slug: 'business', icon: 'Briefcase', description: 'Learn management, marketing, and entrepreneurship.' },
    { name: 'Design', slug: 'design', icon: 'Palette', description: 'Master UI/UX, graphic design, and branding.' },
    { name: 'Marketing', slug: 'marketing', icon: 'Megaphone', description: 'Digital marketing, SEO, and social media.' },
    { name: 'Personal Development', slug: 'personal-development', icon: 'User', description: 'Soft skills, productivity, and leadership.' },
];

const coursesData = [
    {
        title: 'Modern React with Redux [2024 Update]',
        shortDescription: 'Master React and Redux with React Router, Webpack, and Hooks. Includes over 10 real-world projects!',
        description: 'This is the most comprehensive React course available on the market. You will learn everything from the basics to advanced concepts like performance optimization and custom hooks.\\n\\nWhat you will learn:\\n- Components, Props, and State\\n- Handling User Input\\n- Making API Requests with Axios\\n- Building reusable components\\n- Advanced state management with Redux and Context API\\n- React Router for navigation\\n- Deployed production-ready apps.',
        previewVideoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        price: 49.99,
        category: 'Web Development',
        level: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        reviewCount: 1240,
        students: 15400,
        isFeatured: true,
        status: 'published',
        sections: [
            {
                title: 'Introduction to React',
                lessons: [
                    { title: 'Welcome to the Course', videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk', duration: 330, order: 1 },
                    { title: 'What is React?', videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration: 735, order: 2 },
                ],
            },
            {
                title: 'Working with State',
                lessons: [
                    { title: 'Understanding useState', videoUrl: 'https://www.youtube.com/watch?v=4dBv7G-0Y6s', duration: 920, order: 1 },
                    { title: 'useEffect Deep Dive', videoUrl: 'https://www.youtube.com/watch?v=0ZJgJwR629w', duration: 1365, order: 2 },
                ],
            },
        ],
    },
    {
        title: 'Python for Data Science Masterclass',
        shortDescription: 'The complete guide to Python for Data Science and Machine Learning. Use NumPy, Pandas, Matplotlib, and Scikit-Learn.',
        description: 'Learn how to use Python for Data Science! Professional level training on Data Analysis, Machine Learning, and Visualization. We start with Python crash course and move to complex libraries.',
        previewVideoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        price: 39.99,
        category: 'Data Science',
        level: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
        reviewCount: 850,
        students: 9200,
        isFeatured: false,
        status: 'published',
        sections: [
            {
                title: 'Python Essentials',
                lessons: [
                    { title: 'Setting up Jupyter Notebook', videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: 600, order: 1 },
                    { title: 'Data Types and Variables', videoUrl: 'https://www.youtube.com/watch?v=vLqTf2b6GZw', duration: 1110, order: 2 },
                ],
            },
        ],
    },
    {
        title: 'UI/UX Design Essentials in Figma',
        shortDescription: 'Master Figma for web and mobile design. Learn the entire UI/UX process from wireframing to prototyping.',
        description: 'Go from beginner to pro in UI/UX Design using Figma. This course covers layout, color theory, typography, and interactive prototyping.',
        previewVideoUrl: 'https://www.youtube.com/watch?v=Gu1axXGk6Vw',
        price: 59.99,
        category: 'Design',
        level: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        reviewCount: 2100,
        students: 12000,
        isFeatured: true,
        status: 'published',
        sections: [
            {
                title: 'Figma Basics',
                lessons: [
                    { title: 'Touring the Interface', videoUrl: 'https://www.youtube.com/watch?v=Gu1axXGk6Vw', duration: 525, order: 1 },
                    { title: 'Shapes and Colors', videoUrl: 'https://www.youtube.com/watch?v=3qU_P_8n3fM', duration: 860, order: 2 },
                ],
            },
        ],
    },
    {
        title: 'The Ultimate Guide to Digital Marketing',
        shortDescription: 'Master SEO, Social Media Marketing, PPC, and Email Marketing. Start your career in Digital Marketing today!',
        description: 'Comprehensive digital marketing course covering all major channels. Learn how to grow businesses using data-driven strategies.',
        previewVideoUrl: 'https://www.youtube.com/watch?v=_v_97S8zH9c',
        price: 29.99,
        category: 'Marketing',
        level: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
        rating: 4.5,
        reviewCount: 620,
        students: 5400,
        isFeatured: false,
        status: 'published',
        sections: [
            {
                title: 'Search Engine Optimization',
                lessons: [
                    { title: 'Intro to SEO', videoUrl: 'https://www.youtube.com/watch?v=_v_97S8zH9c', duration: 900, order: 1 },
                    { title: 'Keyword Research', videoUrl: 'https://www.youtube.com/watch?v=kS5_fN9S2k0', duration: 1210, order: 2 },
                ],
            },
        ],
    }
];

async function seed() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');

        // Find an instructor and admin
        const instructor = await User.findOne({ role: 'instructor' });
        const admin = await User.findOne({ role: 'admin' });

        if (!instructor || !admin) {
            console.log('Error: Could not find instructor and/or admin user. Please create them first.');
            process.exit(1);
        }

        // Clear existing data
        await Course.deleteMany({});
        await Category.deleteMany({});
        await Enrollment.deleteMany({});
        await Review.deleteMany({});
        await Activity.deleteMany({});

        console.log('Cleaned up previous data.');

        // Seed Categories
        await Category.insertMany(categories);
        console.log('Seeded categories.');

        // Seed Courses
        const coursesToSave = coursesData.map(c => ({
            ...c,
            slug: slugify(c.title, { lower: true, strict: true }),
            instructorId: instructor._id,
        }));

        const createdCourses = await Course.insertMany(coursesToSave);
        console.log(`Seeded ${createdCourses.length} courses.`);

        // Update category counts
        for (const cat of categories) {
            const count = await Course.countDocuments({ category: cat.name });
            await Category.findOneAndUpdate({ name: cat.name }, { courseCount: count });
        }

        // Seed some reviews
        for (const c of createdCourses) {
            await Review.create({
                rating: 5,
                comment: 'Highly recommended! The content is clear and the projects are very practical.',
                studentId: admin._id,
                courseId: c._id,
            });

            await Activity.create({
                type: 'publish',
                message: `New high-quality course "${c.title}" is now available for learners.`,
                userId: instructor._id,
                courseId: c._id,
            });
        }

        console.log('Seeding complete! 🚀');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
