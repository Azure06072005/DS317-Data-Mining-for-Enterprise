// Course data from course_resource.csv
import { CourseInfo } from '@/types/prediction';

export const coursesData: CourseInfo[] = [
  { courseId: 'C_680777', totalStudentsEnrolled: 14843, totalVideos: 19, totalExercises: 9, numFields: 1, isPrerequisites: false },
  { courseId: 'C_682515', totalStudentsEnrolled: 21069, totalVideos: 133, totalExercises: 44, numFields: 0, isPrerequisites: false },
  { courseId: 'C_696855', totalStudentsEnrolled: 14863, totalVideos: 161, totalExercises: 12, numFields: 0, isPrerequisites: false },
  { courseId: 'C_680958', totalStudentsEnrolled: 14268, totalVideos: 107, totalExercises: 70, numFields: 1, isPrerequisites: true },
  { courseId: 'C_680808', totalStudentsEnrolled: 10363, totalVideos: 79, totalExercises: 15, numFields: 1, isPrerequisites: false },
  { courseId: 'C_685664', totalStudentsEnrolled: 10059, totalVideos: 32, totalExercises: 24, numFields: 1, isPrerequisites: true },
  { courseId: 'C_680993', totalStudentsEnrolled: 10007, totalVideos: 80, totalExercises: 4, numFields: 0, isPrerequisites: true },
  { courseId: 'C_676996', totalStudentsEnrolled: 11350, totalVideos: 13, totalExercises: 13, numFields: 0, isPrerequisites: false },
  { courseId: 'C_676969', totalStudentsEnrolled: 11408, totalVideos: 83, totalExercises: 10, numFields: 1, isPrerequisites: true },
  { courseId: 'C_682195', totalStudentsEnrolled: 17662, totalVideos: 40, totalExercises: 9, numFields: 0, isPrerequisites: false },
  { courseId: 'C_682240', totalStudentsEnrolled: 13492, totalVideos: 92, totalExercises: 10, numFields: 0, isPrerequisites: false },
  { courseId: 'C_680823', totalStudentsEnrolled: 18634, totalVideos: 42, totalExercises: 17, numFields: 0, isPrerequisites: true },
  { courseId: 'C_676898', totalStudentsEnrolled: 13122, totalVideos: 57, totalExercises: 101, numFields: 1, isPrerequisites: true },
  { courseId: 'C_682360', totalStudentsEnrolled: 10447, totalVideos: 113, totalExercises: 58, numFields: 1, isPrerequisites: true },
  { courseId: 'C_682147', totalStudentsEnrolled: 14141, totalVideos: 50, totalExercises: 14, numFields: 0, isPrerequisites: true },
  { courseId: 'C_677020', totalStudentsEnrolled: 11948, totalVideos: 100, totalExercises: 11, numFields: 1, isPrerequisites: false },
  { courseId: 'C_677159', totalStudentsEnrolled: 14042, totalVideos: 53, totalExercises: 1, numFields: 1, isPrerequisites: false },
  { courseId: 'C_676656', totalStudentsEnrolled: 21003, totalVideos: 158, totalExercises: 16, numFields: 0, isPrerequisites: false },
  { courseId: 'C_674903', totalStudentsEnrolled: 48029, totalVideos: 109, totalExercises: 15, numFields: 1, isPrerequisites: true },
  { courseId: 'C_681711', totalStudentsEnrolled: 12952, totalVideos: 52, totalExercises: 98, numFields: 0, isPrerequisites: true },
  { courseId: 'C_696679', totalStudentsEnrolled: 41847, totalVideos: 258, totalExercises: 110, numFields: 1, isPrerequisites: false },
  { courseId: 'C_674920', totalStudentsEnrolled: 32466, totalVideos: 162, totalExercises: 24, numFields: 1, isPrerequisites: false },
  { courseId: 'C_680740', totalStudentsEnrolled: 13485, totalVideos: 51, totalExercises: 18, numFields: 0, isPrerequisites: false },
  { courseId: 'C_682193', totalStudentsEnrolled: 12072, totalVideos: 52, totalExercises: 77, numFields: 0, isPrerequisites: false },
  { courseId: 'C_682624', totalStudentsEnrolled: 10703, totalVideos: 147, totalExercises: 16, numFields: 1, isPrerequisites: false },
  { courseId: 'C_697188', totalStudentsEnrolled: 30312, totalVideos: 120, totalExercises: 7, numFields: 0, isPrerequisites: false },
  { courseId: 'C_697075', totalStudentsEnrolled: 15499, totalVideos: 133, totalExercises: 37, numFields: 0, isPrerequisites: true },
  { courseId: 'C_898310', totalStudentsEnrolled: 14147, totalVideos: 20, totalExercises: 18, numFields: 0, isPrerequisites: true },
  { courseId: 'C_707127', totalStudentsEnrolled: 14017, totalVideos: 69, totalExercises: 66, numFields: 0, isPrerequisites: true },
  { courseId: 'C_758221', totalStudentsEnrolled: 11065, totalVideos: 91, totalExercises: 8, numFields: 0, isPrerequisites: false },
];

export function getCourseById(courseId: string): CourseInfo | undefined {
  return coursesData.find(course => course.courseId === courseId);
}

export function getAllCourseIds(): string[] {
  return coursesData.map(course => course.courseId);
}
