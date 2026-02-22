import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AnimatedPage from "@/components/AnimatedPage";
import { courses, enrolledCourses } from "@/data/mockData";

export default function MyLearning() {
  const enrolled = enrolledCourses.map((ec) => ({
    ...ec,
    course: courses.find((c) => c.id === ec.courseId)!,
  }));

  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">My Learning</h1>
        <p className="text-muted-foreground mb-8">{enrolled.length} courses in progress</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrolled.map(({ course, progress, lastAccessed }) => (
            <Card key={course.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group">
              <div className="aspect-video w-full relative" style={{ background: course.thumbnail }}>
                <Link
                  to={`/learn/${course.id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/30"
                >
                  <div className="h-12 w-12 rounded-full bg-primary-foreground flex items-center justify-center">
                    <Play className="h-5 w-5 text-foreground ml-0.5" />
                  </div>
                </Link>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{course.title}</h3>
                <p className="text-xs text-muted-foreground">{course.instructor}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{progress}% complete</span>
                    <span className="text-muted-foreground">Last: {lastAccessed}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/learn/${course.id}`}>Continue Learning</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}
