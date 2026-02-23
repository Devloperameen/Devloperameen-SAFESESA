export const ENROLLABLE_COURSE_STATUSES = new Set(['published', 'pending_unpublish']);

export const canEnrollInCourseStatus = (status: string): boolean =>
  ENROLLABLE_COURSE_STATUSES.has(status);

export const getCourseLessonIds = (
  sections: Array<{ lessons?: Array<{ _id?: { toString(): string } | string }> }> = [],
): string[] =>
  sections.flatMap((section) =>
    (section.lessons || [])
      .map((lesson) => {
        if (!lesson?._id) return '';
        return typeof lesson._id === 'string' ? lesson._id : lesson._id.toString();
      })
      .filter(Boolean),
  );

export const toggleCompletedLesson = (
  completedLessonIds: string[],
  lessonId: string,
  completed: boolean,
): string[] => {
  const normalizedId = String(lessonId);
  const ids = new Set(completedLessonIds.map(String));

  if (completed) {
    ids.add(normalizedId);
  } else {
    ids.delete(normalizedId);
  }

  return Array.from(ids);
};

export const calculateProgressPercentage = (
  completedLessonsCount: number,
  totalLessonsCount: number,
): number => {
  if (totalLessonsCount <= 0) return 0;
  const raw = Math.round((completedLessonsCount / totalLessonsCount) * 100);
  return Math.max(0, Math.min(100, raw));
};
