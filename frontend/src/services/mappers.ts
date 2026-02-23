import type { Category, Course, LearningEnrollment, PlatformUser } from "@/types/models";

interface BackendUserProfile {
  name?: string;
  avatar?: string;
  bio?: string;
}

interface BackendInstructorRef {
  _id?: string;
  profile?: BackendUserProfile;
  email?: string;
}

interface BackendCourseLesson {
  _id?: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order?: number;
}

interface BackendCourseSection {
  _id?: string;
  title: string;
  lessons: BackendCourseLesson[];
}

export interface BackendCourse {
  _id: string;
  title: string;
  shortDescription?: string;
  description: string;
  previewVideoUrl?: string;
  instructorId: string | BackendInstructorRef;
  price: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail: string;
  status: "draft" | "pending" | "published" | "pending_unpublish" | "rejected";
  isFeatured: boolean;
  sections: BackendCourseSection[];
  rating: number;
  reviewCount: number;
  students: number;
  createdAt: string;
}

export interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount: number;
}

export interface BackendAnnouncement {
  _id: string;
  title: string;
  content: string;
  active: boolean;
  audience: "students" | "instructors" | "both";
  createdAt: string;
  updatedAt: string;
}

export interface BackendEnrollment {
  _id: string;
  courseId: BackendCourse;
  progress: number;
  completedLessons: string[];
  lastAccessed: string;
}

export interface BackendFavorite {
  _id: string;
  courseId: BackendCourse;
}

export interface BackendUser {
  _id: string;
  email: string;
  role: "student" | "instructor" | "admin";
  profile: BackendUserProfile;
  status: "active" | "suspended";
  joinDate?: string;
  createdAt?: string;
}

function toTitleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDuration(minutes: number): string {
  const mins = Math.max(0, Math.floor(minutes || 0));
  const secs = Math.max(0, Math.round(((minutes || 0) - mins) * 60));
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function normalizeThumbnail(thumbnail: string): string {
  if (!thumbnail) {
    return 'url("/placeholder.svg") center/cover no-repeat';
  }

  if (
    thumbnail.startsWith("linear-gradient") ||
    thumbnail.startsWith("radial-gradient") ||
    thumbnail.startsWith("#") ||
    thumbnail.startsWith("hsl(") ||
    thumbnail.startsWith("rgb(")
  ) {
    return thumbnail;
  }

  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://") || thumbnail.startsWith("/")) {
    return `url("${thumbnail}") center/cover no-repeat`;
  }

  if (thumbnail.startsWith("data:image")) {
    return `url("${thumbnail}") center/cover no-repeat`;
  }

  return thumbnail;
}

function formatDate(dateValue?: string): string {
  if (!dateValue) return "";
  return new Date(dateValue).toISOString().slice(0, 10);
}

function getInstructorInfo(
  instructorRef: string | BackendInstructorRef,
): { instructorId: string; instructorName: string; instructorBio: string } {
  if (typeof instructorRef === "string") {
    return {
      instructorId: instructorRef,
      instructorName: "Unknown Instructor",
      instructorBio: "Instructor bio not available.",
    };
  }

  return {
    instructorId: instructorRef._id || "",
    instructorName: instructorRef.profile?.name || "Unknown Instructor",
    instructorBio: instructorRef.profile?.bio || "Instructor bio not available.",
  };
}

export function mapCourse(course: BackendCourse): Course {
  const instructor = getInstructorInfo(course.instructorId);

  return {
    id: course._id,
    title: course.title,
    shortDescription: course.shortDescription || course.description || "",
    instructor: instructor.instructorName,
    instructorId: instructor.instructorId,
    instructorBio: instructor.instructorBio,
    description: course.description,
    previewVideoUrl: course.previewVideoUrl || "",
    price: course.price,
    rating: course.rating,
    reviewCount: course.reviewCount,
    students: course.students,
    category: course.category,
    level: toTitleCase(course.level),
    thumbnail: normalizeThumbnail(course.thumbnail),
    status: course.status,
    featured: course.isFeatured,
    sections: (course.sections || []).map((section) => ({
      id: section._id || section.title,
      title: section.title,
      lessons: (section.lessons || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((lesson) => ({
          id: lesson._id || lesson.title,
          title: lesson.title,
          description: lesson.description || "",
          duration: formatDuration(lesson.duration),
          videoUrl: lesson.videoUrl,
        })),
    })),
    createdAt: formatDate(course.createdAt),
  };
}

export function mapCategory(category: BackendCategory): Category {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    courseCount: category.courseCount,
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return (parts[0] || "U").slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function mapPlatformUser(user: BackendUser): PlatformUser {
  const name = user.profile?.name || "Unknown User";
  return {
    id: user._id,
    name,
    email: user.email,
    role: user.role,
    joinDate: formatDate(user.joinDate || user.createdAt),
    status: user.status,
    avatar: getInitials(name),
  };
}

export function mapLearningEnrollment(enrollment: BackendEnrollment): LearningEnrollment {
  return {
    id: enrollment._id,
    course: mapCourse(enrollment.courseId),
    progress: enrollment.progress,
    lastAccessed: formatDate(enrollment.lastAccessed),
    completedLessons: (enrollment.completedLessons || []).map(String),
  };
}

export function mapFavoriteToCourse(favorite: BackendFavorite): Course {
  return mapCourse(favorite.courseId);
}
