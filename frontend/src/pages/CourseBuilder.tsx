import { useState } from "react";
import { Plus, Trash2, GripVertical, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import { categories } from "@/data/mockData";
import { toast } from "sonner";

interface BuilderLesson {
  id: string;
  title: string;
  videoUrl: string;
}

interface BuilderSection {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

let sectionCounter = 1;
let lessonCounter = 1;

export default function CourseBuilder() {
  const [activeTab, setActiveTab] = useState("basic");
  const [sections, setSections] = useState<BuilderSection[]>([
    { id: "s1", title: "Getting Started", lessons: [{ id: "l1", title: "Introduction", videoUrl: "" }] },
  ]);

  const addSection = () => {
    sectionCounter++;
    setSections([...sections, { id: `s${sectionCounter}`, title: "", lessons: [] }]);
  };

  const addLesson = (sectionId: string) => {
    lessonCounter++;
    setSections(sections.map((s) =>
      s.id === sectionId ? { ...s, lessons: [...s.lessons, { id: `l${lessonCounter}`, title: "", videoUrl: "" }] } : s
    ));
  };

  const removeSection = (sectionId: string) => setSections(sections.filter((s) => s.id !== sectionId));
  const removeLesson = (sectionId: string, lessonId: string) =>
    setSections(sections.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s));

  const updateSection = (sectionId: string, title: string) =>
    setSections(sections.map((s) => s.id === sectionId ? { ...s, title } : s));

  const updateLesson = (sectionId: string, lessonId: string, field: "title" | "videoUrl", value: string) =>
    setSections(sections.map((s) =>
      s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, [field]: value } : l) } : s
    ));

  return (
    <AnimatedPage>
      <div className="container py-8 max-w-4xl">
        <h1 className="font-display text-3xl font-bold mb-2">Create New Course</h1>
        <p className="text-muted-foreground mb-8">Set up your course in two simple steps</p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="basic">Step 1: Basic Info</TabsTrigger>
            <TabsTrigger value="curriculum">Step 2: Curriculum</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="shadow-card">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input id="title" placeholder="e.g., React Masterclass 2025" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="What will students learn?" rows={4} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" placeholder="49.99" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("curriculum")} className="gradient-primary border-0 text-primary-foreground">
                    Next: Curriculum →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <div className="space-y-4">
              {sections.map((section, si) => (
                <Card key={section.id} className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, e.target.value)}
                        placeholder={`Section ${si + 1} Title`}
                        className="font-semibold"
                      />
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeSection(section.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.lessons.map((lesson, li) => (
                      <div key={lesson.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-xs text-muted-foreground mt-2.5 shrink-0">L{li + 1}</span>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(section.id, lesson.id, "title", e.target.value)}
                            placeholder="Lesson Title"
                            className="text-sm"
                          />
                          <Input
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(section.id, lesson.id, "videoUrl", e.target.value)}
                            placeholder="Video URL (YouTube/Vimeo)"
                            className="text-sm"
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive shrink-0 h-9 w-9" onClick={() => removeLesson(section.id, lesson.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => addLesson(section.id)}>
                      <Plus className="h-3.5 w-3.5" /> Add Lesson
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addSection}>
                <Plus className="h-4 w-4" /> Add Section
              </Button>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>← Back</Button>
                <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => toast.success("Course created successfully!")}>
                  Publish Course
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}
