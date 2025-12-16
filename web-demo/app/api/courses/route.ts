import { NextRequest, NextResponse } from 'next/server';
import { parseCSVWithPagination, aggregateCSV, getCSVPath } from '@/lib/csv-parser';
import { cache } from '@/lib/cache';
import { CourseCSVRow, CourseStatsResponse, CoursesListResponse } from '@/types/api';
import { CourseInfo } from '@/types/prediction';

const COURSE_CSV_PATH = getCSVPath('course_resource.csv');
const CACHE_TTL = 300; // 5 minutes

/**
 * Convert CSV row to CourseInfo
 */
function csvRowToCourseInfo(row: CourseCSVRow): CourseInfo {
  return {
    courseId: row.course_id,
    totalStudentsEnrolled: Number(row.total_students_enrolled),
    totalVideos: Number(row.total_videos),
    totalExercises: Number(row.total_exercises),
    numFields: Number(row.num_fields),
    isPrerequisites: Boolean(Number(row.is_prerequisites)),
  };
}

/**
 * GET /api/courses - List courses with pagination
 * GET /api/courses?stats=true - Get course statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isStats = searchParams.get('stats') === 'true';

    if (isStats) {
      return await getCoursesStats();
    }

    return await getCoursesList(searchParams);
  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get paginated list of courses
 */
async function getCoursesList(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters' },
      { status: 400 }
    );
  }

  const result = await parseCSVWithPagination<CourseCSVRow>(
    COURSE_CSV_PATH,
    page,
    limit
  );

  const response: CoursesListResponse = {
    data: result.data.map(csvRowToCourseInfo),
    pagination: result.pagination,
  };

  return NextResponse.json(response);
}

/**
 * Get aggregated course statistics
 */
async function getCoursesStats() {
  // Try to get from cache first
  const cacheKey = 'courses:stats';
  const cached = cache.get<CourseStatsResponse>(cacheKey);
  
  if (cached) {
    return NextResponse.json(cached);
  }

  // Aggregate statistics from CSV
  const stats = await aggregateCSV<CourseCSVRow, {
    totalCourses: number;
    totalStudents: number;
    totalVideos: number;
    totalExercises: number;
    coursesWithPrerequisites: number;
    courses: CourseInfo[];
  }>(
    COURSE_CSV_PATH,
    (acc, row) => {
      const course = csvRowToCourseInfo(row);
      
      acc.courses.push(course); // Use push instead of spread for O(n) performance
      
      return {
        totalCourses: acc.totalCourses + 1,
        totalStudents: acc.totalStudents + course.totalStudentsEnrolled,
        totalVideos: acc.totalVideos + course.totalVideos,
        totalExercises: acc.totalExercises + course.totalExercises,
        coursesWithPrerequisites: acc.coursesWithPrerequisites + (course.isPrerequisites ? 1 : 0),
        courses: acc.courses,
      };
    },
    {
      totalCourses: 0,
      totalStudents: 0,
      totalVideos: 0,
      totalExercises: 0,
      coursesWithPrerequisites: 0,
      courses: [],
    }
  );

  const avgVideosPerCourse = Math.round(stats.totalVideos / stats.totalCourses);
  const avgExercisesPerCourse = Math.round(stats.totalExercises / stats.totalCourses);
  
  // Get top courses
  const topCoursesByStudents = [...stats.courses]
    .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
    .slice(0, 10);
  
  const topCoursesByVideos = [...stats.courses]
    .sort((a, b) => b.totalVideos - a.totalVideos)
    .slice(0, 10);

  const response: CourseStatsResponse = {
    totalCourses: stats.totalCourses,
    totalStudents: stats.totalStudents,
    avgVideosPerCourse,
    avgExercisesPerCourse,
    coursesWithPrerequisites: stats.coursesWithPrerequisites,
    coursesWithoutPrerequisites: stats.totalCourses - stats.coursesWithPrerequisites,
    topCoursesByStudents,
    topCoursesByVideos,
  };

  // Cache the result
  cache.set(cacheKey, response, CACHE_TTL);

  return NextResponse.json(response);
}
