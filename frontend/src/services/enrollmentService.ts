import { apiRequest } from "@/lib/api";
import { BackendEnrollment, mapLearningEnrollment } from "@/services/mappers";
import type { LearningEnrollment } from "@/types/models";

export async function getEnrollments(): Promise<LearningEnrollment[]> {
  const data = await apiRequest<BackendEnrollment[]>("/enrollments");
  return data.map(mapLearningEnrollment);
}

export async function enrollInCourse(courseId: string): Promise<void> {
  await apiRequest<BackendEnrollment>(`/enrollments/${courseId}`, {
    method: "POST",
  });
}

export async function getEnrollmentProgress(courseId: string): Promise<LearningEnrollment> {
  const data = await apiRequest<BackendEnrollment>(`/enrollments/${courseId}/progress`);
  return mapLearningEnrollment(data);
}

export async function updateEnrollmentProgress(
  courseId: string,
  lessonId: string,
  completed: boolean,
): Promise<LearningEnrollment> {
  const data = await apiRequest<BackendEnrollment>(`/enrollments/${courseId}/progress`, {
    method: "PUT",
    body: { lessonId, completed },
  });
  return mapLearningEnrollment(data);
}
