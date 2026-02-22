import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AnimatedPage from "@/components/AnimatedPage";
import CourseCard from "@/components/CourseCard";
import { courses, categories } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCat = (slug: string) =>
    setSelectedCats((prev) => prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]);

  const filtered = useMemo(() => {
    let result = courses.filter((c) => c.status === "published");
    if (search) result = result.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()));
    if (selectedCats.length) result = result.filter((c) => selectedCats.includes(c.category));
    return result;
  }, [search, selectedCats]);

  return (
    <AnimatedPage>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Browse Courses</h1>
          <p className="text-muted-foreground mt-1">Discover courses that match your goals</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={cn("lg:w-64 shrink-0 space-y-6", showFilters ? "block" : "hidden lg:block")}>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
              {categories.map((cat) => (
                <div key={cat.slug} className="flex items-center gap-2">
                  <Checkbox
                    id={cat.slug}
                    checked={selectedCats.includes(cat.slug)}
                    onCheckedChange={() => toggleCat(cat.slug)}
                  />
                  <Label htmlFor={cat.slug} className="text-sm cursor-pointer flex-1">{cat.name}</Label>
                  <span className="text-xs text-muted-foreground">{cat.courseCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" className="lg:hidden gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{filtered.length} courses found</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No courses found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
