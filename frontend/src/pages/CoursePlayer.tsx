import { useState } from "react";
import { useParams } from "react-router-dom";
import { Play, CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { courses } from "@/data/mockData";

export default function CoursePlayer() {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);
  const [activeLesson, setActiveLesson] = useState(course?.sections[0]?.lessons[0]?.id || "");
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([course?.sections[0]?.id || ""]));

  if (!course) return <div className="flex items-center justify-center h-screen text-muted-foreground">Course not found</div>;

  const currentLesson = course.sections.flatMap((s) => s.lessons).find((l) => l.id === activeLesson);
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const progress = Math.round((completedLessons.size / totalLessons) * 100);

  const toggleComplete = () => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(activeLesson)) next.delete(activeLesson);
      else next.add(activeLesson);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-foreground">
      {/* Video area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-foreground">
          <div className="w-full max-w-5xl aspect-video bg-foreground/80 rounded-lg flex items-center justify-center mx-4">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                <Play className="h-7 w-7 text-primary-foreground ml-1" />
              </div>
              <p className="text-muted text-sm">{currentLesson?.title}</p>
              <p className="text-muted/60 text-xs">{currentLesson?.duration}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">{currentLesson?.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{course.title}</p>
          </div>
          <Button
            onClick={toggleComplete}
            variant={completedLessons.has(activeLesson) ? "default" : "outline"}
            size="sm"
            className={cn(completedLessons.has(activeLesson) && "gradient-primary border-0 text-primary-foreground")}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {completedLessons.has(activeLesson) ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>

      {/* Sidebar curriculum */}
      <div className="hidden md:flex w-80 flex-col bg-card border-l border-border">
        <div className="p-4 border-b border-border space-y-2">
          <h3 className="font-display font-semibold text-sm">Course Content</h3>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{completedLessons.size}/{totalLessons} completed</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {course.sections.map((section) => (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-accent rounded-lg transition-colors text-left"
                >
                  {expandedSections.has(section.id) ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="line-clamp-1 flex-1">{section.title}</span>
                </button>
                {expandedSections.has(section.id) && (
                  <div className="ml-4 space-y-0.5">
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors text-left",
                          activeLesson === lesson.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        <span className="text-muted-foreground/60">{lesson.duration}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
