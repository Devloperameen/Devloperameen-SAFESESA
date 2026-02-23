import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, GripVertical, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import { getCategories } from "@/services/categoryService";
import {
  createCourse,
  getCourseById,
  requestCourseUnpublish,
  submitCourseForReview,
  updateCourseById,
  type UpsertCoursePayload,
} from "@/services/courseService";

interface BuilderLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}

interface BuilderSection {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

interface CourseFormState {
  title: string;
  shortDescription: string;
  description: string;
  previewVideoUrl: string;
  category: string;
  price: string;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail: string;
}

let idCounter = 1;
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

const initialLesson = (): BuilderLesson => ({
  id: makeId("lesson"),
  title: "",
  description: "",
  videoUrl: "",
  duration: "10",
});

const initialSection = (): BuilderSection => ({
  id: makeId("section"),
  title: "Getting Started",
  lessons: [initialLesson()],
});

const initialFormState: CourseFormState = {
  title: "",
  shortDescription: "",
  description: "",
  previewVideoUrl: "",
  category: "",
  price: "",
  level: "beginner",
  thumbnail: "/placeholder.svg",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning border-warning/20",
  published: "bg-success/10 text-success border-success/20",
  pending_unpublish: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CourseBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState<CourseFormState>(initialFormState);
  const [isFreeCourse, setIsFreeCourse] = useState(false);
  const [sections, setSections] = useState<BuilderSection[]>([initialSection()]);
  const [hydratedFromCourse, setHydratedFromCourse] = useState(false);
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [draggingLesson, setDraggingLesson] = useState<{ sectionId: string; lessonId: string } | null>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories("all"),
  });

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id || ""),
    enabled: isEditMode,
  });

  useEffect(() => {
    setHydratedFromCourse(false);
    if (!isEditMode) {
      setForm(initialFormState);
      setSections([initialSection()]);
      setIsFreeCourse(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (!course || hydratedFromCourse) return;

    let thumbnailValue = course.thumbnail;
    const thumbnailMatch = /^url\(["']?(.*)["']\)\s*center\/cover no-repeat$/.exec(course.thumbnail);
    if (thumbnailMatch?.[1]) {
      thumbnailValue = thumbnailMatch[1];
    }

    setForm({
      title: course.title,
      shortDescription: course.shortDescription || "",
      description: course.description,
      previewVideoUrl: course.previewVideoUrl || "",
      category: course.category,
      price: String(course.price),
      level: course.level.toLowerCase() as "beginner" | "intermediate" | "advanced",
      thumbnail: thumbnailValue || "/placeholder.svg",
    });

    const loadedSections = course.sections.map((section) => ({
      id: section.id || makeId("section"),
      title: section.title,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id || makeId("lesson"),
        title: lesson.title,
        description: lesson.description || "",
        videoUrl: lesson.videoUrl,
        duration: lesson.duration.split(":")[0] || "10",
      })),
    }));

    setSections(loadedSections.length > 0 ? loadedSections : [initialSection()]);
    setIsFreeCourse(course.price === 0);
    setHydratedFromCourse(true);
  }, [course, hydratedFromCourse]);

  const updateForm = <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleThumbnailFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateForm("thumbnail", reader.result);
        setThumbnailFileName(file.name);
        toast.success("Thumbnail uploaded.");
      }
    };
    reader.onerror = () => {
      toast.error("Unable to read image file.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const addSection = () => {
    setSections((prev) => [...prev, { id: makeId("section"), title: "", lessons: [initialLesson()] }]);
  };

  const addLesson = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, lessons: [...section.lessons, initialLesson()] }
          : section,
      ),
    );
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((section) => section.id !== sectionId);
    });
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.lessons.length === 1) return section;
        return {
          ...section,
          lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
        };
      }),
    );
  };

  const updateSection = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, title } : section)),
    );
  };

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    field: keyof Omit<BuilderLesson, "id">,
    value: string,
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson,
              ),
            }
          : section,
      ),
    );
  };

  const moveSection = (sourceSectionId: string, targetSectionId: string) => {
    setSections((prev) => {
      const sourceIndex = prev.findIndex((section) => section.id === sourceSectionId);
      const targetIndex = prev.findIndex((section) => section.id === targetSectionId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return prev;

      const next = [...prev];
      const [movedSection] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, movedSection);
      return next;
    });
  };

  const moveLesson = (sectionId: string, sourceLessonId: string, targetLessonId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const sourceIndex = section.lessons.findIndex((lesson) => lesson.id === sourceLessonId);
        const targetIndex = section.lessons.findIndex((lesson) => lesson.id === targetLessonId);

        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
          return section;
        }

        const nextLessons = [...section.lessons];
        const [movedLesson] = nextLessons.splice(sourceIndex, 1);
        nextLessons.splice(targetIndex, 0, movedLesson);

        return {
          ...section,
          lessons: nextLessons,
        };
      }),
    );
  };

  const handleSectionDrop = (targetSectionId: string) => {
    if (!draggingSectionId || draggingSectionId === targetSectionId) return;
    moveSection(draggingSectionId, targetSectionId);
    setDraggingSectionId(null);
  };

  const handleLessonDrop = (sectionId: string, targetLessonId: string) => {
    if (!draggingLesson) return;
    if (draggingLesson.sectionId !== sectionId || draggingLesson.lessonId === targetLessonId) return;

    moveLesson(sectionId, draggingLesson.lessonId, targetLessonId);
    setDraggingLesson(null);
  };

  const normalizedSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          title: section.title.trim(),
          lessons: section.lessons
            .map((lesson) => ({
              ...lesson,
              title: lesson.title.trim(),
              description: lesson.description.trim(),
              videoUrl: lesson.videoUrl.trim(),
            }))
            .filter((lesson) => lesson.title && lesson.videoUrl),
        }))
        .filter((section) => section.title && section.lessons.length > 0),
    [sections],
  );

  const thumbnailPreview = useMemo(() => {
    const value = form.thumbnail || "/placeholder.svg";

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/") ||
      value.startsWith("data:image")
    ) {
      return `url("${value}") center/cover no-repeat`;
    }

    return value;
  }, [form.thumbnail]);

  const thumbnailUrlValue = form.thumbnail.startsWith("data:image") ? "" : form.thumbnail;

  const buildPayload = (): UpsertCoursePayload | null => {
    if (!form.title.trim() || !form.shortDescription.trim() || !form.description.trim() || !form.category || (!isFreeCourse && !form.price.trim())) {
      toast.error("Please complete title, short description, full description, category, and price.");
      return null;
    }

    if (Number(form.price || 0) < 0) {
      toast.error("Price cannot be negative.");
      return null;
    }

    if (normalizedSections.length === 0) {
      toast.error("Please add at least one section with one valid lesson.");
      return null;
    }

    return {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      previewVideoUrl: form.previewVideoUrl.trim() || undefined,
      category: form.category,
      price: isFreeCourse ? 0 : Number(form.price),
      level: form.level,
      thumbnail: form.thumbnail || "/placeholder.svg",
      sections: normalizedSections.map((section) => ({
        title: section.title,
        lessons: section.lessons.map((lesson, index) => ({
          title: lesson.title,
          description: lesson.description || "",
          videoUrl: lesson.videoUrl,
          duration: Math.max(1, Number(lesson.duration) || 10),
          order: index + 1,
        })),
      })),
    };
  };

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload) throw new Error("Invalid form");

      if (isEditMode && id) {
        return updateCourseById(id, payload);
      }

      return createCourse(payload);
    },
    onSuccess: (savedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", savedCourse.id] });
      toast.success("Draft saved successfully.");

      if (!isEditMode) {
        navigate(`/instructor/edit/${savedCourse.id}`, { replace: true });
      }
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "Invalid form") return;
      toast.error(error instanceof Error ? error.message : "Unable to save draft.");
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload) throw new Error("Invalid form");

      const savedCourse =
        isEditMode && id ? await updateCourseById(id, payload) : await createCourse(payload);
      return submitCourseForReview(savedCourse.id);
    },
    onSuccess: (submittedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", submittedCourse.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Course sent to admin for publish approval.");
      navigate("/instructor/courses");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "Invalid form") return;
      toast.error(error instanceof Error ? error.message : "Unable to submit course.");
    },
  });

  const requestUnpublishMutation = useMutation({
    mutationFn: () => requestCourseUnpublish(id || ""),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", updatedCourse.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Unpublish request sent to admin.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to request unpublish.");
    },
  });

  if (isEditMode && isCourseLoading) {
    return <div className="container py-16 text-center text-muted-foreground">Loading course...</div>;
  }

  if (isEditMode && (isCourseError || !course)) {
    return <div className="container py-16 text-center text-muted-foreground">Course not found.</div>;
  }

  return (
    <AnimatedPage>
      <div className="container py-8 max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              {isEditMode ? "Edit Course" : "Create New Course"}
            </h1>
            <p className="text-muted-foreground">
              Save as draft while refining, then send to admin for approval.
            </p>
          </div>
          {course && (
            <div className="flex items-center gap-3">
              <Badge className={statusColors[course.status]}>
                {course.status.replace("_", " ")}
              </Badge>
              {course.status === "published" && (
                <Button
                  variant="outline"
                  onClick={() => requestUnpublishMutation.mutate()}
                  disabled={requestUnpublishMutation.isPending}
                >
                  {requestUnpublishMutation.isPending ? "Sending..." : "Request Unpublish"}
                </Button>
              )}
            </div>
          )}
        </div>

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
                  <Input
                    id="title"
                    placeholder="e.g., React Masterclass 2026"
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    placeholder="A concise summary shown near the title"
                    value={form.shortDescription}
                    onChange={(event) => updateForm("shortDescription", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What will students learn?"
                    rows={4}
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewVideoUrl">Course Preview Video URL</Label>
                  <Input
                    id="previewVideoUrl"
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or file URL"
                    value={form.previewVideoUrl}
                    onChange={(event) => updateForm("previewVideoUrl", event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. This appears in "Preview this course" on the course details page.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(value) => updateForm("category", value)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={form.level} onValueChange={(value: "beginner" | "intermediate" | "advanced") => updateForm("level", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                      <span className="text-sm text-muted-foreground">Free course</span>
                      <Switch
                        checked={isFreeCourse}
                        onCheckedChange={(checked) => {
                          setIsFreeCourse(checked);
                          updateForm("price", checked ? "0" : "");
                        }}
                      />
                    </div>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={isFreeCourse ? "0.00" : "49.99"}
                      value={isFreeCourse ? "0" : form.price}
                      disabled={isFreeCourse}
                      onChange={(event) => updateForm("price", event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail (URL or Upload)</Label>
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <Input
                      placeholder="https://example.com/thumbnail.jpg"
                      value={thumbnailUrlValue}
                      onChange={(event) => {
                        updateForm("thumbnail", event.target.value);
                        setThumbnailFileName("");
                      }}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        ref={thumbnailFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        onClick={() => thumbnailFileInputRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload Image
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {thumbnailFileName ? `Selected: ${thumbnailFileName}` : "PNG/JPG/WebP up to 5MB"}
                      </span>
                    </div>
                    <div className="aspect-video rounded-lg border border-border/70 bg-muted" style={{ background: thumbnailPreview }} />
                    <div className="text-xs text-muted-foreground">
                      You can paste a URL or upload an image file.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("curriculum")} className="gradient-primary border-0 text-primary-foreground">
                    Next: Curriculum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Drag and drop sections and lessons to reorder your curriculum.
              </p>
              {sections.map((section, sectionIndex) => (
                <Card
                  key={section.id}
                  className="shadow-card"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleSectionDrop(section.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        draggable
                        onDragStart={() => setDraggingSectionId(section.id)}
                        onDragEnd={() => setDraggingSectionId(null)}
                        className="cursor-grab text-muted-foreground active:cursor-grabbing"
                        aria-label={`Drag section ${sectionIndex + 1}`}
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <Input
                        value={section.title}
                        onChange={(event) => updateSection(section.id, event.target.value)}
                        placeholder={`Section ${sectionIndex + 1} Title`}
                        className="font-semibold"
                      />
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeSection(section.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={() => setDraggingLesson({ sectionId: section.id, lessonId: lesson.id })}
                        onDragEnd={() => setDraggingLesson(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleLessonDrop(section.id, lesson.id)}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-xs text-muted-foreground mt-2.5 shrink-0">L{lessonIndex + 1}</span>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={lesson.title}
                            onChange={(event) => updateLesson(section.id, lesson.id, "title", event.target.value)}
                            placeholder="Lesson Title"
                            className="text-sm"
                          />
                          <Input
                            value={lesson.videoUrl}
                            onChange={(event) => updateLesson(section.id, lesson.id, "videoUrl", event.target.value)}
                            placeholder="Video URL (YouTube/Vimeo/file)"
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            min="1"
                            value={lesson.duration}
                            onChange={(event) => updateLesson(section.id, lesson.id, "duration", event.target.value)}
                            placeholder="Minutes"
                            className="text-sm"
                          />
                          <Textarea
                            value={lesson.description}
                            onChange={(event) => updateLesson(section.id, lesson.id, "description", event.target.value)}
                            placeholder="Lesson Description"
                            className="text-sm md:col-span-3"
                            rows={2}
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive h-9 w-9 shrink-0" onClick={() => removeLesson(section.id, lesson.id)}>
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>Back</Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => saveDraftMutation.mutate()}
                    disabled={saveDraftMutation.isPending || submitForApprovalMutation.isPending}
                  >
                    {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button
                    className="gradient-primary border-0 text-primary-foreground"
                    onClick={() => submitForApprovalMutation.mutate()}
                    disabled={submitForApprovalMutation.isPending || saveDraftMutation.isPending}
                  >
                    {submitForApprovalMutation.isPending ? "Sending..." : "Save & Send to Admin"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}
