import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AnimatedPage from "@/components/AnimatedPage";
import { deleteCourseById, getInstructorCourseStudents, getInstructorCoursesPage } from "@/services/courseService";
import type { Course } from "@/types/models";

export default function InstructorCourses() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [coursesPage, setCoursesPage] = useState(1);
  const coursesPageSize = 20;
  const [studentsCourse, setStudentsCourse] = useState<Course | null>(null);
  const [studentsPage, setStudentsPage] = useState(1);
  const studentsPageSize = 10;

  const {
    data: pagedCourses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["instructor", "courses", coursesPage],
    queryFn: () => getInstructorCoursesPage(coursesPage, coursesPageSize),
  });

  useEffect(() => {
    setStudentsPage(1);
  }, [studentsCourse?.id]);

  const {
    data: pagedStudents,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useQuery({
    queryKey: ["instructor", "course-students", studentsCourse?.id, studentsPage],
    enabled: Boolean(studentsCourse?.id),
    queryFn: () => getInstructorCourseStudents(studentsCourse?.id || "", studentsPage, studentsPageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => deleteCourseById(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      toast.success("Course deleted");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete course");
    },
  });

  const statusColors: Record<string, string> = {
    published: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    pending_unpublish: "bg-warning/10 text-warning border-warning/20",
    draft: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const students = pagedStudents?.items || [];
  const myCourses = pagedCourses?.items || [];
  const totalCourses = pagedCourses?.total || 0;
  const courseHasPrev = pagedCourses?.hasPrev || false;
  const courseHasNext = pagedCourses?.hasNext || false;
  const coursesTotalPages = pagedCourses?.totalPages || 1;
  const totalStudents = pagedStudents?.total || 0;
  const studentsHasPrev = pagedStudents?.hasPrev || false;
  const studentsHasNext = pagedStudents?.hasNext || false;
  const studentsTotalPages = pagedStudents?.totalPages || 1;

  return (
    <AnimatedPage>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">{totalCourses.toLocaleString()} courses created</p>
          </div>
          <Button asChild className="gradient-primary border-0 text-primary-foreground gap-2">
            <Link to="/instructor/create"><Plus className="h-4 w-4" /> Create Course</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading courses...</div>
        ) : isError ? (
          <div className="text-center py-16 text-muted-foreground">Unable to load your courses.</div>
        ) : (
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
                          <Badge className={`mt-1 ${statusColors[course.status]}`}>
                            {course.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link to={`/course/${course.id}`}><Eye className="h-3.5 w-3.5" /> View</Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link to={`/instructor/edit/${course.id}`}><Edit className="h-3.5 w-3.5" /> Edit</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => setStudentsCourse(course)}>
                            <Users className="h-3.5 w-3.5" /> Students
                          </Button>
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
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(course.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </Button>
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
        )}

        {!isLoading && !isError && coursesTotalPages > 1 && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {coursesPage} of {coursesTotalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!courseHasPrev}
                onClick={() => setCoursesPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!courseHasNext}
                onClick={() => setCoursesPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <Dialog open={Boolean(studentsCourse)} onOpenChange={(open) => !open && setStudentsCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enrolled Students</DialogTitle>
              <DialogDescription>
                {studentsCourse ? `${studentsCourse.title} | ${totalStudents.toLocaleString()} total students` : ""}
              </DialogDescription>
            </DialogHeader>

            {studentsLoading ? (
              <div className="rounded-lg border border-border bg-muted/20 p-6 text-sm text-muted-foreground text-center">
                Loading enrolled students...
              </div>
            ) : studentsError ? (
              <div className="rounded-lg border border-border bg-muted/20 p-6 text-sm text-muted-foreground text-center">
                Unable to load enrolled students.
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/20 p-6 text-sm text-muted-foreground text-center">
                No students enrolled yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                  {students.map((student) => (
                    <div key={student.enrollmentId} className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{student.progress}%</p>
                          <p className="text-xs text-muted-foreground">progress</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Enrolled: {new Date(student.enrolledAt).toLocaleDateString("en-US")}
                      </div>
                    </div>
                  ))}
                </div>
                {studentsTotalPages > 1 && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      Page {studentsPage} of {studentsTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!studentsHasPrev}
                        onClick={() => setStudentsPage((prev) => Math.max(1, prev - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!studentsHasNext}
                        onClick={() => setStudentsPage((prev) => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStudentsCourse(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
