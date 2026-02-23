import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AnimatedPage from "@/components/AnimatedPage";
import { getEnrollments } from "@/services/enrollmentService";

export default function MyLearning() {
  const {
    data: enrolled = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["enrollments", "list"],
    queryFn: getEnrollments,
  });

  const inProgress = enrolled.filter((item) => item.progress < 100);
  const completed = enrolled.filter((item) => item.progress >= 100);

  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">My Learning</h1>
        <p className="text-muted-foreground mb-8">
          {inProgress.length} in progress | {completed.length} completed
        </p>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Loading your enrollments...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Unable to load your learning data right now.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold mb-4">In Progress</h2>
              {inProgress.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  No in-progress courses.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inProgress.map(({ course, progress, lastAccessed }) => (
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
              )}
            </div>

            <div>
              <h2 className="font-display text-xl font-bold mb-4">Completed Courses</h2>
              {completed.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  No completed courses yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {completed.map(({ course, progress, lastAccessed }) => (
                    <Card key={course.id} className="overflow-hidden shadow-card group border-success/30">
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
                            <span className="text-success">Completed</span>
                            <span className="text-muted-foreground">Last: {lastAccessed}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/learn/${course.id}`}>Review Course</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && !isError && enrolled.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>You are not enrolled in any courses yet.</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
