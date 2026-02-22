import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedPage from "@/components/AnimatedPage";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/mockData";
import heroBanner from "@/assets/hero-banner.jpg";

const stats = [
  { icon: BookOpen, label: "Courses", value: "200+" },
  { icon: Users, label: "Students", value: "50K+" },
  { icon: Award, label: "Instructors", value: "120+" },
  { icon: TrendingUp, label: "Completion Rate", value: "94%" },
];

export default function Index() {
  const featured = courses.filter((c) => c.featured).slice(0, 4);

  return (
    <AnimatedPage>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBanner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>
        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Learn Without Limits
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-lg">
              Unlock your potential with world-class courses taught by industry experts. Start your journey today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-primary border-0 text-primary-foreground font-semibold">
                <Link to="/courses">
                  Explore Courses <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Link to="/instructor/create">Teach on EduFlow</Link>
              </Button>
            </div>
          </div>
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
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
