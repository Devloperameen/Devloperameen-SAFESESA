import { useState } from "react";
import { Search, CheckCircle2, XCircle, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AnimatedPage from "@/components/AnimatedPage";
import { courses } from "@/data/mockData";
import { toast } from "sonner";

export default function CourseModeration() {
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [featured, setFeatured] = useState<Set<string>>(new Set(courses.filter((c) => c.featured).map((c) => c.id)));

  const filtered = search
    ? courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()))
    : courses;

  const statusColors: Record<string, string> = {
    published: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    draft: "bg-muted text-muted-foreground",
  };

  const toggleFeatured = (id: string) => {
    setFeatured((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Removed from featured"); }
      else { next.add(id); toast.success("Added to featured"); }
      return next;
    });
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Course Moderation</h1>
            <p className="text-muted-foreground mt-1">{courses.length} total courses</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <p className="truncate">{course.title}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course.instructor}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>{course.students.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[course.status]}>{course.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={featured.has(course.id)} onCheckedChange={() => toggleFeatured(course.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => toast.success(`"${course.title}" approved`)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRejectId(course.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
              <DialogDescription>Provide a reason for rejecting this course. The instructor will be notified.</DialogDescription>
            </DialogHeader>
            <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => { toast.error("Course rejected"); setRejectId(null); setRejectReason(""); }}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
