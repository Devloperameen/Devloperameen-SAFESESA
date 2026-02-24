import { apiRequest } from "@/lib/api";
import { apiRequestWithMeta } from "@/lib/api";
import { BackendCourse, BackendUser, mapCourse, mapPlatformUser } from "@/services/mappers";
import type { Course, PlatformUser } from "@/types/models";

interface UserQuery {
  search?: string;
  role?: "student" | "instructor" | "admin";
  status?: "active" | "suspended";
  page?: number;
  limit?: number;
}

interface CourseModerationQuery {
  search?: string;
  status?: "draft" | "pending" | "pending_unpublish" | "published" | "rejected";
  category?: string;
  featured?: "true" | "false";
  instructorId?: string;
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

interface AdminOverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  publishedCourses: number;
  totalRevenue: number;
}

interface AdminRevenuePoint {
  month: string;
  revenue: number;
  enrollments: number;
}

interface AdminCategoryPerformance {
  name: string;
  courses: number;
  students: number;
}

export interface AdminAnalyticsData {
  overview: AdminOverviewMetrics;
  revenueData: AdminRevenuePoint[];
  categories: AdminCategoryPerformance[];
}

interface BackendActivityRef {
  _id?: string;
  title?: string;
  profile?: {
    name?: string;
  };
}

interface BackendActivity {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
  userId?: string | BackendActivityRef;
  courseId?: string | BackendActivityRef;
}

export interface AdminActivityItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  userName: string;
  courseTitle: string;
}

function makeQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    searchParams.set(key, value);
  });
  const text = searchParams.toString();
  return text ? `?${text}` : "";
}

export async function getAdminUsers(query: UserQuery = {}): Promise<PlatformUser[]> {
  const result = await getAdminUsersPage(query);
  return result.items;
}

export async function getAdminUsersPage(query: UserQuery = {}): Promise<PaginatedResult<PlatformUser>> {
  const payload = await apiRequestWithMeta<BackendUser[]>(
    `/admin/users${makeQueryString({
      search: query.search,
      role: query.role,
      status: query.status,
      page: query.page ? String(query.page) : undefined,
      limit: query.limit ? String(query.limit) : undefined,
    })}`,
  );

  return {
    items: payload.data.map(mapPlatformUser),
    total: payload.pagination?.total || payload.total || payload.count || payload.data.length,
    page: payload.pagination?.page || query.page || 1,
    limit: payload.pagination?.limit || query.limit || payload.data.length,
    totalPages: payload.pagination?.totalPages || 1,
    hasNext: payload.pagination?.hasNext || false,
    hasPrev: payload.pagination?.hasPrev || false,
  };
}

export async function updateAdminUserRole(
  userId: string,
  role: "student" | "instructor" | "admin",
): Promise<PlatformUser> {
  const data = await apiRequest<BackendUser>(`/admin/users/${userId}/role`, {
    method: "PUT",
    body: { role },
  });
  return mapPlatformUser(data);
}

export async function updateAdminUserStatus(
  userId: string,
  status: "active" | "suspended",
): Promise<PlatformUser> {
  const data = await apiRequest<BackendUser>(`/admin/users/${userId}/status`, {
    method: "PUT",
    body: { status },
  });
  return mapPlatformUser(data);
}

export async function getModerationCourses(query: CourseModerationQuery = {}): Promise<Course[]> {
  const result = await getModerationCoursesPage(query);
  return result.items;
}

export async function getModerationCoursesPage(
  query: CourseModerationQuery = {},
): Promise<PaginatedResult<Course>> {
  const endpoint = `/admin/courses${makeQueryString({
    search: query.search,
    status: query.status,
    category: query.category,
    featured: query.featured,
    instructorId: query.instructorId,
    page: query.page ? String(query.page) : undefined,
    limit: query.limit ? String(query.limit) : undefined,
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

export async function updateModerationCourseStatus(
  courseId: string,
  status: "published" | "rejected" | "pending" | "pending_unpublish" | "draft",
  rejectionReason?: string,
): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/admin/courses/${courseId}/status`, {
    method: "PUT",
    body: {
      status,
      rejectionReason,
    },
  });
  return mapCourse(data);
}

export async function toggleModerationCourseFeatured(courseId: string): Promise<Course> {
  const data = await apiRequest<BackendCourse>(`/admin/courses/${courseId}/featured`, {
    method: "PUT",
  });
  return mapCourse(data);
}

function mapActivityRefName(ref?: string | BackendActivityRef): string {
  if (!ref || typeof ref === "string") return "";
  return ref.profile?.name || ref.title || "";
}

function mapActivityCourseTitle(ref?: string | BackendActivityRef): string {
  if (!ref || typeof ref === "string") return "";
  return ref.title || "";
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  return apiRequest<AdminAnalyticsData>("/admin/analytics");
}

export async function getAdminActivities(limit: number = 20): Promise<AdminActivityItem[]> {
  const data = await apiRequest<BackendActivity[]>(`/admin/activities?limit=${limit}`);
  return data.map((item) => ({
    id: item._id,
    type: item.type,
    message: item.message,
    createdAt: item.createdAt,
    userName: mapActivityRefName(item.userId),
    courseTitle: mapActivityCourseTitle(item.courseId),
  }));
}

export interface AdminEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRole: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: 'pending' | 'active' | 'rejected';
  paymentReference?: string;
}

export async function getAdminEnrollments(): Promise<AdminEnrollment[]> {
  const payload = await apiRequestWithMeta<any[]>("/admin/enrollments");
  return payload.data.map((item: any) => ({
    id: item._id,
    studentId: item.studentId?._id,
    studentName: item.studentId?.profile?.name || "Unknown",
    studentEmail: item.studentId?.email || "Unknown",
    studentRole: item.studentId?.role || "student",
    courseId: item.courseId?._id,
    courseTitle: item.courseId?.title || "Unknown Course",
    enrolledAt: item.enrolledAt,
    status: item.status || 'active',
    paymentReference: item.paymentReference,
  }));
}

export async function updateEnrollmentStatusByAdmin(
  enrollmentId: string,
  status: "active" | "rejected"
): Promise<void> {
  await apiRequest(`/admin/enrollments/${enrollmentId}/status`, {
    method: "PUT",
    body: { status },
  });
}

export async function manualEnrollByAdmin(userId: string, courseId: string): Promise<void> {
  await apiRequest("/admin/enrollments", {
    method: "POST",
    body: { userId, courseId },
  });
}

export async function unenrollByAdmin(enrollmentId: string): Promise<void> {
  await apiRequest(`/admin/enrollments/${enrollmentId}`, {
    method: "DELETE",
  });
}
