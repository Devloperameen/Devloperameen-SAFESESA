import AnimatedPage from "@/components/AnimatedPage";
import { useQuery } from "@tanstack/react-query";
import CourseCard from "@/components/CourseCard";
import { getFavorites } from "@/services/favoriteService";

export default function Favorites() {
  const {
    data: favoriteCourses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: getFavorites,
  });

  return (
    <AnimatedPage>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">Favorites</h1>
        <p className="text-muted-foreground mb-8">{favoriteCourses.length} saved courses</p>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Loading your favorites...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Unable to load favorites right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!isLoading && !isError && favoriteCourses.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>You haven&apos;t saved any courses yet.</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
