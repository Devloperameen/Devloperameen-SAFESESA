import { apiRequest } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { BackendCourse, mapCourse } from "@/services/mappers";
import type { Course } from "@/types/models";

interface CourseQuery {
  category?: string;
  search?: string;
  status?: "draft" | "pending" | "pending_unpublish" | "published" | "rejected";
  level?: "beginner" | "intermediate" | "advanced";
  featured?: boolean;
  free?: boolean;
}

interface InstructorStatsResponse {
  totalStudents: number;
  totalCourses: number;
  avgRating: string;
  totalEarnings: number;
}

interface InstructorRevenueSummary {
  thisMonth: number;
  lastMonth: number;
  lifetime: number;
}

interface InstructorRevenueMonth {
  month: string;
  earnings: number;
  enrollments: number;
}

interface InstructorRevenueResponse {
  summary: InstructorRevenueSummary;
  monthly: InstructorRevenueMonth[];
}

interface BackendReviewStudent {
  _id?: string;
  profile?: {
    name?: string;
  };
}

interface BackendCourseReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentId?: string | BackendReviewStudent;
}

export interface CourseReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentName: string;
}

interface CourseLessonPayload {
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface CourseSectionPayload {
  title: string;
  lessons: CourseLessonPayload[];
}

export interface UpsertCoursePayload {
  title: string;
  shortDescription: string;
  description: string;
  previewVideoUrl?: string;
  price: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail?: string;
  sections: CourseSectionPayload[];
}

function makeQueryString(params: Record<string, string | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });
  const text = searchParams.toString();
  return text ? `?${text}` : "";
}

function mapCourseReview(review: BackendCourseReview): CourseReview {
  return {
    id: review._id,
    rating: review.rating,
    comment: review.comment || "",
    createdAt: review.createdAt,
    studentName:
      typeof review.studentId === "string"
        ? "Student"
        : review.studentId?.profile?.name || "Student",
  };
}

export async function getCourses(query: CourseQuery = {}): Promise<Course[]> {
  const endpoint = `/courses${makeQueryString({
    category: query.category,
    search: query.search,
    status: query.status,
    level: query.level,
    featured: query.featured,
    free: query.free,
  })}`;

  const data = await apiRequest<BackendCourse[]>(endpoint);
  return data.map(mapCourse);
}

export async function getCourseById(id: string): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/courses/${id}`);
  return mapCourse(data);
}

export async function getInstructorCourses(): Promise<Course[]> {
  const data = await apiRequest<BackendCourse[]>("/courses/instructor/my-courses");
  return data.map(mapCourse);
}

export async function getInstructorStats(): Promise<InstructorStatsResponse> {
  return apiRequest<InstructorStatsResponse>("/courses/instructor/stats");
}

export async function getInstructorRevenue(): Promise<InstructorRevenueResponse> {
  return apiRequest<InstructorRevenueResponse>("/courses/instructor/revenue");
}

export async function deleteCourseById(id: string): Promise<void> {
  await apiRequest<Record<string, never>>(`/courses/${id}`, {
    method: "DELETE",
  });
}

export async function createCourse(payload: UpsertCoursePayload): Promise<Course> {
  const data = await apiRequest<BackendCourse>("/courses", {
    method: "POST",
    body: payload,
  });
  return mapCourse(data);
}

export async function updateCourseById(id: string, payload: UpsertCoursePayload): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/courses/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapCourse(data);
}

export async function submitCourseForReview(id: string): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/courses/${id}/submit`, {
    method: "PUT",
  });
  return mapCourse(data);
}

export async function requestCourseUnpublish(id: string): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/courses/${id}/request-unpublish`, {
    method: "PUT",
  });
  return mapCourse(data);
}

export async function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  const data = await apiRequest<BackendCourseReview[]>(`/courses/${courseId}/reviews`);
  return data.map(mapCourseReview);
}

export async function getMyCourseReview(courseId: string): Promise<CourseReview | null> {
  try {
    const data = await apiRequest<BackendCourseReview>(`/courses/${courseId}/reviews/me`);
    return mapCourseReview(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function upsertCourseReview(
  courseId: string,
  payload: { rating: number; comment: string },
): Promise<CourseReview> {
  const data = await apiRequest<BackendCourseReview>(`/courses/${courseId}/reviews`, {
    method: "POST",
    body: payload,
  });
  return mapCourseReview(data);
}
