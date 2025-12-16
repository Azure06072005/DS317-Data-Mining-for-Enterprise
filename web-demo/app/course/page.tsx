"use client";

import { useState, useMemo } from "react";
import { coursesData } from "@/data/courseData";
import { getCourseStatistics } from "@/data/predictionData";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  E: '#ef4444',
};

export default function CoursePage() {
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Calculate overview statistics
  const stats = useMemo(() => {
    const totalCourses = coursesData.length;
    const totalStudents = coursesData.reduce((sum, c) => sum + c.totalStudentsEnrolled, 0);
    const avgVideos = Math.round(coursesData.reduce((sum, c) => sum + c.totalVideos, 0) / totalCourses);
    const avgExercises = Math.round(coursesData.reduce((sum, c) => sum + c.totalExercises, 0) / totalCourses);
    
    return { totalCourses, totalStudents, avgVideos, avgExercises };
  }, []);

  // Top 10 courses by student enrollment
  const top10Courses = useMemo(() => {
    return [...coursesData]
      .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
      .slice(0, 10)
      .map(c => ({
        name: c.courseId,
        students: c.totalStudentsEnrolled,
      }));
  }, []);

  // Prerequisites distribution
  const prerequisitesData = useMemo(() => {
    const withPrereq = coursesData.filter(c => c.isPrerequisites).length;
    const withoutPrereq = coursesData.length - withPrereq;
    return [
      { name: 'Có Prerequisites', value: withPrereq },
      { name: 'Không có Prerequisites', value: withoutPrereq },
    ];
  }, []);

  // Video count distribution by ranges
  const videoDistribution = useMemo(() => {
    const ranges = [
      { name: '0-25', min: 0, max: 25, count: 0 },
      { name: '26-50', min: 26, max: 50, count: 0 },
      { name: '51-75', min: 51, max: 75, count: 0 },
      { name: '76-100', min: 76, max: 100, count: 0 },
      { name: '100+', min: 101, max: Infinity, count: 0 },
    ];
    
    coursesData.forEach(course => {
      const range = ranges.find(r => course.totalVideos >= r.min && course.totalVideos <= r.max);
      if (range) range.count++;
    });
    
    return ranges;
  }, []);

  // Get selected course statistics
  const selectedCourseStats = useMemo(() => {
    if (!selectedCourseId) return null;
    
    const course = coursesData.find(c => c.courseId === selectedCourseId);
    const courseStats = getCourseStatistics(selectedCourseId);
    
    return course && courseStats ? { course, stats: courseStats } : null;
  }, [selectedCourseId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thống kê Khóa học
          </h1>
          <p className="text-lg text-gray-600">
            Phân tích và thống kê chi tiết về các khóa học
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Tổng số khóa học</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalCourses}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Tổng số học viên</div>
            <div className="text-3xl font-bold text-green-600">{stats.totalStudents.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">TB Videos/Khóa học</div>
            <div className="text-3xl font-bold text-purple-600">{stats.avgVideos}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">TB Exercises/Khóa học</div>
            <div className="text-3xl font-bold text-orange-600">{stats.avgExercises}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top 10 Courses */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top 10 Khóa học theo Số học viên
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10Courses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Số học viên" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Prerequisites Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Phân bố Prerequisites
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prerequisitesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prerequisitesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Video Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Phân bố Số lượng Videos theo Khoảng
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={videoDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Số khóa học" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specific Course Statistics */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thống kê Khóa học Cụ thể
          </h2>
          
          {/* Course Selection */}
          <div className="mb-6">
            <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn khóa học
            </label>
            <select
              id="courseSelect"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">-- Chọn khóa học --</option>
              {coursesData.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseId}
                </option>
              ))}
            </select>
          </div>

          {/* Course Details */}
          {selectedCourseStats && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Tổng số học viên</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCourseStats.course.totalStudentsEnrolled.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Số lượng Videos</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedCourseStats.course.totalVideos}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-gray-600 mb-1">Số lượng Exercises</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedCourseStats.course.totalExercises}
                  </div>
                </div>
              </div>

              {/* Satisfaction Distribution */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Phân bố Mức độ Hài lòng
                </h3>
                
                {/* Group Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Group A</div>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCourseStats.stats.groupCounts.A}
                    </div>
                    <div className="text-xs text-gray-500">Rất hài lòng</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Group B</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCourseStats.stats.groupCounts.B}
                    </div>
                    <div className="text-xs text-gray-500">Hài lòng</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-gray-600 mb-1">Group C</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedCourseStats.stats.groupCounts.C}
                    </div>
                    <div className="text-xs text-gray-500">Trung bình</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-sm text-gray-600 mb-1">Group D</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedCourseStats.stats.groupCounts.D}
                    </div>
                    <div className="text-xs text-gray-500">Không hài lòng</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-gray-600 mb-1">Group E</div>
                    <div className="text-2xl font-bold text-red-600">
                      {selectedCourseStats.stats.groupCounts.E}
                    </div>
                    <div className="text-xs text-gray-500">Rất không hài lòng</div>
                  </div>
                </div>

                {/* Distribution Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedCourseStats.stats.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng">
                      {selectedCourseStats.stats.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {!selectedCourseStats && selectedCourseId === "" && (
            <div className="text-center py-12 text-gray-400">
              <p>Vui lòng chọn một khóa học để xem thống kê chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
