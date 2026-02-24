import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, CheckCircle2, Circle, ChevronDown, ChevronRight, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getVideoSource } from "@/lib/video";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageBackButton from "@/components/PageBackButton";
import { getCourseById, getMyCourseReview, upsertCourseReview } from "@/services/courseService";
import { getEnrollmentProgress, updateEnrollmentProgress } from "@/services/enrollmentService";
import { toast } from "sonner";

export default function CoursePlayer() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState("");
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id || ""),
    enabled: Boolean(id),
  });

  const {
    data: enrollment,
    error: enrollmentError,
    isLoading: isEnrollmentLoading,
  } = useQuery({
    queryKey: ["enrollments", "progress", id],
    queryFn: () => getEnrollmentProgress(id || ""),
    enabled: Boolean(id && user?.role === "student"),
    retry: false,
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({
      courseId,
      lessonId,
      completed,
    }: {
      courseId: string;
      lessonId: string;
      completed: boolean;
    }) => updateEnrollmentProgress(courseId, lessonId, completed),
    onSuccess: (updated) => {
      setCompletedLessons(new Set(updated.completedLessons));
      if (id) {
        queryClient.setQueryData(["enrollments", "progress", id], updated);
      }
      queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
    },
  });

  const {
    data: myReview,
    isLoading: isReviewLoading,
  } = useQuery({
    queryKey: ["course", "review", "me", id],
    queryFn: () => getMyCourseReview(id || ""),
    enabled: Boolean(id && user?.role === "student"),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      upsertCourseReview(id || "", {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      }),
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["course", "review", "me", id] });
        queryClient.invalidateQueries({ queryKey: ["course", id] });
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Review saved");
      setReviewOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to submit review");
    },
  });

  useEffect(() => {
    if (!course) return;
    const firstSection = course.sections[0];
    const firstLesson = firstSection?.lessons[0];
    if (firstLesson && !activeLesson) {
      setActiveLesson(firstLesson.id);
    }
    if (firstSection && expandedSections.size === 0) {
      setExpandedSections(new Set([firstSection.id]));
    }
  }, [course, activeLesson, expandedSections.size]);

  useEffect(() => {
    if (!enrollment) return;
    setCompletedLessons(new Set(enrollment.completedLessons));
  }, [enrollment]);

  useEffect(() => {
    if (!myReview) return;
    setReviewRating(String(myReview.rating));
    setReviewComment(myReview.comment || "");
  }, [myReview]);

  const totalLessons = useMemo(
    () => course?.sections.reduce((sum, section) => sum + section.lessons.length, 0) || 0,
    [course],
  );
  const progress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
  const currentLesson = course?.sections.flatMap((section) => section.lessons).find((lesson) => lesson.id === activeLesson);
  const currentVideoSource = getVideoSource(currentLesson?.videoUrl);
  const isCurrentLessonCompleted = completedLessons.has(activeLesson);
  const canReviewCourse = progress >= 10;

  const toggleComplete = () => {
    if (!id || !activeLesson) return;
    updateProgressMutation.mutate({
      courseId: id,
      lessonId: activeLesson,
      completed: !isCurrentLessonCompleted,
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  if (isCourseLoading || isEnrollmentLoading) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading course...</div>;
  }

  if (isCourseError || !course) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Course not found</div>;
  }

  if (enrollmentError instanceof ApiError && enrollmentError.status === 404) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Enrollment Required</h1>
          <p className="text-muted-foreground">You need to enroll in this course before accessing lessons.</p>
          <Button asChild>
            <Link to={`/course/${course.id}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Handle Approval Workflow UI
  if (enrollment?.status === "pending") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-xl text-center space-y-10 p-12 bg-slate-900/40 border border-slate-800 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 blur-[60px] rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="h-20 w-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 mx-auto">
              <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h1 className="font-black text-4xl uppercase tracking-tighter text-white">Verification in Progress</h1>
              <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                Our administrative team is currently verifying your payment reference. Access to the instructional environment will be granted shortly.
              </p>
            </div>
            <div className="pt-6">
              <Button asChild className="h-14 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200">
                <Link to="/my-learning">Learning Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (enrollment?.status === "rejected") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md text-center space-y-8 p-12 bg-slate-900/40 border border-rose-900/30 rounded-[3rem] backdrop-blur-3xl">
          <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 mx-auto">
            <XCircle className="h-8 w-8 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h1 className="font-black text-3xl uppercase tracking-tighter text-white">Access Denied</h1>
            <p className="text-slate-500 font-medium text-sm">
              Your enrollment request for this asset was rejected during verification. Please contact support or resubmit valid citation.
            </p>
          </div>
          <Button asChild variant="outline" className="border-slate-800 text-slate-400">
            <Link to="/my-learning">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-foreground">
      <div className="absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
        <PageBackButton className="bg-card/95 border-border text-foreground shadow-sm backdrop-blur" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-foreground">
          <div className="w-full max-w-5xl aspect-video bg-foreground/80 rounded-lg flex items-center justify-center mx-4">
            {currentVideoSource ? (
              currentVideoSource.type === "iframe" ? (
                <iframe
                  src={currentVideoSource.src}
                  title={currentLesson?.title || "Course lesson"}
                  className="h-full w-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video className="h-full w-full rounded-lg" controls preload="metadata">
                  <source src={currentVideoSource.src} />
                </video>
              )
            ) : (
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                  <Play className="h-7 w-7 text-primary-foreground ml-1" />
                </div>
                <p className="text-muted text-sm">{currentLesson?.title}</p>
                <p className="text-muted/60 text-xs">
                  Add a valid YouTube, Vimeo, or direct video URL in curriculum to play this lesson.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">{currentLesson?.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{course.title}</p>
            {currentLesson?.description && (
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{currentLesson.description}</p>
            )}
            {canReviewCourse && (
              <p className="text-xs text-success mt-1">Course completed. You can submit a review.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canReviewCourse && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isReviewLoading}>
                    {myReview ? "Update Review" : "Leave Review"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{myReview ? "Update Review" : "Review this Course"}</DialogTitle>
                    <DialogDescription>
                      Rate the course and share feedback with the instructor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Rating</p>
                      <Select value={reviewRating} onValueChange={setReviewRating}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                          <SelectItem value="4">4 - Very Good</SelectItem>
                          <SelectItem value="3">3 - Good</SelectItem>
                          <SelectItem value="2">2 - Fair</SelectItem>
                          <SelectItem value="1">1 - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Comment</p>
                      <Textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        placeholder="What did you like or dislike about this course?"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                    <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Saving..." : "Save Review"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Button
              onClick={toggleComplete}
              variant={isCurrentLessonCompleted ? "default" : "outline"}
              size="sm"
              disabled={updateProgressMutation.isPending || !activeLesson}
              className={cn(isCurrentLessonCompleted && "gradient-primary border-0 text-primary-foreground")}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {isCurrentLessonCompleted ? "Completed" : "Mark Complete"}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-80 flex-col bg-card border-l border-border">
        <div className="p-4 border-b border-border space-y-2">
          <h3 className="font-display font-semibold text-sm">Course Content</h3>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{completedLessons.size}/{totalLessons} completed</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {course.sections.map((section) => (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-accent rounded-lg transition-colors text-left"
                >
                  {expandedSections.has(section.id) ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="line-clamp-1 flex-1">{section.title}</span>
                </button>
                {expandedSections.has(section.id) && (
                  <div className="ml-4 space-y-0.5">
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors text-left",
                          activeLesson === lesson.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent",
                        )}
                      >
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        <span className="text-muted-foreground/60">{lesson.duration}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
