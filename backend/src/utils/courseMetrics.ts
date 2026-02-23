import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment';

type CourseIdLike = string | mongoose.Types.ObjectId | null | undefined;

export const getEnrollmentCountMap = async (
  rawCourseIds: CourseIdLike[],
): Promise<Map<string, number>> => {
  const normalizedIds = Array.from(
    new Set(
      rawCourseIds
        .filter(Boolean)
        .map((id) => String(id)),
    ),
  );

  if (normalizedIds.length === 0) {
    return new Map();
  }

  const courseIds = normalizedIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await Enrollment.aggregate([
    {
      $match: {
        courseId: { $in: courseIds },
      },
    },
    {
      $group: {
        _id: '$courseId',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map<string, number>();
  rows.forEach((row: any) => {
    countMap.set(String(row._id), Number(row.count) || 0);
  });

  return countMap;
};
