import React from "react";
import { CourseStatsResponse, CoursesListResponse } from "@/types/api";
import { CourseInfo } from "@/types/prediction";
import DashboardClient from "./DashboardClient";
import { aggregateCSV, parseCSVWithPagination, getCSVPath } from "@/lib/csv-parser";
import { CourseCSVRow } from "@/types/api";
import { cache } from "@/lib/cache";

// Mark this page as dynamic
export const dynamic = 'force-dynamic';

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
 * Fetch course statistics directly from CSV
 */
async function fetchCourseStats(): Promise<CourseStatsResponse> {
  // Try to get from cache first
  const cacheKey = 'courses:stats';
  const cached = cache.get<CourseStatsResponse>(cacheKey);
  
  if (cached) {
    return cached;
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
      
      return {
        totalCourses: acc.totalCourses + 1,
        totalStudents: acc.totalStudents + course.totalStudentsEnrolled,
        totalVideos: acc.totalVideos + course.totalVideos,
        totalExercises: acc.totalExercises + course.totalExercises,
        coursesWithPrerequisites: acc.coursesWithPrerequisites + (course.isPrerequisites ? 1 : 0),
        courses: [...acc.courses, course],
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

  return response;
}

/**
 * Fetch all courses directly from CSV
 */
async function fetchAllCourses(): Promise<CourseInfo[]> {
  const allCourses: CourseInfo[] = [];
  
  await parseCSVWithPagination<CourseCSVRow>(
    COURSE_CSV_PATH,
    1,
    1000 // Get all at once since we're reading from local file
  ).then(result => {
    allCourses.push(...result.data.map(csvRowToCourseInfo));
  });
  
  return allCourses;
}

/**
 * Dashboard page - Server component that fetches data from API
 */
export default async function Dashboard() {
  try {
    // Fetch data from API
    const stats = await fetchCourseStats();
    const allCourses = await fetchAllCourses();
    
    return <DashboardClient stats={stats} allCourses={allCourses} />;
  } catch (error) {
    console.error('Error loading dashboard:', error);
    
    // Return error UI
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">
            Failed to load course data. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}