import { apiRequest } from "@/lib/api";
import { apiRequestWithMeta } from "@/lib/api";
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
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
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

export interface InstructorMessage {
  id: string;
  type: "review" | "admin_rejection";
  title: string;
  message: string;
  courseTitle: string;
  sender: string;
  createdAt: string;
}

export interface InstructorCourseStudent {
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "suspended";
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
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

function makeQueryString(params: Record<string, string | number | boolean | undefined>) {
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
    page: query.page,
    limit: query.limit ?? 100,
  })}`;

  const data = await apiRequest<BackendCourse[]>(endpoint);
  return data.map(mapCourse);
}

export async function getCoursesPage(query: CourseQuery = {}): Promise<PaginatedResult<Course>> {
  const endpoint = `/courses${makeQueryString({
    category: query.category,
    search: query.search,
    status: query.status,
    level: query.level,
    featured: query.featured,
    free: query.free,
    page: query.page,
    limit: query.limit,
  })}`;

  const payload = await apiRequestWithMeta<BackendCourse[]>(endpoint);

  return {
    items: payload.data.map(mapCourse),
    total: payload.pagination?.total || payload.total || payload.count || payload.data.length,
    page: payload.pagination?.page || query.page || 1,
    limit: payload.pagination?.limit || query.limit || payload.data.length,
    totalPages: payload.pagination?.totalPages || 1,
    hasNext: payload.pagination?.hasNext || false,
    hasPrev: payload.pagination?.hasPrev || false,
  };
}

export async function getCourseById(id: string): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/courses/${id}`);
  return mapCourse(data);
}

export async function getInstructorCourses(): Promise<Course[]> {
  const result = await getInstructorCoursesPage(1, 100);
  return result.items;
}

export async function getInstructorCoursesPage(
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<Course>> {
  const payload = await apiRequestWithMeta<BackendCourse[]>(
    `/courses/instructor/my-courses${makeQueryString({ page, limit })}`,
  );

  return {
    items: payload.data.map(mapCourse),
    total: payload.pagination?.total || payload.total || payload.count || payload.data.length,
    page: payload.pagination?.page || page,
    limit: payload.pagination?.limit || limit,
    totalPages: payload.pagination?.totalPages || 1,
    hasNext: payload.pagination?.hasNext || false,
    hasPrev: payload.pagination?.hasPrev || false,
  };
}

export async function getInstructorCourseStudents(
  courseId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<InstructorCourseStudent>> {
  const payload = await apiRequestWithMeta<{
    course: { id: string; title: string };
    students: InstructorCourseStudent[];
  }>(`/courses/instructor/${courseId}/students${makeQueryString({ page, limit })}`);

  const students = payload.data.students || [];

  return {
    items: students,
    total: payload.pagination?.total || payload.total || payload.count || students.length,
    page: payload.pagination?.page || page,
    limit: payload.pagination?.limit || limit,
    totalPages: payload.pagination?.totalPages || 1,
    hasNext: payload.pagination?.hasNext || false,
    hasPrev: payload.pagination?.hasPrev || false,
  };
}

export async function getInstructorStats(): Promise<InstructorStatsResponse> {
  return apiRequest<InstructorStatsResponse>("/courses/instructor/stats");
}

export async function getInstructorRevenue(): Promise<InstructorRevenueResponse> {
  return apiRequest<InstructorRevenueResponse>("/courses/instructor/revenue");
}

export async function getInstructorMessages(): Promise<InstructorMessage[]> {
  return apiRequest<InstructorMessage[]>("/courses/instructor/messages");
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
