import { useParams, Link } from "react-router-dom";
import { Star, Users, Clock, BarChart3, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnimatedPage from "@/components/AnimatedPage";
import { courses } from "@/data/mockData";

export default function CourseDetails() {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return <div className="container py-16 text-center text-muted-foreground">Course not found</div>;
  }

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <AnimatedPage>
      {/* Hero banner */}
      <div className="w-full" style={{ background: course.thumbnail }}>
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">{course.category.replace("-", " ")}</Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">{course.title}</h1>
            <p className="text-primary-foreground/80 leading-relaxed">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-star text-star" />
                <span className="font-semibold text-primary-foreground">{course.rating}</span>
                <span>({course.reviewCount.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-1"><Users className="h-4 w-4" />{course.students.toLocaleString()} students</div>
              <div className="flex items-center gap-1"><BarChart3 className="h-4 w-4" />{course.level}</div>
            </div>
            <p className="text-primary-foreground/70 text-sm">Created by <span className="text-primary-foreground underline">{course.instructor}</span></p>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Video preview */}
            <div className="aspect-video rounded-xl overflow-hidden bg-foreground/5 border border-border flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                  <Play className="h-7 w-7 text-primary-foreground ml-1" />
                </div>
                <p className="text-muted-foreground text-sm">Preview this course</p>
              </div>
            </div>

            {/* Instructor */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold">About the Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg shrink-0">
                  {course.instructor.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground mt-1">{course.instructorBio}</p>
                </div>
              </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Course Content</h2>
                <p className="text-sm text-muted-foreground">{course.sections.length} sections · {totalLessons} lessons</p>
              </div>
              <Accordion type="multiple" className="space-y-2">
                {course.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-sm font-semibold">
                      {section.title}
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal">{section.lessons.length} lessons</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
                            <Play className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs">{lesson.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-border rounded-xl p-6 bg-card shadow-card space-y-5">
              <p className="font-display text-3xl font-bold">${course.price}</p>
              <Button className="w-full gradient-primary border-0 text-primary-foreground font-semibold" size="lg">
                Buy Now
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link to={`/learn/${course.id}`}>Start Learning</Link>
              </Button>
              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Sections</span><span className="font-medium">{course.sections.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lessons</span><span className="font-medium">{totalLessons}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Level</span><span className="font-medium">{course.level}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Students</span><span className="font-medium">{course.students.toLocaleString()}</span></div>
              </div>
              <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
