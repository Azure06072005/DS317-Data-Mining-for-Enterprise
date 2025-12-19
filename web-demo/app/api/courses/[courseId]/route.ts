import { NextRequest, NextResponse } from 'next/server';
import { streamCSV, getCSVPath } from '@/lib/csv-parser';
import { CourseCSVRow } from '@/types/api';
import { CourseInfo } from '@/types/prediction';

const COURSE_CSV_PATH = getCSVPath('course_resource_enhanced.csv');

/**
 * Convert CSV row to CourseInfo
 */
function csvRowToCourseInfo(row: CourseCSVRow): CourseInfo {
  return {
    courseId: row.course_id,
    courseName: row.course_name,
    description: row.description,
    field: row.field,
    additionalFields: row.additional_fields ? row.additional_fields.split(',').filter(f => f.trim()) : [],
    totalStudentsEnrolled: Number(row.total_students_enrolled),
    totalVideos: Number(row.total_videos),
    totalExercises: Number(row.total_exercises),
    numFields: Number(row.num_fields),
    isPrerequisites: Boolean(Number(row.is_prerequisites)),
  };
}

/**
 * GET /api/courses/[courseId] - Get specific course details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    let foundCourse: CourseInfo | null = null;

    // Stream through CSV to find the course
    await streamCSV<CourseCSVRow>(
      COURSE_CSV_PATH,
      (row) => {
        if (row.course_id === courseId) {
          foundCourse = csvRowToCourseInfo(row);
        }
      }
    );

    if (!foundCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(foundCourse);
  } catch (error) {
    console.error('Error in GET /api/courses/[courseId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
