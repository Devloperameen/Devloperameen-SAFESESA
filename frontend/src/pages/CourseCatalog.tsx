
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, BookOpen, Layers, Zap, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedPage from "@/components/AnimatedPage";
import CourseCard from "@/components/CourseCard";
import { getCoursesPage } from "@/services/courseService";
import { getCategories } from "@/services/categoryService";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const selectedCategoryFilter = useMemo(() => selectedCats.join(","), [selectedCats]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategoryFilter, freeOnly, featuredOnly, levelFilter]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories("public"),
  });

  const {
    data: pagedCourses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["courses", "catalog", search, selectedCategoryFilter, freeOnly, featuredOnly, levelFilter, page],
    queryFn: () =>
      getCoursesPage({
        search: search || undefined,
        category: selectedCategoryFilter || undefined,
        free: freeOnly ? true : undefined,
        featured: featuredOnly ? true : undefined,
        level: levelFilter === "all" ? undefined : levelFilter,
        page,
        limit: pageSize,
      }),
  });

  const toggleCat = (categoryName: string) =>
    setSelectedCats((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName],
    );

  const courses = pagedCourses?.items || [];
  const totalCourses = pagedCourses?.total || 0;
  const totalPages = pagedCourses?.totalPages || 1;
  const hasPrev = pagedCourses?.hasPrev || false;
  const hasNext = pagedCourses?.hasNext || false;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-slate-950 pb-20">
        {/* Advanced Hero Header */}
        <div className="relative py-16 mb-8 overflow-hidden bg-slate-900 border-b border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4">
                Knowledge <span className="text-primary italic">Vault</span>
              </h1>
              <p className="text-slate-400 font-medium tracking-wide max-w-xl text-sm md:text-base border-l-2 border-primary/40 pl-6 py-2">
                Precision-engineered courses designed to accelerate your technical and creative mastery. Access our global archive of premium educational assets.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Filters - High Tech Style */}
            <aside className={cn(
              "lg:w-72 shrink-0 lg:block space-y-10",
              showFilters ? "fixed inset-0 z-50 bg-slate-950 p-8 overflow-y-auto" : "hidden"
            )}>
              <div className="flex items-center justify-between lg:hidden mb-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Adjust Filters</h2>
                <Button variant="ghost" onClick={() => setShowFilters(false)} className="h-12 w-12 rounded-2xl bg-slate-900">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Layers className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Categories</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {categories.map((cat) => (
                    <motion.div
                      key={cat.slug}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border border-transparent transition-all cursor-pointer group",
                        selectedCats.includes(cat.name) ? "bg-primary/10 border-primary/30" : "hover:bg-slate-900/50 hover:border-slate-800"
                      )}
                      onClick={() => toggleCat(cat.name)}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                        selectedCats.includes(cat.name) ? "bg-primary border-primary" : "border-slate-700 group-hover:border-slate-500"
                      )}>
                        {selectedCats.includes(cat.name) && <X className="h-3 w-3 text-white" />}
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-all",
                        selectedCats.includes(cat.name) ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      )}>{cat.name}</span>
                      <span className="ml-auto text-[10px] font-black text-slate-600 group-hover:text-primary transition-colors">{cat.courseCount}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-slate-900">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Parameters</h3>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Skill Level</Label>
                  <Select value={levelFilter} onValueChange={(value: typeof levelFilter) => setLevelFilter(value)}>
                    <SelectTrigger className="h-12 bg-slate-900/50 border-slate-800 rounded-2xl text-white font-bold text-xs uppercase shadow-inner">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="all">Unrestricted Levels</SelectItem>
                      <SelectItem value="beginner">Entry-Level Focus</SelectItem>
                      <SelectItem value="intermediate">Mid-Tier Specialization</SelectItem>
                      <SelectItem value="advanced">Expert-Tier Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/50 rounded-2xl group cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => setFreeOnly(!freeOnly)}>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Free Assets</span>
                    <Checkbox id="filter-free" checked={freeOnly} onCheckedChange={(checked) => setFreeOnly(Boolean(checked))} className="rounded-md border-slate-700" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/50 rounded-2xl group cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => setFeaturedOnly(!featuredOnly)}>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Verified Only</span>
                    <Checkbox id="filter-featured" checked={featuredOnly} onCheckedChange={(checked) => setFeaturedOnly(Boolean(checked))} className="rounded-md border-slate-700" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Interface */}
            <main className="flex-1 space-y-8">
              <div className="flex gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="QUERY DATABASE FOR COURSES..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-16 pl-14 bg-slate-900/50 border-slate-800/80 focus:border-primary/50 rounded-2xl text-white font-bold placeholder:text-slate-700 shadow-inner tracking-widest"
                  />
                </div>
                <Button
                  variant="outline"
                  className="lg:hidden h-16 w-16 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-slate-900"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </Button>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Results Found: {totalCourses.toLocaleString()}
                  </span>
                </div>
                <div className="h-[1px] flex-1 mx-6 bg-slate-900" />
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 p-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : isError ? (
                <div className="py-20 text-center max-w-sm mx-auto">
                  <div className="h-20 w-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                    <X className="h-10 w-10 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Connection Failed</h3>
                  <p className="text-slate-500 mt-2 font-medium">Unable to synchronize with the course repository.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CourseCard course={course} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {!isLoading && !isError && courses.length === 0 && (
                <div className="py-20 text-center max-w-sm mx-auto">
                  <div className="h-20 w-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                    <Search className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Matches</h3>
                  <p className="text-slate-500 mt-2 font-medium">Your query did not return any assets from our vault.</p>
                </div>
              )}

              {!isLoading && !isError && totalPages > 1 && (
                <div className="mt-12 pt-10 border-t border-slate-900 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Transmission {page} of {totalPages}
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      disabled={!hasPrev}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="h-12 px-6 rounded-xl border-slate-800 bg-slate-950/50 hover:bg-slate-900 font-bold"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!hasNext}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="h-12 px-6 rounded-xl border-slate-800 bg-slate-950/50 hover:bg-slate-900 font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
