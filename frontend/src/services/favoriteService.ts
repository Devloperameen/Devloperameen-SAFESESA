import { apiRequest } from "@/lib/api";
import { BackendFavorite, mapFavoriteToCourse } from "@/services/mappers";
import type { Course } from "@/types/models";

export async function getFavorites(): Promise<Course[]> {
  const data = await apiRequest<BackendFavorite[]>("/favorites");
  return data.map(mapFavoriteToCourse);
}

export async function addFavorite(courseId: string): Promise<void> {
  await apiRequest<BackendFavorite>(`/favorites/${courseId}`, {
    method: "POST",
  });
}

export async function removeFavorite(courseId: string): Promise<void> {
  await apiRequest<Record<string, never>>(`/favorites/${courseId}`, {
    method: "DELETE",
  });
}
