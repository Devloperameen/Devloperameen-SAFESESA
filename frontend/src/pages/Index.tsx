import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedPage from "@/components/AnimatedPage";
import CourseCard from "@/components/CourseCard";
import heroBanner from "@/assets/eduflow-hero.png";
import { getCourses } from "@/services/courseService";
import { useAuth } from "@/contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stats = [
  { icon: BookOpen, label: "Courses", value: "200+" },
  { icon: Users, label: "Students", value: "50K+" },
  { icon: Award, label: "Instructors", value: "120+" },
  { icon: TrendingUp, label: "Completion Rate", value: "94%" },
];

export default function Index() {
  const { isAuthenticated, user } = useAuth();
  const { data: featured = [] } = useQuery({
    queryKey: ["courses", "featured"],
    queryFn: () => getCourses({ featured: true }),
  });

  const showInstructorCta = !isAuthenticated || user?.role === "instructor";
  const instructorCta = isAuthenticated
    ? { to: "/instructor/create", label: "Create a Course" }
    : { to: "/signup", label: "Become an Instructor" };

  return (
    <AnimatedPage>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={heroBanner}
            alt="EduFlow Learning Marketplace"
            className="w-full h-full object-cover grayscale-[10%] brightness-[60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="container relative z-10 h-full flex items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl space-y-8 backdrop-blur-[2px] p-6 rounded-3xl bg-background/10 border border-white/5 shadow-2xl"
          >
            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              Elevate Your <span className="text-primary italic">Skills</span> with EduFlow
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground leading-relaxed max-w-lg"
            >
              Master top-tier industries with world-class courses taught by leading experts and visionaries. Your future starts now.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <Link to="/courses">
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {showInstructorCta && (
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-full border-2 hover:bg-secondary/50 transition-all duration-300">
                  <Link to={instructorCta.to}>{instructorCta.label}</Link>
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Courses</h2>
            <p className="text-muted-foreground mt-1">Handpicked by our team for quality and impact</p>
          </div>
          <Button asChild variant="ghost" className="gap-1">
            <Link to="/courses">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
