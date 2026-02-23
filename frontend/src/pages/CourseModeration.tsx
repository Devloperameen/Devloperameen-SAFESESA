import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AnimatedPage from "@/components/AnimatedPage";
import {
  getModerationCoursesPage,
  toggleModerationCourseFeatured,
  updateModerationCourseStatus,
} from "@/services/adminService";
import { getCategories } from "@/services/categoryService";
import { toast } from "sonner";

export default function CourseModeration() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "pending" | "pending_unpublish" | "published" | "rejected">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not_featured">("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const moderationFilters = {
    search: search.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    featured:
      featuredFilter === "all"
        ? undefined
        : featuredFilter === "featured"
          ? ("true" as const)
          : ("false" as const),
  };

  useEffect(() => {
    setPage(1);
  }, [
    moderationFilters.search,
    moderationFilters.status,
    moderationFilters.category,
    moderationFilters.featured,
  ]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories("all"),
  });

  const {
    data: pagedCourses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "admin",
      "courses",
      moderationFilters.search,
      moderationFilters.status,
      moderationFilters.category,
      moderationFilters.featured,
      page,
    ],
    queryFn: () => getModerationCoursesPage({ ...moderationFilters, page, limit: pageSize }),
  });

  const courses = pagedCourses?.items || [];
  const totalCourses = pagedCourses?.total || 0;
  const totalPages = pagedCourses?.totalPages || 1;
  const hasPrev = pagedCourses?.hasPrev || false;
  const hasNext = pagedCourses?.hasNext || false;

  const featureMutation = useMutation({
    mutationFn: (courseId: string) => toggleModerationCourseFeatured(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Featured status updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update featured status");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      courseId,
      status,
      rejectionReasonValue,
      successMessage,
    }: {
      courseId: string;
      status: "published" | "rejected" | "pending" | "pending_unpublish" | "draft";
      rejectionReasonValue?: string;
      successMessage: string;
    }) => updateModerationCourseStatus(courseId, status, rejectionReasonValue),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success(variables.successMessage);
      setRejectId(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update course status");
    },
  });

  const statusColors: Record<string, string> = {
    published: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    pending_unpublish: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    draft: "bg-muted text-muted-foreground",
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Course Moderation</h1>
            <p className="text-muted-foreground mt-1">{totalCourses.toLocaleString()} courses found</p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Publish</SelectItem>
                <SelectItem value="pending_unpublish">Pending Unpublish</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={(value: typeof featuredFilter) => setFeaturedFilter(value)}>
              <SelectTrigger><SelectValue placeholder="Featured" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not_featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
          ) : isError ? (
            <div className="p-8 text-center text-muted-foreground">Unable to load courses.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="w-[380px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <p className="truncate">{course.title}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{course.instructor}</TableCell>
                    <TableCell>${course.price}</TableCell>
                    <TableCell>{course.students.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[course.status]}>
                        {course.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={course.featured}
                        onCheckedChange={() => featureMutation.mutate(course.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1">
                          <Link to={`/admin/course/${course.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Link>
                        </Button>

                        {course.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-success"
                              onClick={() =>
                                statusMutation.mutate({
                                  courseId: course.id,
                                  status: "published",
                                  successMessage: "Publish request approved",
                                })
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve Publish
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-destructive"
                              onClick={() => setRejectId(course.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject Publish
                            </Button>
                          </>
                        )}

                        {course.status === "pending_unpublish" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-success"
                              onClick={() =>
                                statusMutation.mutate({
                                  courseId: course.id,
                                  status: "draft",
                                  successMessage: "Unpublish request approved",
                                })
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve Unpublish
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-destructive"
                              onClick={() =>
                                statusMutation.mutate({
                                  courseId: course.id,
                                  status: "published",
                                  successMessage: "Unpublish request rejected",
                                })
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Keep Published
                            </Button>
                          </>
                        )}

                        {course.status === "published" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() =>
                              statusMutation.mutate({
                                courseId: course.id,
                                status: "draft",
                                successMessage: "Course unpublished",
                              })
                            }
                          >
                            Unpublish Now
                          </Button>
                        )}

                        {!["pending", "pending_unpublish", "published"].includes(course.status) && (
                          <span className="text-xs text-muted-foreground">No moderation action needed</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={!hasPrev} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <Button variant="outline" disabled={!hasNext} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}

        <Dialog open={Boolean(rejectId)} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Publish Request</DialogTitle>
              <DialogDescription>Provide a reason for rejecting this publish request. The instructor will be notified.</DialogDescription>
            </DialogHeader>
            <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!rejectId) return;
                  if (!rejectReason.trim()) {
                    toast.error("Please provide a rejection message.");
                    return;
                  }
                  statusMutation.mutate({
                    courseId: rejectId,
                    status: "rejected",
                    rejectionReasonValue: rejectReason.trim(),
                    successMessage: "Publish request rejected",
                  });
                }}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
