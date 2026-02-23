import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedPage from "@/components/AnimatedPage";
import CourseCard from "@/components/CourseCard";
import { getCourses } from "@/services/courseService";
import { getCategories } from "@/services/categoryService";
import { cn } from "@/lib/utils";

export default function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories("public"),
  });

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["courses", "catalog", search, freeOnly, featuredOnly, levelFilter],
    queryFn: () =>
      getCourses({
        search: search || undefined,
        free: freeOnly ? true : undefined,
        featured: featuredOnly ? true : undefined,
        level: levelFilter === "all" ? undefined : levelFilter,
      }),
  });

  const toggleCat = (categoryName: string) =>
    setSelectedCats((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName],
    );

  const filtered = useMemo(() => {
    let result = courses;
    if (selectedCats.length) {
      result = result.filter((course) => selectedCats.includes(course.category));
    }
    return result;
  }, [courses, selectedCats]);

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
                    checked={selectedCats.includes(cat.name)}
                    onCheckedChange={() => toggleCat(cat.name)}
                  />
                  <Label htmlFor={cat.slug} className="text-sm cursor-pointer flex-1">{cat.name}</Label>
                  <span className="text-xs text-muted-foreground">{cat.courseCount}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Level</Label>
                <Select value={levelFilter} onValueChange={(value: typeof levelFilter) => setLevelFilter(value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-free" checked={freeOnly} onCheckedChange={(checked) => setFreeOnly(Boolean(checked))} />
                <Label htmlFor="filter-free" className="text-sm cursor-pointer flex-1">Free Courses</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-featured" checked={featuredOnly} onCheckedChange={(checked) => setFeaturedOnly(Boolean(checked))} />
                <Label htmlFor="filter-featured" className="text-sm cursor-pointer flex-1">Featured Courses</Label>
              </div>
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

            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Loading courses...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Unable to load courses right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
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
