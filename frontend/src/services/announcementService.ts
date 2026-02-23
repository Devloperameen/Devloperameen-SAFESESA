import { apiRequest } from "@/lib/api";
import type { AnnouncementItem } from "@/types/models";
import { BackendAnnouncement } from "@/services/mappers";

interface AnnouncementPayload {
  title: string;
  content: string;
  audience: "students" | "instructors" | "both";
  active?: boolean;
}

function mapAnnouncement(item: BackendAnnouncement): AnnouncementItem {
  return {
    id: item._id,
    title: item.title,
    content: item.content,
    active: item.active,
    audience: item.audience,
    createdAt: item.createdAt,
  };
}

export async function getAnnouncements(activeOnly?: boolean): Promise<AnnouncementItem[]> {
  const query = activeOnly ? "?active=true" : "";
  const data = await apiRequest<BackendAnnouncement[]>(`/announcements${query}`);
  return data.map(mapAnnouncement);
}

export async function createAnnouncement(payload: AnnouncementPayload): Promise<AnnouncementItem> {
  const data = await apiRequest<BackendAnnouncement>("/announcements", {
    method: "POST",
    body: payload,
  });
  return mapAnnouncement(data);
}

export async function updateAnnouncementById(
  id: string,
  payload: AnnouncementPayload,
): Promise<AnnouncementItem> {
  const data = await apiRequest<BackendAnnouncement>(`/announcements/${id}`, {
    method: "PUT",
    body: payload,
  });
  return mapAnnouncement(data);
}

export async function deleteAnnouncementById(id: string): Promise<void> {
  await apiRequest<Record<string, never>>(`/announcements/${id}`, {
    method: "DELETE",
  });
}

export async function toggleAnnouncementActive(id: string): Promise<AnnouncementItem> {
  const data = await apiRequest<BackendAnnouncement>(`/announcements/${id}/active`, {
    method: "PUT",
  });
  return mapAnnouncement(data);
}
