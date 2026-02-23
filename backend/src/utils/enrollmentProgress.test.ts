import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canEnrollInCourseStatus,
  calculateProgressPercentage,
  getCourseLessonIds,
  toggleCompletedLesson,
} from './enrollmentProgress';

test('canEnrollInCourseStatus allows published and pending_unpublish only', () => {
  assert.equal(canEnrollInCourseStatus('published'), true);
  assert.equal(canEnrollInCourseStatus('pending_unpublish'), true);
  assert.equal(canEnrollInCourseStatus('draft'), false);
  assert.equal(canEnrollInCourseStatus('pending'), false);
  assert.equal(canEnrollInCourseStatus('rejected'), false);
});

test('getCourseLessonIds extracts lesson IDs from nested sections', () => {
  const ids = getCourseLessonIds([
    {
      lessons: [{ _id: 'l-1' }, { _id: 'l-2' }],
    },
    {
      lessons: [{ _id: 'l-3' }],
    },
  ]);

  assert.deepEqual(ids, ['l-1', 'l-2', 'l-3']);
});

test('toggleCompletedLesson adds and removes lesson IDs without duplicates', () => {
  const added = toggleCompletedLesson(['a', 'b'], 'c', true);
  assert.deepEqual(added.sort(), ['a', 'b', 'c']);

  const addDuplicate = toggleCompletedLesson(['a', 'b'], 'b', true);
  assert.deepEqual(addDuplicate.sort(), ['a', 'b']);

  const removed = toggleCompletedLesson(['a', 'b', 'c'], 'b', false);
  assert.deepEqual(removed.sort(), ['a', 'c']);
});

test('calculateProgressPercentage returns bounded integer percentage', () => {
  assert.equal(calculateProgressPercentage(0, 0), 0);
  assert.equal(calculateProgressPercentage(1, 4), 25);
  assert.equal(calculateProgressPercentage(3, 4), 75);
  assert.equal(calculateProgressPercentage(5, 4), 100);
});
