import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedPage from "@/components/AnimatedPage";
import {
  createAnnouncement,
  deleteAnnouncementById,
  getAnnouncements,
  toggleAnnouncementActive,
  updateAnnouncementById,
} from "@/services/announcementService";
import type { AnnouncementItem } from "@/types/models";
import { toast } from "sonner";

function formatDate(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Announcements() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<"students" | "instructors" | "both">("both");
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAudience, setEditAudience] = useState<"students" | "instructors" | "both">("both");

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcements", "admin"],
    queryFn: () => getAnnouncements(false),
  });

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [items],
  );

  const createMutation = useMutation({
    mutationFn: () =>
      createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        audience,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement published");
      setTitle("");
      setContent("");
      setAudience("both");
      setAddOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to publish announcement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingItem) throw new Error("No announcement selected");
      return updateAnnouncementById(editingItem.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        audience: editAudience,
        active: editingItem.active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement updated");
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update announcement");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleAnnouncementActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement status updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update announcement status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncementById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete announcement");
    },
  });

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate();
  };

  const openEditDialog = (item: AnnouncementItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditAudience(item.audience);
  };

  const audienceLabel: Record<AnnouncementItem["audience"], string> = {
    students: "Students Only",
    instructors: "Instructors Only",
    both: "Students + Instructors",
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground mt-1">Platform-wide announcements</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement details..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={audience} onValueChange={(value: "students" | "instructors" | "both") => setAudience(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Students + Instructors</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="instructors">Instructors Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handlePublish} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Publishing..." : "Publish"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading announcements...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Unable to load announcements.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((announcement) => (
              <Card key={announcement.id} className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                        <Megaphone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <Badge className={announcement.active ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                            {announcement.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {audienceLabel[announcement.audience]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDate(announcement.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={announcement.active}
                        onCheckedChange={() => toggleMutation.mutate(announcement.id)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(announcement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={editAudience} onValueChange={(value: "students" | "instructors" | "both") => setEditAudience(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Students + Instructors</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="instructors">Instructors Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending || !editTitle.trim() || !editContent.trim()}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
