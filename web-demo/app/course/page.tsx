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
  const [selectedField, setSelectedField] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get all unique fields
  const allFields = useMemo(() => {
    const fieldSet = new Set(coursesData.map(c => c.field));
    return ["all", ...Array.from(fieldSet).sort()];
  }, []);

  // Filter courses by field and search term
  const filteredCourses = useMemo(() => {
    return coursesData.filter(course => {
      const matchesField = selectedField === "all" || course.field === selectedField;
      const matchesSearch = searchTerm === "" || 
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesField && matchesSearch;
    });
  }, [selectedField, searchTerm]);

  // Calculate overview statistics from filtered courses
  const stats = useMemo(() => {
    const totalCourses = filteredCourses.length;
    const totalStudents = filteredCourses.reduce((sum, c) => sum + c.totalStudentsEnrolled, 0);
    const avgVideos = totalCourses > 0 ? Math.round(filteredCourses.reduce((sum, c) => sum + c.totalVideos, 0) / totalCourses) : 0;
    const avgExercises = totalCourses > 0 ? Math.round(filteredCourses.reduce((sum, c) => sum + c.totalExercises, 0) / totalCourses) : 0;
    
    return { totalCourses, totalStudents, avgVideos, avgExercises };
  }, [filteredCourses]);

  // Field distribution
  const fieldDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredCourses.forEach(course => {
      dist[course.field] = (dist[course.field] || 0) + 1;
    });
    return Object.entries(dist).map(([field, count]) => ({ field, count })).sort((a, b) => b.count - a.count);
  }, [filteredCourses]);

  // Top 10 courses by student enrollment
  const top10Courses = useMemo(() => {
    return [...filteredCourses]
      .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
      .slice(0, 10)
      .map(c => ({
        name: c.courseName,
        courseId: c.courseId,
        students: c.totalStudentsEnrolled,
      }));
  }, [filteredCourses]);

  // Prerequisites distribution
  const prerequisitesData = useMemo(() => {
    const withPrereq = filteredCourses.filter(c => c.isPrerequisites).length;
    const withoutPrereq = filteredCourses.length - withPrereq;
    return [
      { name: 'Có Prerequisites', value: withPrereq },
      { name: 'Không có Prerequisites', value: withoutPrereq },
    ];
  }, [filteredCourses]);

  // Video count distribution by ranges
  const videoDistribution = useMemo(() => {
    const ranges = [
      { name: '0-25', min: 0, max: 25, count: 0 },
      { name: '26-50', min: 26, max: 50, count: 0 },
      { name: '51-75', min: 51, max: 75, count: 0 },
      { name: '76-100', min: 76, max: 100, count: 0 },
      { name: '100+', min: 101, max: Infinity, count: 0 },
    ];
    
    filteredCourses.forEach(course => {
      const range = ranges.find(r => course.totalVideos >= r.min && course.totalVideos <= r.max);
      if (range) range.count++;
    });
    
    return ranges;
  }, [filteredCourses]);

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Danh mục Khóa học
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá và phân tích chi tiết các khóa học theo lĩnh vực
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Filter */}
            <div>
              <label htmlFor="fieldFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo lĩnh vực
              </label>
              <select
                id="fieldFilter"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="all">Tất cả lĩnh vực ({coursesData.length} khóa học)</option>
                {allFields.filter(f => f !== "all").map((field) => {
                  const count = coursesData.filter(c => c.field === field).length;
                  return (
                    <option key={field} value={field}>
                      {field} ({count} khóa học)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="searchCourse" className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm khóa học
              </label>
              <input
                id="searchCourse"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên khóa học, mô tả hoặc mã..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            Hiển thị <span className="font-bold text-cyan-600">{stats.totalCourses}</span> khóa học
            {selectedField !== "all" && ` trong lĩnh vực ${selectedField}`}
            {searchTerm && ` khớp với "${searchTerm}"`}
          </div>
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
          {/* Field Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Phân bố Khóa học theo Lĩnh vực
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fieldDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="field" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Số khóa học" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Courses */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top 10 Khóa học theo Số học viên
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10Courses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                        <p className="font-semibold">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-600">ID: {payload[0].payload.courseId}</p>
                        <p className="text-sm text-blue-600">{payload[0].value?.toLocaleString()} học viên</p>
                      </div>
                    );
                  }
                  return null;
                }} />
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
              Chọn khóa học để xem chi tiết
            </label>
            <select
              id="courseSelect"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">-- Chọn khóa học --</option>
              {filteredCourses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName} ({course.field}) - {course.courseId}
                </option>
              ))}
            </select>
          </div>

          {/* Course Details */}
          {selectedCourseStats && (
            <div className="space-y-6">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedCourseStats.course.courseName}</h3>
                <p className="text-gray-600 mb-3">{selectedCourseStats.course.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                    {selectedCourseStats.course.field}
                  </span>
                  {selectedCourseStats.course.additionalFields.map((field, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {field}
                    </span>
                  ))}
                  {selectedCourseStats.course.isPrerequisites && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✓ Có Prerequisites
                    </span>
                  )}
                </div>
              </div>

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
