import { apiRequest } from "@/lib/api";
import { BackendCourse, BackendUser, mapCourse, mapPlatformUser } from "@/services/mappers";
import type { Course, PlatformUser } from "@/types/models";

interface UserQuery {
  search?: string;
  role?: "student" | "instructor" | "admin";
  status?: "active" | "suspended";
}

interface CourseModerationQuery {
  search?: string;
  status?: "draft" | "pending" | "pending_unpublish" | "published" | "rejected";
  category?: string;
  featured?: "true" | "false";
  instructorId?: string;
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
  const data = await apiRequest<BackendUser[]>(
    `/admin/users${makeQueryString({
      search: query.search,
      role: query.role,
      status: query.status,
    })}`,
  );
  return data.map(mapPlatformUser);
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
  const endpoint = `/admin/courses${makeQueryString({
    search: query.search,
    status: query.status,
    category: query.category,
    featured: query.featured,
    instructorId: query.instructorId,
  })}`;
  const data = await apiRequest<BackendCourse[]>(endpoint);
  return data.map(mapCourse);
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
