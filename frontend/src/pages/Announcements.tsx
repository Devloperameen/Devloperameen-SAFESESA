import { useState } from "react";
import { Plus, Edit, Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AnimatedPage from "@/components/AnimatedPage";
import { announcements as initialAnnouncements } from "@/data/mockData";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements);
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const toggleActive = (id: string) =>
    setItems(items.map((a) => a.id === id ? { ...a, active: !a.active } : a));

  const handleAdd = () => {
    if (!title.trim()) return;
    setItems([{ id: `a${Date.now()}`, title, content, date: new Date().toISOString().split("T")[0], active: true }, ...items]);
    setTitle("");
    setContent("");
    setAddOpen(false);
    toast.success("Announcement published");
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((a) => a.id !== id));
    toast.success("Announcement deleted");
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground mt-1">Platform-wide announcements</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-primary-foreground gap-2"><Plus className="h-4 w-4" /> New Announcement</Button>
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
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement details..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id} className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                      <Megaphone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{a.title}</h3>
                        <Badge className={a.active ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                          {a.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{a.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={a.active} onCheckedChange={() => toggleActive(a.id)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}
