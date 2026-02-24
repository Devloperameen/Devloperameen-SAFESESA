export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  completed?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  instructor: string;
  instructorId: string;
  instructorBio: string;
  description: string;
  previewVideoUrl?: string;
  price: number;
  rating: number;
  reviewCount: number;
  students: number;
  category: string;
  level: string;
  thumbnail: string;
  status: "published" | "pending" | "pending_unpublish" | "rejected" | "draft";
  featured: boolean;
  sections: CourseSection[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  active: boolean;
  audience: "students" | "instructors" | "both";
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  joinDate: string;
  status: "active" | "suspended";
  avatar: string;
}

export interface LearningEnrollment {
  id: string;
  course: Course;
  progress: number;
  lastAccessed: string;
  completedLessons: string[];
  status: "active" | "pending" | "rejected";
}
