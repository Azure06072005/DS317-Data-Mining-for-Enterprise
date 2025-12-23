import React from "react";
import { CourseStatsResponse } from "@/types/api";
import { CourseInfo } from "@/types/prediction";
import DashboardClient from "./DashboardClient";
import { coursesData } from "@/data/courseData";

export const dynamic = "force-dynamic";

function safeDiv(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return 0;
  return numerator / denominator;
}

function buildCourseStats(allCourses: CourseInfo[]): CourseStatsResponse {
  const totalCourses = allCourses.length;

  const totalStudents = allCourses.reduce((sum, c) => sum + (c.totalStudentsEnrolled ?? 0), 0);
  const totalVideos = allCourses.reduce((sum, c) => sum + (c.totalVideos ?? 0), 0);
  const totalExercises = allCourses.reduce((sum, c) => sum + (c.totalExercises ?? 0), 0);

  const coursesWithPrerequisites = allCourses.filter((c) => Boolean(c.isPrerequisites)).length;

  const avgVideosPerCourse = Math.round(safeDiv(totalVideos, totalCourses));
  const avgExercisesPerCourse = Math.round(safeDiv(totalExercises, totalCourses));

  const topCoursesByStudents = [...allCourses]
    .sort((a, b) => (b.totalStudentsEnrolled ?? 0) - (a.totalStudentsEnrolled ?? 0))
    .slice(0, 10);

  const topCoursesByVideos = [...allCourses]
    .sort((a, b) => (b.totalVideos ?? 0) - (a.totalVideos ?? 0))
    .slice(0, 10);

  return {
    totalCourses,
    totalStudents,
    avgVideosPerCourse,
    avgExercisesPerCourse,
    coursesWithPrerequisites,
    coursesWithoutPrerequisites: totalCourses - coursesWithPrerequisites,
    topCoursesByStudents,
    topCoursesByVideos,
  };
}

export default async function Dashboard() {
  try {
    // IMPORTANT: Do NOT parse CSV at runtime.
    // Parsing `course_resource_enhanced.csv` fails because the `schools` column contains JSON with quotes,
    // and your CSV parser is currently configured with quoting disabled.
    // We already have canonical TS data generated from that CSV.
    const allCourses = coursesData as unknown as CourseInfo[];
    const stats = buildCourseStats(allCourses);

    return <DashboardClient stats={stats} allCourses={allCourses} />;
  } catch (error) {
    console.error("Error loading dashboard:", error);

    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">Failed to load course data. Please try again later.</p>
        </div>
      </div>
    );
  }
}
