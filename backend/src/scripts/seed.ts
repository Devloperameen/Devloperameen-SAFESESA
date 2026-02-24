/**
 * ============================================================
 *  EDUFLOW — Full Database Seed (npm run seed)
 *  Populates MongoDB with cinematic, production-quality data:
 *    • 1 Admin
 *    • 2 Instructors
 *    • 5 Cinematic marketplace courses (gradient thumbnails)
 *    • 3 Students with realistic enrollments & progress
 *    • Reviews, Activities, Favorites, Announcements
 * ============================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db';
import User from '../models/User';
import Course from '../models/Course';
import Curriculum from '../models/Curriculum';
import Category from '../models/Category';
import Enrollment from '../models/Enrollment';
import Favorite from '../models/Favorite';
import Activity from '../models/Activity';
import Announcement from '../models/Announcement';
import Review from '../models/Review';
import Transaction from '../models/Transaction';

// ─── Cinematic gradient thumbnails ────────────────────────────────────────────
// These render as beautiful CSS gradients in the "Dark Industrial" UI.
const THUMBNAILS = {
  cyberpunk:
    'linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)',
  emerald:
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  crimson:
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #e94560 100%)',
  gold:
    'linear-gradient(135deg, #0f2027 0%, #78350f 50%, #d97706 100%)',
  violet:
    'linear-gradient(135deg, #06080f 0%, #1e0533 50%, #6d28d9 100%)',
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    await connectDB();

    // ── Wipe existing data ──────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Curriculum.deleteMany({}),
      Category.deleteMany({}),
      Enrollment.deleteMany({}),
      Favorite.deleteMany({}),
      Activity.deleteMany({}),
      Announcement.deleteMany({}),
      Review.deleteMany({}),
      Transaction.deleteMany({}),
    ]);

    // ── Users ───────────────────────────────────────────────────────────────
    console.log('👥 Creating users...');

    // 1 Admin
    const admin = await User.create({
      email: 'admin@eduflow.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        name: 'Alex Nexus',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin-nexus',
        bio: 'Platform administrator overseeing content quality and community standards.',
      },
      status: 'active',
    });

    // 2 Instructors
    const [instructor1, instructor2] = await User.create([
      {
        email: 'sarah.runtime@eduflow.com',
        password: 'instructor123',
        role: 'instructor',
        profile: {
          name: 'Sarah Runtime',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-runtime',
          bio:
            'Senior software architect with 12 years building production systems. ' +
            'Passionate about teaching scalable backend patterns, cloud-native design, ' +
            'and modern JavaScript/TypeScript ecosystems.',
        },
        status: 'active',
      },
      {
        email: 'marcus.dataforge@eduflow.com',
        password: 'instructor123',
        role: 'instructor',
        profile: {
          name: 'Marcus Dataforge',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus-dataforge',
          bio:
            'ML researcher and data engineer who has shipped models at scale for Fortune 500 companies. ' +
            'Specializes in Python, PyTorch, and real-world AI application development.',
        },
        status: 'active',
      },
    ]);

    // 3 Students
    const [student1, student2, student3] = await User.create([
      {
        email: 'john.cipher@student.com',
        password: 'student123',
        role: 'student',
        profile: {
          name: 'John Cipher',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john-cipher',
          bio: 'Aspiring full-stack developer transitioning from a finance background.',
        },
        status: 'active',
      },
      {
        email: 'maya.pixel@student.com',
        password: 'student123',
        role: 'student',
        profile: {
          name: 'Maya Pixel',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya-pixel',
          bio: 'UI/UX enthusiast learning to code her own designs.',
        },
        status: 'active',
      },
      {
        email: 'leo.bytes@student.com',
        password: 'student123',
        role: 'student',
        profile: {
          name: 'Leo Bytes',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leo-bytes',
        },
        status: 'active',
      },
    ]);

    // ── Categories ──────────────────────────────────────────────────────────
    console.log('📂 Creating categories...');
    await Category.create([
      {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Build modern, performant web applications and APIs.',
        courseCount: 0,
      },
      {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Harness data with Python, ML models, and statistical analysis.',
        courseCount: 0,
      },
      {
        name: 'Mobile Development',
        slug: 'mobile-development',
        description: 'Create native and cross-platform mobile experiences.',
        courseCount: 0,
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX, visual design, and interactive prototyping.',
        courseCount: 0,
      },
      {
        name: 'DevOps & Cloud',
        slug: 'devops-cloud',
        description: 'Infrastructure, CI/CD, Kubernetes, and cloud platforms.',
        courseCount: 0,
      },
      {
        name: 'Blockchain',
        slug: 'blockchain',
        description: 'Smart contracts, DeFi protocols, and Web3 development.',
        courseCount: 0,
      },
    ]);

    // ── Courses (5 cinematic marketplace courses) ───────────────────────────
    console.log('🎓 Creating cinematic courses...');

    const courses = await Course.create([
      // ── Course 1 ──────────────────────────────────────────────────────────
      {
        title: 'Full-Stack React & Node.js: Build Production Apps',
        shortDescription:
          'Master the complete MERN stack — React 18, Node.js, MongoDB, JWT auth — and deploy to production.',
        description:
          'This is the definitive full-stack course for developers who want to work at a senior level. ' +
          'You will design a production-grade REST API with Express, model complex relationships with Mongoose, ' +
          'build a React 18 frontend with TypeScript, implement JWT authentication, write unit tests, ' +
          'and deploy to Render/Vercel with CI/CD pipelines. Every lesson is backed by real code you ship.',
        instructorId: instructor1._id,
        price: 94.99,
        category: 'Web Development',
        level: 'intermediate',
        thumbnail: THUMBNAILS.cyberpunk,
        status: 'published',
        isFeatured: true,
        rating: 4.9,
        reviewCount: 3842,
        students: 28400,
        sections: [
          {
            title: 'Architecture & Project Setup',
            lessons: [
              {
                title: 'Course Overview & What We Are Building',
                description: 'High-level walkthrough of the production app and tech stack decisions.',
                videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
                duration: 12,
                order: 1,
              },
              {
                title: 'Monorepo Setup with TypeScript',
                description: 'Configure a monorepo with shared tsconfig, ESLint, and Prettier.',
                videoUrl: 'https://www.youtube.com/watch?v=9L77QExPmI4',
                duration: 24,
                order: 2,
              },
              {
                title: 'Database Design & Mongoose Schemas',
                description: 'Model Users, Courses, and Enrollments with proper indexes.',
                videoUrl: 'https://www.youtube.com/watch?v=DZBGEVgL2eE',
                duration: 35,
                order: 3,
              },
            ],
          },
          {
            title: 'Authentication & Authorization',
            lessons: [
              {
                title: 'JWT Auth Flow — Register & Login',
                description: 'Build bcrypt hashing, token generation, and secure cookie storage.',
                videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
                duration: 40,
                order: 1,
              },
              {
                title: 'Protect Middleware & Role Guards',
                description: 'Write reusable protect and restrictTo middleware for RBAC.',
                videoUrl: 'https://www.youtube.com/watch?v=9N7wYKWBMQA',
                duration: 30,
                order: 2,
              },
            ],
          },
          {
            title: 'React Frontend with TypeScript',
            lessons: [
              {
                title: 'Vite + React 18 + Tailwind Setup',
                description: 'Scaffold the frontend with optimal dev tooling.',
                videoUrl: 'https://www.youtube.com/watch?v=VkSMXV6e4V4',
                duration: 20,
                order: 1,
              },
              {
                title: 'Auth Context & Protected Routes',
                description: 'Global auth state with React Context and route guards.',
                videoUrl: 'https://www.youtube.com/watch?v=oUZjO00NkhY',
                duration: 35,
                order: 2,
              },
              {
                title: 'Course Player & Progress Tracking',
                description: 'Build the video player UI that syncs lesson completion to the API.',
                videoUrl: 'https://www.youtube.com/watch?v=KjY94sAKLlw',
                duration: 45,
                order: 3,
              },
            ],
          },
        ],
        previewVideoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      },

      // ── Course 2 ──────────────────────────────────────────────────────────
      {
        title: 'Python & Machine Learning A-to-Z Bootcamp',
        shortDescription:
          'From NumPy fundamentals to deploying trained PyTorch models as REST APIs — the complete ML journey.',
        description:
          'The most practical machine learning course you will find. We skip the theoretical fluff and build ' +
          'real projects: a recommendation engine, an NLP sentiment classifier, and a computer vision model. ' +
          'You will master Python data manipulation, Scikit-learn pipelines, neural network training with PyTorch, ' +
          'model evaluation, and FastAPI deployment. Comes with Jupyter notebooks, datasets, and a certificate.',
        instructorId: instructor2._id,
        price: 84.99,
        category: 'Data Science',
        level: 'beginner',
        thumbnail: THUMBNAILS.emerald,
        status: 'published',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 2210,
        students: 19600,
        sections: [
          {
            title: 'Python Data Foundations',
            lessons: [
              {
                title: 'NumPy Arrays & Broadcasting',
                description: 'The mathematics engine behind every ML library.',
                videoUrl: 'https://www.youtube.com/watch?v=WgjFKHfbAX8',
                duration: 38,
                order: 1,
              },
              {
                title: 'Pandas for Data Wrangling',
                description: 'Clean, transform, and explore real-world datasets.',
                videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
                duration: 45,
                order: 2,
              },
              {
                title: 'Matplotlib & Seaborn Visualizations',
                description: 'Communicate insights with publication-quality charts.',
                videoUrl: 'https://www.youtube.com/watch?v=a9UrKTVEeZA',
                duration: 30,
                order: 3,
              },
            ],
          },
          {
            title: 'Classic Machine Learning',
            lessons: [
              {
                title: 'Regression Models from Scratch',
                description: 'Linear/Logistic regression with gradient descent math.',
                videoUrl: 'https://www.youtube.com/watch?v=4PHI11lX11I',
                duration: 50,
                order: 1,
              },
              {
                title: 'Decision Trees & Random Forests',
                description: 'Ensemble methods and hyperparameter tuning.',
                videoUrl: 'https://www.youtube.com/watch?v=v6VJ2RO66Ag',
                duration: 40,
                order: 2,
              },
            ],
          },
          {
            title: 'Deep Learning with PyTorch',
            lessons: [
              {
                title: 'Neural Networks & Backpropagation',
                description: 'Understand the math and implement it in PyTorch.',
                videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
                duration: 55,
                order: 1,
              },
              {
                title: 'CNNs for Image Classification',
                description: 'Build a 95%+ accuracy classifier on real image data.',
                videoUrl: 'https://www.youtube.com/watch?v=FmpDIaiMIeA',
                duration: 60,
                order: 2,
              },
            ],
          },
        ],
        previewVideoUrl: 'https://www.youtube.com/watch?v=WgjFKHfbAX8',
      },

      // ── Course 3 ──────────────────────────────────────────────────────────
      {
        title: 'Advanced Node.js: Microservices, GraphQL & Kafka',
        shortDescription:
          'Go beyond REST — design distributed systems with Node.js microservices, GraphQL APIs, and event streaming.',
        description:
          'For experienced Node developers ready to architect serious systems. We build a microservices ' +
          'platform with Docker, implement a GraphQL gateway, set up Kafka event streams between services, ' +
          'add distributed tracing with OpenTelemetry, and deploy the whole stack to Kubernetes on GKE. ' +
          'Every service is written in TypeScript with full test coverage.',
        instructorId: instructor1._id,
        price: 109.99,
        category: 'Web Development',
        level: 'advanced',
        thumbnail: THUMBNAILS.crimson,
        status: 'published',
        isFeatured: true,
        rating: 4.9,
        reviewCount: 1560,
        students: 11200,
        sections: [
          {
            title: 'Microservices Architecture Principles',
            lessons: [
              {
                title: 'Monolith vs Microservices: When & Why',
                description: 'Real-world trade-offs and when distributed systems make sense.',
                videoUrl: 'https://www.youtube.com/watch?v=RkvRRyLBGpE',
                duration: 28,
                order: 1,
              },
              {
                title: 'Service Discovery & API Gateway Pattern',
                description: 'Route traffic intelligently through an NGINX gateway.',
                videoUrl: 'https://www.youtube.com/watch?v=Nu394OfAEBE',
                duration: 35,
                order: 2,
              },
            ],
          },
          {
            title: 'GraphQL API Design',
            lessons: [
              {
                title: 'Schema-First Design with Apollo Server',
                description: 'Define types, resolvers, and mutations with best practices.',
                videoUrl: 'https://www.youtube.com/watch?v=RDQyAcvmbpM',
                duration: 42,
                order: 1,
              },
              {
                title: 'DataLoader: Solving the N+1 Problem',
                description: 'Batch and cache database queries at the resolver level.',
                videoUrl: 'https://www.youtube.com/watch?v=ld2_AS4l19g',
                duration: 30,
                order: 2,
              },
            ],
          },
          {
            title: 'Event Streaming with Kafka',
            lessons: [
              {
                title: 'Kafka Core Concepts: Topics, Partitions, Offsets',
                description: 'Deep dive into Kafka internals every engineer must know.',
                videoUrl: 'https://www.youtube.com/watch?v=B5j3uaDS4no',
                duration: 45,
                order: 1,
              },
              {
                title: 'Producer & Consumer in Node.js with KafkaJS',
                description: 'Connect Node services via event-driven messaging.',
                videoUrl: 'https://www.youtube.com/watch?v=jItIQ-UvFI4',
                duration: 55,
                order: 2,
              },
            ],
          },
        ],
        previewVideoUrl: 'https://www.youtube.com/watch?v=RkvRRyLBGpE',
      },

      // ── Course 4 ──────────────────────────────────────────────────────────
      {
        title: 'UI/UX Design Systems: From Figma to Production',
        shortDescription:
          'Design and build a scalable component library in Figma, then code it pixel-perfect in React.',
        description:
          'The gap between design and engineering kills products. This course closes it. You will create a ' +
          'complete design system in Figma — tokens, components, dark/light modes — then translate it into ' +
          'a React component library with Storybook, accessibility audits, animation with Framer Motion, ' +
          'and publish it as an npm package. Taught by a designer who codes.',
        instructorId: instructor2._id,
        price: 74.99,
        category: 'Design',
        level: 'intermediate',
        thumbnail: THUMBNAILS.gold,
        status: 'published',
        isFeatured: false,
        rating: 4.8,
        reviewCount: 980,
        students: 8750,
        sections: [
          {
            title: 'Design Tokens & Figma Variables',
            lessons: [
              {
                title: 'Color Palettes: Semantic vs Primitive Tokens',
                description: 'Build a token hierarchy that scales across themes.',
                videoUrl: 'https://www.youtube.com/watch?v=BLBTHxPauec',
                duration: 32,
                order: 1,
              },
              {
                title: 'Typography Scale & Spacing Systems',
                description: 'Mathematical type scales and a 4px grid baseline.',
                videoUrl: 'https://www.youtube.com/watch?v=9yHs9LM6GiA',
                duration: 28,
                order: 2,
              },
              {
                title: 'Dark Mode Architecture in Figma',
                description: 'Use Figma Variables to create automatic theme switching.',
                videoUrl: 'https://www.youtube.com/watch?v=u2HjCBJFUTE',
                duration: 38,
                order: 3,
              },
            ],
          },
          {
            title: 'React Component Library',
            lessons: [
              {
                title: 'Storybook Setup & Component Architecture',
                description: 'Document components with Stories, controls, and a11y tests.',
                videoUrl: 'https://www.youtube.com/watch?v=gdlTFPebzAU',
                duration: 40,
                order: 1,
              },
              {
                title: 'Micro-Animations with Framer Motion',
                description: 'Add spring-based physics animations to every interaction.',
                videoUrl: 'https://www.youtube.com/watch?v=2V1WK-3HQNk',
                duration: 45,
                order: 2,
              },
            ],
          },
        ],
        previewVideoUrl: 'https://www.youtube.com/watch?v=BLBTHxPauec',
      },

      // ── Course 5 ──────────────────────────────────────────────────────────
      {
        title: 'Blockchain & Web3: Build DeFi Apps with Solidity',
        shortDescription:
          'Write auditable smart contracts, build a DEX, and connect a React dApp to the Ethereum blockchain.',
        description:
          'The most complete Web3 engineering course available. We write Solidity smart contracts from zero, ' +
          'build and test them with Hardhat, create a decentralized exchange (DEX) with Uniswap V2 mechanics, ' +
          'develop a React + ethers.js frontend, and deploy to Ethereum mainnet and L2s. ' +
          'Includes wallet integration, gas optimization, and a full security audit walkthrough.',
        instructorId: instructor1._id,
        price: 119.99,
        category: 'Blockchain',
        level: 'advanced',
        thumbnail: THUMBNAILS.violet,
        status: 'published',
        isFeatured: false,
        rating: 4.7,
        reviewCount: 640,
        students: 5100,
        sections: [
          {
            title: 'Blockchain Foundations',
            lessons: [
              {
                title: 'How Ethereum Works: EVM, Gas & State',
                description: 'The internals that every Solidity developer must understand.',
                videoUrl: 'https://www.youtube.com/watch?v=jxLkbJozKbY',
                duration: 35,
                order: 1,
              },
              {
                title: 'Solidity Crash Course',
                description: 'Types, functions, modifiers, events, and storage patterns.',
                videoUrl: 'https://www.youtube.com/watch?v=ipwxYa-F1uY',
                duration: 50,
                order: 2,
              },
            ],
          },
          {
            title: 'Smart Contract Development',
            lessons: [
              {
                title: 'Hardhat: Testing & Deployment Scripts',
                description: 'Full test suite and deployment pipeline for your contracts.',
                videoUrl: 'https://www.youtube.com/watch?v=9Qpi80dQsGU',
                duration: 45,
                order: 1,
              },
              {
                title: 'ERC20 Token from Scratch',
                description: 'Implement the full ERC20 standard with custom extensions.',
                videoUrl: 'https://www.youtube.com/watch?v=8rpir_ZSK1g',
                duration: 40,
                order: 2,
              },
              {
                title: 'Building a Decentralized Exchange (DEX)',
                description: 'Constant-product AMM with liquidity pools and slippage protection.',
                videoUrl: 'https://www.youtube.com/watch?v=uXHD_-P5IPc',
                duration: 75,
                order: 3,
              },
            ],
          },
          {
            title: 'React dApp Integration',
            lessons: [
              {
                title: 'Connecting MetaMask with ethers.js',
                description: 'Wallet detection, signing, and transaction lifecycle.',
                videoUrl: 'https://www.youtube.com/watch?v=a0osIaAOFSE',
                duration: 38,
                order: 1,
              },
              {
                title: 'Reading & Writing Contract State from React',
                description: 'useContract hooks and optimistic UI updates.',
                videoUrl: 'https://www.youtube.com/watch?v=j16kMAcxTbc',
                duration: 42,
                order: 2,
              },
            ],
          },
        ],
        previewVideoUrl: 'https://www.youtube.com/watch?v=jxLkbJozKbY',
      },
    ]);

    // ── Mirror curriculum into Curriculum collection ─────────────────────────
    console.log('📋 Mirroring curricula to Curriculum collection...');
    for (const course of courses) {
      if (course.sections && course.sections.length > 0) {
        await Curriculum.create({
          courseId: course._id,
          sections: course.sections.map((section: any, sIdx: number) => ({
            title: section.title,
            order: sIdx + 1,
            lessons: (section.lessons || []).map((lesson: any) => ({
              title: lesson.title,
              description: lesson.description || '',
              videoUrl: lesson.videoUrl,
              duration: lesson.duration,
              order: lesson.order,
              contentType: 'video',
              isPreview: lesson.order === 1 && sIdx === 0, // First lesson of first section is preview
            })),
          })),
        });
      }
    }

    // ── Update category counts ───────────────────────────────────────────────
    console.log('📂 Updating category counts...');
    const categoryNames = ['Web Development', 'Data Science', 'Design', 'Blockchain'];
    for (const name of categoryNames) {
      const count = await Course.countDocuments({ category: name, status: 'published' });
      await Category.findOneAndUpdate({ name }, { courseCount: count });
    }

    // ── Enrollments with realistic progress ────────────────────────────────
    console.log('📝 Creating enrollments...');

    // john.cipher — deeply enrolled in Course 1 (React/Node)
    const course1Lesson1Id = courses[0].sections[0].lessons[0]._id;
    const course1Lesson2Id = courses[0].sections[0].lessons[1]._id;
    const course1Lesson3Id = courses[0].sections[0].lessons[2]._id;
    const course1Lesson4Id = courses[0].sections[1].lessons[0]._id;

    await Enrollment.create([
      {
        studentId: student1._id,
        courseId: courses[0]._id, // React & Node full-stack
        progress: 50,
        completedLessons: [course1Lesson1Id, course1Lesson2Id, course1Lesson3Id, course1Lesson4Id],
        status: 'active',
        enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: student1._id,
        courseId: courses[1]._id, // Python ML
        progress: 15,
        completedLessons: [courses[1].sections[0].lessons[0]._id],
        status: 'active',
        enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: student2._id,
        courseId: courses[0]._id, // React & Node full-stack
        progress: 87,
        completedLessons: [
          course1Lesson1Id, course1Lesson2Id, course1Lesson3Id,
          course1Lesson4Id,
          courses[0].sections[1].lessons[1]._id,
          courses[0].sections[2].lessons[0]._id,
          courses[0].sections[2].lessons[1]._id,
        ],
        status: 'active',
        enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(),
      },
      {
        studentId: student2._id,
        courseId: courses[3]._id, // Design Systems
        progress: 60,
        completedLessons: [
          courses[3].sections[0].lessons[0]._id,
          courses[3].sections[0].lessons[1]._id,
          courses[3].sections[0].lessons[2]._id,
          courses[3].sections[1].lessons[0]._id,
        ],
        status: 'active',
        enrolledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: student3._id,
        courseId: courses[2]._id, // Node.js Microservices
        progress: 25,
        completedLessons: [
          courses[2].sections[0].lessons[0]._id,
          courses[2].sections[0].lessons[1]._id,
        ],
        status: 'active',
        enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      // Pending enrollment awaiting admin manual verification
      {
        studentId: student3._id,
        courseId: courses[4]._id, // Blockchain Web3
        progress: 0,
        completedLessons: [],
        status: 'pending',
        paymentReference: 'WIRE-TXN-BTC-2024-001',
        enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    // ── Transactions ─────────────────────────────────────────────────────────
    console.log('💳 Creating transactions...');
    await Transaction.create([
      {
        userId: student1._id,
        courseId: courses[0]._id,
        amount: 94.99,
        status: 'completed',
        transactionId: 'TXN-STRIPE-2024-001',
        paymentMethod: 'card',
      },
      {
        userId: student1._id,
        courseId: courses[1]._id,
        amount: 84.99,
        status: 'completed',
        transactionId: 'TXN-STRIPE-2024-002',
        paymentMethod: 'card',
      },
      {
        userId: student2._id,
        courseId: courses[0]._id,
        amount: 94.99,
        status: 'completed',
        transactionId: 'TXN-STRIPE-2024-003',
        paymentMethod: 'card',
      },
      {
        userId: student2._id,
        courseId: courses[3]._id,
        amount: 74.99,
        status: 'completed',
        transactionId: 'TXN-STRIPE-2024-004',
        paymentMethod: 'card',
      },
      {
        userId: student3._id,
        courseId: courses[2]._id,
        amount: 109.99,
        status: 'completed',
        transactionId: 'TXN-STRIPE-2024-005',
        paymentMethod: 'card',
      },
      {
        userId: student3._id,
        courseId: courses[4]._id,
        amount: 119.99,
        status: 'pending',
        transactionId: 'WIRE-TXN-BTC-2024-001',
        paymentMethod: 'manual_wire',
      },
    ]);

    // ── Favorites ─────────────────────────────────────────────────────────────
    console.log('⭐ Creating favorites...');
    await Favorite.create([
      { userId: student1._id, courseId: courses[2]._id },
      { userId: student1._id, courseId: courses[4]._id },
      { userId: student2._id, courseId: courses[1]._id },
      { userId: student3._id, courseId: courses[0]._id },
      { userId: student3._id, courseId: courses[3]._id },
    ]);

    // ── Reviews ───────────────────────────────────────────────────────────────
    console.log('💬 Creating reviews...');
    await Review.create([
      {
        rating: 5,
        comment:
          'The best full-stack course I have ever taken. The section on JWT and RBAC middleware alone is worth the price.',
        studentId: student1._id,
        courseId: courses[0]._id,
      },
      {
        rating: 5,
        comment:
          'Sarah explains complex architecture patterns with incredible clarity. The Kafka section blew my mind.',
        studentId: student2._id,
        courseId: courses[0]._id,
      },
      {
        rating: 5,
        comment:
          'Marcus is an outstanding teacher. Building the PyTorch CNN felt like actual research-level work.',
        studentId: student1._id,
        courseId: courses[1]._id,
      },
      {
        rating: 5,
        comment:
          'The design-to-code workflow changed how our entire team collaborates. Framer Motion section is 🔥',
        studentId: student2._id,
        courseId: courses[3]._id,
      },
      {
        rating: 4,
        comment:
          'Very deep content on microservices. GraphQL gateway section is gold. Dock one star because the Kafka setup on Windows was tricky.',
        studentId: student3._id,
        courseId: courses[2]._id,
      },
    ]);

    // Update course review counts to match seeded reviews
    await Course.findByIdAndUpdate(courses[0]._id, { reviewCount: 3842 });
    await Course.findByIdAndUpdate(courses[1]._id, { reviewCount: 2210 });

    // ── Announcements ─────────────────────────────────────────────────────────
    console.log('📢 Creating announcements...');
    await Announcement.create([
      {
        title: '🚀 EduFlow Platform v2.0 is Live!',
        content:
          'We have completely rebuilt EduFlow with a new dark-mode interface, faster video streaming, ' +
          'certificate generation, and a built-in code playground. Explore the new features today.',
        active: true,
        audience: 'both',
      },
      {
        title: '🎓 5 New Cinematic Courses Just Dropped',
        content:
          'Full-Stack React/Node, ML A-to-Z, Node.js Microservices, Design Systems, and Blockchain/Web3 — ' +
          'all taught by industry practitioners with production-level projects.',
        active: true,
        audience: 'students',
      },
      {
        title: '👨‍🏫 Instructor Earnings Dashboard Upgraded',
        content:
          'Instructors now have access to a real-time revenue analytics dashboard with monthly breakdowns, ' +
          'enrollment trends, and student engagement metrics.',
        active: true,
        audience: 'instructors',
      },
      {
        title: '🔧 Scheduled Maintenance Window',
        content:
          'EduFlow will undergo routine maintenance on Sunday 03:00–05:00 UTC. ' +
          'Video streaming may be temporarily unavailable.',
        active: false,
        audience: 'both',
      },
    ]);

    // ── Activities ────────────────────────────────────────────────────────────
    console.log('📊 Creating activity feed...');
    await Activity.create([
      {
        type: 'signup',
        message: `${student1.profile.name} joined as a student`,
        userId: student1._id,
      },
      {
        type: 'signup',
        message: `${student2.profile.name} joined as a student`,
        userId: student2._id,
      },
      {
        type: 'signup',
        message: `${instructor1.profile.name} registered as an instructor`,
        userId: instructor1._id,
      },
      {
        type: 'course_created',
        message: `New course "${courses[0].title}" created`,
        userId: instructor1._id,
        courseId: courses[0]._id,
      },
      {
        type: 'course_created',
        message: `New course "${courses[1].title}" created`,
        userId: instructor2._id,
        courseId: courses[1]._id,
      },
      {
        type: 'course_created',
        message: `New course "${courses[2].title}" created`,
        userId: instructor1._id,
        courseId: courses[2]._id,
      },
      {
        type: 'course_created',
        message: `New course "${courses[3].title}" created`,
        userId: instructor2._id,
        courseId: courses[3]._id,
      },
      {
        type: 'course_created',
        message: `New course "${courses[4].title}" created`,
        userId: instructor1._id,
        courseId: courses[4]._id,
      },
      {
        type: 'course_approved',
        message: `Course "${courses[0].title}" approved and published`,
        courseId: courses[0]._id,
      },
      {
        type: 'course_approved',
        message: `Course "${courses[1].title}" approved and published`,
        courseId: courses[1]._id,
      },
      {
        type: 'course_approved',
        message: `Course "${courses[2].title}" approved and published`,
        courseId: courses[2]._id,
      },
      {
        type: 'course_approved',
        message: `Course "${courses[3].title}" approved and published`,
        courseId: courses[3]._id,
      },
      {
        type: 'course_approved',
        message: `Course "${courses[4].title}" approved and published`,
        courseId: courses[4]._id,
      },
      {
        type: 'enrollment',
        message: `${student1.profile.name} enrolled in "${courses[0].title}"`,
        userId: student1._id,
        courseId: courses[0]._id,
      },
      {
        type: 'enrollment',
        message: `${student2.profile.name} enrolled in "${courses[0].title}"`,
        userId: student2._id,
        courseId: courses[0]._id,
      },
      {
        type: 'enrollment',
        message: `${student2.profile.name} enrolled in "${courses[3].title}"`,
        userId: student2._id,
        courseId: courses[3]._id,
      },
      {
        type: 'enrollment',
        message: `${student3.profile.name} submitted enrollment for "${courses[4].title}" — awaiting manual verification`,
        userId: student3._id,
        courseId: courses[4]._id,
      },
    ]);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n✅ Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋  Test Credentials');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 Admin    │ admin@eduflow.com         / admin123');
    console.log('🟡 Instruct │ sarah.runtime@eduflow.com / instructor123');
    console.log('🟡 Instruct │ marcus.dataforge@eduflow.com / instructor123');
    console.log('🟢 Student  │ john.cipher@student.com   / student123');
    console.log('🟢 Student  │ maya.pixel@student.com    / student123');
    console.log('🟢 Student  │ leo.bytes@student.com     / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Seeded counts:');
    console.log(`   Users:         ${await User.countDocuments()}`);
    console.log(`   Courses:       ${await Course.countDocuments()}`);
    console.log(`   Curricula:     ${await Curriculum.countDocuments()}`);
    console.log(`   Categories:    ${await Category.countDocuments()}`);
    console.log(`   Enrollments:   ${await Enrollment.countDocuments()}`);
    console.log(`   Transactions:  ${await Transaction.countDocuments()}`);
    console.log(`   Favorites:     ${await Favorite.countDocuments()}`);
    console.log(`   Reviews:       ${await Review.countDocuments()}`);
    console.log(`   Announcements: ${await Announcement.countDocuments()}`);
    console.log(`   Activities:    ${await Activity.countDocuments()}`);

    console.log('\n⚡ Pending enrollment (manual verification demo):');
    console.log('   leo.bytes@student.com → Blockchain & Web3 course');
    console.log('   Status: pending | Payment ref: WIRE-TXN-BTC-2024-001');
    console.log('   → Go to Admin Nexus > Enrollments to approve/reject.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
