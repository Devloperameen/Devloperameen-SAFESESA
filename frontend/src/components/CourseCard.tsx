import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/models";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={`/course/${course.id}`}>
      <Card className="group overflow-hidden border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-video w-full" style={{ background: course.thumbnail }} />
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">{course.level}</Badge>
            <Badge variant="outline" className="text-xs">{course.category.replace("-", " ")}</Badge>
          </div>
          <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground">{course.instructor}</p>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-star text-star" />
              <span className="font-semibold text-foreground">{course.rating}</span>
              <span className="text-muted-foreground">({course.reviewCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {course.students.toLocaleString()}
            </div>
          </div>
          <p className="font-display font-bold text-lg text-foreground">${course.price}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
