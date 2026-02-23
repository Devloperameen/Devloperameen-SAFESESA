import { useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Users, BarChart3, Play, CheckCircle2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnimatedPage from "@/components/AnimatedPage";
import { useAuth } from "@/contexts/AuthContext";
import { getVideoSource } from "@/lib/video";
import { getCourseById, getCourseReviews } from "@/services/courseService";
import { enrollInCourse, getEnrollments } from "@/services/enrollmentService";
import { addFavorite, getFavorites, removeFavorite } from "@/services/favoriteService";

export default function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const isAdminPreview = location.pathname.startsWith("/admin/course/");

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id || ""),
    enabled: Boolean(id),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", "list"],
    queryFn: getEnrollments,
    enabled: isAuthenticated && user?.role === "student",
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["course", "reviews", id],
    queryFn: () => getCourseReviews(id || ""),
    enabled: Boolean(id),
  });

  const isEnrolled = useMemo(
    () => Boolean(course && enrollments.some((enrollment) => enrollment.course.id === course.id)),
    [course, enrollments],
  );

  const isFavorite = useMemo(
    () => Boolean(course && favorites.some((favoriteCourse) => favoriteCourse.id === course.id)),
    [course, favorites],
  );

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
      toast.success("Successfully enrolled in course");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to enroll");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (isFavorite) {
        await removeFavorite(courseId);
      } else {
        await addFavorite(courseId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "list"] });
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update favorites");
    },
  });

  if (isLoading) {
    return <div className="container py-16 text-center text-muted-foreground">Loading course...</div>;
  }

  if (isError || !course) {
    return <div className="container py-16 text-center text-muted-foreground">Course not found</div>;
  }

  const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const previewVideo = getVideoSource(course.previewVideoUrl);

  return (
    <AnimatedPage>
      <div className="relative w-full min-h-[400px] flex items-center overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover opacity-30 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        <div className="container relative z-10 py-12 md:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-0 hover:bg-primary/30 transition-colors uppercase tracking-wider text-[10px] font-bold">
                {course.category}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20 capitalize">
                {course.level}
              </Badge>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] drop-shadow-md">
              {course.title}
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
              {course.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Star className="h-4 w-4 fill-star text-star" />
                <span className="font-bold text-white">{course.rating}</span>
                <span className="opacity-70">({course.reviewCount.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{course.students.toLocaleString()} students enrolled</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 text-white font-bold text-xs uppercase">
                {course.instructor.split(" ").map((name) => name[0]).join("")}
              </div>
              <p className="text-sm text-slate-300">
                Created by <span className="text-white font-semibold underline decoration-primary/50 underline-offset-4">{course.instructor}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="aspect-video rounded-xl overflow-hidden bg-foreground/5 border border-border flex items-center justify-center">
              {previewVideo ? (
                previewVideo.type === "iframe" ? (
                  <iframe
                    src={previewVideo.src}
                    title={`${course.title} preview`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video className="h-full w-full" controls preload="metadata">
                    <source src={previewVideo.src} />
                  </video>
                )
              ) : (
                <div className="text-center space-y-3">
                  <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                    <Play className="h-7 w-7 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-muted-foreground text-sm">Preview this course</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold">About the Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg shrink-0">
                  {course.instructor.split(" ").map((name) => name[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground mt-1">{course.instructorBio}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold">About This Course</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Student Reviews</h2>
              {reviews.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  No reviews yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{review.studentName}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-star text-star" />
                          <span>{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Course Content</h2>
                <p className="text-sm text-muted-foreground">{course.sections.length} sections | {totalLessons} lessons</p>
              </div>
              <Accordion type="multiple" className="space-y-2">
                {course.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-sm font-semibold">
                      {section.title}
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal">{section.lessons.length} lessons</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-start gap-3 py-2 text-sm text-muted-foreground">
                            <Play className="h-3.5 w-3.5 shrink-0 mt-1" />
                            <div className="flex-1">
                              <p>{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground/90 mt-1">{lesson.description}</p>
                              )}
                            </div>
                            <span className="text-xs shrink-0">{lesson.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-border rounded-xl p-6 bg-card shadow-card space-y-5">
              <p className="font-display text-3xl font-bold">${course.price}</p>

              {isAdminPreview ? (
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Admin preview mode: enrollment and favorite actions are hidden.
                </div>
              ) : (
                <>
                  {!isAuthenticated ? (
                    <Button asChild className="w-full gradient-primary border-0 text-primary-foreground font-semibold" size="lg">
                      <Link to="/login">Log In to Enroll</Link>
                    </Button>
                  ) : user?.role !== "student" ? (
                    <Button className="w-full gradient-primary border-0 text-primary-foreground font-semibold" size="lg" disabled>
                      Students Only
                    </Button>
                  ) : isEnrolled ? (
                    <Button className="w-full gradient-primary border-0 text-primary-foreground font-semibold" size="lg" disabled>
                      Already Enrolled
                    </Button>
                  ) : course.price > 0 ? (
                    <Button asChild className="w-full gradient-primary border-0 text-primary-foreground font-semibold" size="lg">
                      <Link to={`/payment/${course.id}`}>Go to Payment</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full gradient-primary border-0 text-primary-foreground font-semibold"
                      size="lg"
                      disabled={enrollMutation.isPending}
                      onClick={() => enrollMutation.mutate(course.id)}
                    >
                      {enrollMutation.isPending ? "Enrolling..." : "Enroll for Free"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    asChild={isEnrolled}
                    disabled={!isEnrolled}
                  >
                    {isEnrolled ? <Link to={`/learn/${course.id}`}>Start Learning</Link> : <span>Enroll to Start Learning</span>}
                  </Button>

                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => favoriteMutation.mutate(course.id)}
                      disabled={favoriteMutation.isPending}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                      {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                    </Button>
                  )}
                </>
              )}

              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Sections</span><span className="font-medium">{course.sections.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lessons</span><span className="font-medium">{totalLessons}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Level</span><span className="font-medium">{course.level}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Students</span><span className="font-medium">{course.students.toLocaleString()}</span></div>
              </div>
              {!isAdminPreview && (
                <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>30-day money-back guarantee</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
