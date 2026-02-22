import AnimatedPage from "@/components/AnimatedPage";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/mockData";

const favoriteCourses = courses.filter((c) => c.featured).slice(0, 3);

export default function Favorites() {
  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Favorites</h1>
        <p className="text-muted-foreground mb-8">{favoriteCourses.length} saved courses</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {favoriteCourses.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>You haven't saved any courses yet.</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
