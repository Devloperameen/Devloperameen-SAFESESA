
import { useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Users, Play, CheckCircle2, Heart, ShieldCheck, Zap, ArrowLeft, MoreHorizontal, MessageCircle, Clock, Layers } from "lucide-react";
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
import { motion } from "framer-motion";

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

  const enrollment = useMemo(
    () => course ? enrollments.find((e) => e.course.id === course.id) : null,
    [course, enrollments],
  );

  const isEnrolled = Boolean(enrollment && enrollment.status === "active");
  const isPending = Boolean(enrollment && enrollment.status === "pending");
  const isRejected = Boolean(enrollment && enrollment.status === "rejected");

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
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-primary font-display animate-pulse uppercase tracking-widest">Loading Course Assets...</div>;
  }

  if (isError || !course) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Course not found in archive.</div>;
  }

  const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const previewVideo = getVideoSource(course.previewVideoUrl);

  return (
    <AnimatedPage>
      <div className="bg-slate-950 min-h-screen">
        {/* Cinematic Header Block */}
        <div className="relative w-full min-h-[500px] flex items-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover opacity-20 filter brightness-50 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
          </div>

          <div className="container relative z-10 py-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl space-y-8"
            >
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary text-white border-0 py-1 px-4 uppercase tracking-[0.2em] text-[10px] font-black rounded-lg">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="text-white border-white/20 capitalize px-4 font-bold bg-white/5 backdrop-blur-md">
                  {course.level}
                </Badge>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 px-4 font-bold bg-emerald-500/5 backdrop-blur-md">
                  Verified Asset
                </Badge>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase">
                {course.title}
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl font-medium border-l-4 border-primary pl-8 py-2">
                {course.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-8 text-sm">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  <span className="font-black text-white text-lg">{course.rating}</span>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">({course.reviewCount.toLocaleString()} Reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-widest text-xs">
                  <Users className="h-4 w-4 text-primary" />
                  {course.students.toLocaleString()} Active Learners
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="h-14 w-14 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 text-white font-black text-xl uppercase backdrop-blur-md shadow-2xl">
                  {course.instructor.split(" ").map((name) => name[0]).join("")}
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Lead Instructor</p>
                  <p className="text-lg text-white font-bold">{course.instructor}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container py-16 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-16">
              {/* Premium Video Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-[0_0_50px_-12px_rgba(37,99,235,0.3)] group relative"
              >
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
                  <div className="h-full w-full flex flex-col items-center justify-center space-y-6">
                    <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Play className="h-10 w-10 text-primary fill-current ml-2" />
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Authorize Course Preview</p>
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Cinema View Active</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">HD 1080P</Badge>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20"><MessageCircle className="h-5 w-5 text-primary" /></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Instructor Profile</h2>
                  </div>
                  <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/60 backdrop-blur-sm space-y-4">
                    <p className="text-slate-400 leading-relaxed font-medium text-sm italic border-l-2 border-slate-800 pl-4">
                      "{course.instructorBio}"
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs">
                        {course.instructor.split(" ").map((name) => name[0]).join("")}
                      </div>
                      <span className="text-white font-bold">{course.instructor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20"><Zap className="h-5 w-5 text-primary" /></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Overview</h2>
                  </div>
                  <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/60 backdrop-blur-sm">
                    <p className="text-sm text-slate-400 leading-relaxed font-medium whitespace-pre-line">{course.description}</p>
                  </div>
                </div>
              </div>

              {/* Course Curriculum - Advanced High-Tech Accordion */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Technical Curriculum</h2>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {course.sections.length} NODES</span>
                    <span className="flex items-center gap-1.5"><Play className="h-3 w-3" /> {totalLessons} LESSONS</span>
                  </div>
                </div>

                <Accordion type="multiple" className="space-y-4">
                  {course.sections.map((section, idx) => (
                    <AccordionItem key={section.id} value={section.id} className="border border-slate-800/80 rounded-[1.5rem] bg-slate-900/30 overflow-hidden shadow-sm">
                      <AccordionTrigger className="hover:no-underline px-6 py-6 group">
                        <div className="flex items-center gap-4 text-left">
                          <span className="text-xs font-black text-primary bg-primary/10 h-8 w-8 rounded-lg flex items-center justify-center border border-primary/20">0{idx + 1}</span>
                          <div>
                            <span className="text-white font-bold group-hover:text-primary transition-colors pr-4">{section.title}</span>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{section.lessons.length} Modules</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-3 pt-4 border-t border-slate-800/50">
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-transparent hover:border-slate-800 hover:bg-slate-900/50 transition-all group cursor-default">
                              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Play className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{lesson.title}</p>
                                <p className="text-[10px] text-slate-600 mt-1 uppercase font-medium line-clamp-1">{lesson.description || "Core module description not provided."}</p>
                              </div>
                              <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500 py-0.5">{lesson.duration}</Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Sidebar Sticky Panel - High Conversion Style */}
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Zap className="h-40 w-40 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Lifetime Access License</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-white font-display tracking-tighter">${course.price}</span>
                      <span className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-widest">USD</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isAdminPreview ? (
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-[10px] font-bold text-primary uppercase tracking-widest text-center">
                        Administrative Preview Environment
                      </div>
                    ) : (
                      <>
                        {!isAuthenticated ? (
                          <Button asChild className="w-full h-16 rounded-2xl gradient-primary font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20" size="lg">
                            <Link to="/login">Initialize Authentication</Link>
                          </Button>
                        ) : user?.role !== "student" ? (
                          <Button className="w-full h-16 rounded-2xl bg-slate-800 text-white font-black text-lg uppercase tracking-widest" disabled>
                            Student Identity Required
                          </Button>
                        ) : isEnrolled ? (
                          <Button className="w-full h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-lg uppercase tracking-widest" disabled>
                            License Verified
                          </Button>
                        ) : isPending ? (
                          <div className="space-y-4">
                            <Button className="w-full h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-lg uppercase tracking-widest" disabled>
                              <Clock className="mr-3 h-5 w-5 animate-pulse" />
                              Verification Pending
                            </Button>
                            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                              <p className="text-[9px] font-black text-amber-500 text-center uppercase tracking-widest">
                                Administrative review is currently in progress.
                              </p>
                            </div>
                          </div>
                        ) : isRejected ? (
                          <Button className="w-full h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-lg uppercase tracking-widest" disabled>
                            Request Denied
                          </Button>
                        ) : course.price > 0 ? (
                          <Button asChild className="w-full h-16 rounded-2xl gradient-primary font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" size="lg">
                            <Link to={`/payment/${course.id}`}>Request Access Protocol</Link>
                          </Button>
                        ) : (
                          <Button
                            className="w-full h-16 rounded-2xl gradient-primary font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20"
                            size="lg"
                            disabled={enrollMutation.isPending}
                            onClick={() => enrollMutation.mutate(course.id)}
                          >
                            {enrollMutation.isPending ? "Syncing..." : "Activate Free License"}
                          </Button>
                        )}

                        {!isEnrolled && !isPending && !isRejected ? (
                          <p className="text-[9px] text-slate-600 font-black text-center uppercase tracking-widest">
                            Manual verification required after submission
                          </p>
                        ) : null}

                        <Button
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-slate-700 bg-slate-950/50 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs"
                          asChild={isEnrolled}
                          disabled={!isEnrolled}
                        >
                          {isEnrolled ? <Link to={`/learn/${course.id}`}>Enter Laboratory</Link> : <span>Sync Enrollment to access</span>}
                        </Button>

                        {isAuthenticated && (
                          <Button
                            variant="ghost"
                            className="w-full h-12 gap-3 text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[10px]"
                            onClick={() => favoriteMutation.mutate(course.id)}
                            disabled={favoriteMutation.isPending}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                            {isFavorite ? "Archived in Vault" : "Archive to Vault"}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-6 pt-8 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[10px] font-black uppercase tracking-[0.2em]">
                      <div className="space-y-1">
                        <span className="text-slate-600 block">Sections</span>
                        <span className="text-white">{course.sections.length}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-600 block">Lessons</span>
                        <span className="text-white">{totalLessons}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-600 block">Expertise</span>
                        <span className="text-white">{course.level}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-600 block">Authority</span>
                        <span className="text-white">Ranked {course.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-white uppercase tracking-widest">Master Protection</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">30-Day Content Guarantee</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
