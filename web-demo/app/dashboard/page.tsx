"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { coursesData } from "@/data/courseData";

// Calculate statistics from course_resource.csv
const totalCourses = coursesData.length;
const totalStudents = coursesData.reduce((sum, course) => sum + course.totalStudentsEnrolled, 0);
const avgVideosPerCourse = Math.round(
  coursesData.reduce((sum, course) => sum + course.totalVideos, 0) / totalCourses
);
const avgExercisesPerCourse = Math.round(
  coursesData.reduce((sum, course) => sum + course.totalExercises, 0) / totalCourses
);
const coursesWithPrerequisites = coursesData.filter(c => c.isPrerequisites).length;
const prerequisitesPercentage = Math.round((coursesWithPrerequisites / totalCourses) * 100);

// Format large numbers (e.g., 5.5M)
const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Format percentage for chart labels
const formatPercentage = (value: number, total: number): string => {
  return `${((value / total) * 100).toFixed(1)}%`;
};

// Top 10 courses by students
const top10Courses = [...coursesData]
  .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
  .slice(0, 10);

// Stats cards data with trend indicators
const statsData = [
  { title: "Tổng khóa học", value: totalCourses.toString(), change: "+15.03%", trend: "up", color: "blue" },
  { title: "Tổng học viên", value: formatLargeNumber(totalStudents), change: "+11.01%", trend: "up", color: "green" },
  { title: "Trung bình Videos", value: avgVideosPerCourse.toString(), change: "+6.08%", trend: "up", color: "orange" },
  { title: "Trung bình Exercises", value: avgExercisesPerCourse.toString(), change: "+8.12%", trend: "up", color: "purple" },
  { title: "Tỷ lệ Prerequisites", value: prerequisitesPercentage + "%", change: "+2.5%", trend: "up", color: "teal" },
];

// Enrollment trend data (mock data for 2019, 2020, 2021)
const trendData = [
  { month: "T1", year2019: 45000, year2020: 58000, year2021: 72000 },
  { month: "T2", year2019: 52000, year2020: 65000, year2021: 78000 },
  { month: "T3", year2019: 48000, year2020: 61000, year2021: 75000 },
  { month: "T4", year2019: 56000, year2020: 68000, year2021: 82000 },
  { month: "T5", year2019: 62000, year2020: 74000, year2021: 88000 },
  { month: "T6", year2019: 58000, year2020: 70000, year2021: 85000 },
  { month: "T7", year2019: 54000, year2020: 66000, year2021: 80000 },
  { month: "T8", year2019: 60000, year2020: 72000, year2021: 86000 },
  { month: "T9", year2019: 65000, year2020: 78000, year2021: 92000 },
  { month: "T10", year2019: 70000, year2020: 82000, year2021: 95000 },
  { month: "T11", year2019: 68000, year2020: 80000, year2021: 93000 },
  { month: "T12", year2019: 72000, year2020: 85000, year2021: 98000 },
];

// Distribution by num_fields - using lookup objects for clarity
const fieldLabels: Record<number, string> = {
  0: "0 lĩnh vực",
  1: "1 lĩnh vực",
  2: "2 lĩnh vực",
  3: "3 lĩnh vực"
};

const fieldColors: Record<number, string> = {
  0: "#0d9488",
  1: "#14b8a6",
  2: "#f97316",
  3: "#fb923c"
};

const numFieldsCount = [0, 1, 2, 3].map(field => ({
  name: fieldLabels[field],
  value: coursesData.filter(c => c.numFields === field).length,
  color: fieldColors[field]
}));

// Prerequisites distribution
const prerequisitesData = [
  { name: "Có Prerequisites", value: coursesWithPrerequisites, color: "#14b8a6" },
  { name: "Không Prerequisites", value: totalCourses - coursesWithPrerequisites, color: "#f97316" },
];

// Result distribution data (from original dashboard)
const resultDistributionData = [
  { name: "Group E", value: 53.9, color: "#ff6b9d" },
  { name: "Group D", value: 18.9, color: "#ffa940" },
  { name: "Group C", value: 10.7, color: "#13c2c2" },
  { name: "Group B", value: 11.1, color: "#52c41a" },
  { name: "Group A", value: 5.7, color: "#1890ff" },
];

