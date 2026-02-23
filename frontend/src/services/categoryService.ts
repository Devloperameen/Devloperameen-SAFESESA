import { apiRequest } from "@/lib/api";
import { BackendCategory, mapCategory } from "@/services/mappers";
import type { Category } from "@/types/models";

export async function getCategories(status: string = "public"): Promise<Category[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await apiRequest<BackendCategory[]>(`/categories${query}`);
  return data.map(mapCategory);
}

interface CategoryPayload {
  name: string;
  description?: string;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const data = await apiRequest<BackendCategory>("/categories", {
    method: "POST",
    body: payload,
  });
  return mapCategory(data);
}

export async function updateCategoryById(id: string, payload: CategoryPayload): Promise<Category> {
  const data = await apiRequest<BackendCategory>(`/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapCategory(data);
}

export async function deleteCategoryById(id: string): Promise<void> {
  await apiRequest<Record<string, never>>(`/categories/${id}`, {
    method: "DELETE",
  });
}
