import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/services/courseService";

export default function Payment() {
  const { id } = useParams();

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id || ""),
    enabled: Boolean(id),
  });

  return (
    <AnimatedPage>
      <div className="container py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-2">Payment</h1>
        <p className="text-muted-foreground mb-8">
          Demo payment page (no payment integration yet)
        </p>

        {!id ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Select a Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                Open any paid course and click <span className="font-medium">Go to Payment</span> to see its order summary here.
              </div>
              <Button asChild className="w-full">
                <Link to="/courses">Browse Paid Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading course details...
          </div>
        ) : isError || !course ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Course not found.
          </div>
        ) : (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Course</span>
                <span className="font-medium">{course.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Instructor</span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold">${course.price}</span>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                This page is intentionally non-functional. Payment gateway integration can be added later.
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/course/${course.id}`}>Back to Course</Link>
                </Button>
                <Button className="w-full" disabled>
                  Pay Now (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  );
}