// Student enrollment distribution by ranges - using single reduce for efficiency
const enrollmentRanges = coursesData.reduce((acc, course) => {
  const students = course.totalStudentsEnrolled;
  if (students < 10000) acc[0].count++;
  else if (students < 20000) acc[1].count++;
  else if (students < 50000) acc[2].count++;
  else acc[3].count++;
  return acc;
}, [
  { range: "< 10K", count: 0, color: "#0d9488" },
  { range: "10K-20K", count: 0, color: "#14b8a6" },
  { range: "20K-50K", count: 0, color: "#f97316" },
  { range: "> 50K", count: 0, color: "#fb923c" },
]);

// Grouped bar chart data - Reuse top10Courses and take first 5
const top5CoursesComparison = top10Courses.slice(0, 5).map(course => ({
  courseId: course.courseId,
  Videos: course.totalVideos,
  Exercises: course.totalExercises,
}));

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCourses / itemsPerPage);
  
  // Paginated course data
  const paginatedCourses = coursesData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 space-x-2">
        <span>Welcome</span>
        <span>→</span>
        <span className="text-blue-600 font-medium">Dashboard</span>
      </div>

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">DASHBOARD - DỰ ĐOÁN MỨC ĐỘ HÀI LÒNG HỌC VIÊN</h1>
      </div>

      {/* Stats Cards - 5 cards with gradients and trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsData.map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              <span
                className={`text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change} {stat.trend === "up" ? "↑" : "↓"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Line Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Enrollment Trends */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">XU HƯỚNG HỌC VIÊN THEO THỜI GIAN</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="year2019" stroke="#0d9488" strokeWidth={2} name="2019" />
              <Line type="monotone" dataKey="year2020" stroke="#14b8a6" strokeWidth={2} name="2020" />
              <Line type="monotone" dataKey="year2021" stroke="#f97316" strokeWidth={2} name="2021" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart - Distribution by num_fields */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">PHÂN BỐ KHÓA HỌC THEO LĨNH VỰC</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={numFieldsCount}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {numFieldsCount.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Top 10 Ranking List + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Courses - Ranking Style */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">TOP 10 KHÓA HỌC ĐÔNG NHẤT</h2>
            <button type="button" aria-label="Tùy chọn thêm" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-xs text-gray-500 pb-2 border-b">
              <div className="w-8">#</div>
              <div className="flex-1">Mã khóa học</div>
              <div className="w-24 text-right">Học viên</div>
            </div>
            {top10Courses.map((course, index) => (
              <div key={course.courseId} className="flex items-center text-sm">
                <div className="w-8 text-gray-600 font-medium">{index + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{course.courseId}</div>
                  <div className="text-xs text-gray-500">
                    Videos: {course.totalVideos}, Exercises: {course.totalExercises}
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {course.totalStudentsEnrolled.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart - Prerequisites Distribution */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">TỶ LỆ PREREQUISITES</h2>
            <button type="button" aria-label="Tùy chọn thêm" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={prerequisitesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {prerequisitesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-500">Tổng khóa học</div>
              <div className="text-2xl font-bold text-gray-800">{totalCourses}</div>
            </div>
            <div className="flex justify-center gap-6 text-xs">
              {prerequisitesData.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Bar Chart + Grouped Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Student Enrollment Distribution */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">PHÂN BỐ SỐ LƯỢNG HỌC VIÊN</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#0d9488" label={{ position: 'top' }}>
                {enrollmentRanges.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grouped Bar Chart - Videos vs Exercises */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">SO SÁNH VIDEOS VS EXERCISES</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top5CoursesComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="courseId" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="Videos" fill="#0d9488" />
              <Bar dataKey="Exercises" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Result Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Result Distribution - From original dashboard */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">PHÂN PHỐI KẾT QUẢ HỌC TẬP</h2>
            <button type="button" aria-label="Tùy chọn thêm" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={resultDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {resultDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-500">Mẫu dữ liệu</div>
              <div className="text-2xl font-bold text-gray-800">1000 học viên</div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {resultDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placeholder for future charts */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">THỐNG KÊ BỔ SUNG</h2>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">Khu vực dành cho biểu đồ bổ sung</p>
          </div>
        </div>
      </div>

      {/* Data Table with Pagination */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">BẢNG CHI TIẾT KHÓA HỌC</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Videos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exercises
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fields
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prerequisites
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCourses.map((course) => (
                <tr key={course.courseId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.courseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {course.totalStudentsEnrolled.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {course.totalVideos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {course.totalExercises}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {course.numFields}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.isPrerequisites 
                        ? 'bg-teal-100 text-teal-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {course.isPrerequisites ? 'Có' : 'Không'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCourses)} trong tổng {totalCourses} khóa học
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}