import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AnimatedPage from "@/components/AnimatedPage";
import { courses } from "@/data/mockData";
import { useState } from "react";

const myCourses = courses.filter((c) => c.instructorId === "i1");

export default function InstructorCourses() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    published: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    draft: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <AnimatedPage>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">{myCourses.length} courses created</p>
          </div>
          <Button asChild className="gradient-primary border-0 text-primary-foreground gap-2">
            <Link to="/instructor/create"><Plus className="h-4 w-4" /> Create Course</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {myCourses.map((course) => (
            <Card key={course.id} className="shadow-card">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 aspect-video rounded-lg shrink-0" style={{ background: course.thumbnail }} />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display font-semibold text-lg">{course.title}</h3>
                        <Badge className={`mt-1 ${statusColors[course.status]}`}>{course.status}</Badge>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="gap-1"><Edit className="h-3.5 w-3.5" /> Edit</Button>
                        <Dialog open={deleteId === course.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => setDeleteId(course.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Course</DialogTitle>
                              <DialogDescription>Are you sure you want to delete "{course.title}"? This action cannot be undone.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                              <Button variant="destructive" onClick={() => setDeleteId(null)}>Delete</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-star text-star" /> {course.rating}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.students.toLocaleString()}</span>
                      <span>${course.price}</span>
                    </div>
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
