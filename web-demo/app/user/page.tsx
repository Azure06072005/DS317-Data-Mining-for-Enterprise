"use client";

import { useState, useMemo } from "react";
import { coursesData } from "@/data/courseData";
import { 
  userCourseSatisfactionData,
  getUsersByCourseId,
  getUserCourses,
} from "@/data/predictionData";
import { SATISFACTION_GROUPS } from "@/types/prediction";
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

export default function UserPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Calculate overview statistics
  const stats = useMemo(() => {
    const allUsers = new Set(userCourseSatisfactionData.map(d => d.userId));
    const totalUsers = allUsers.size;
    
    const groupCounts = {
      A: userCourseSatisfactionData.filter(d => d.group === 'A').length,
      B: userCourseSatisfactionData.filter(d => d.group === 'B').length,
      C: userCourseSatisfactionData.filter(d => d.group === 'C').length,
      D: userCourseSatisfactionData.filter(d => d.group === 'D').length,
      E: userCourseSatisfactionData.filter(d => d.group === 'E').length,
    };
    
    return { totalUsers, groupCounts };
  }, []);

  // User distribution by satisfaction groups
  const groupDistribution = useMemo(() => {
    return [
      { name: 'Group A', value: stats.groupCounts.A, label: 'Rất hài lòng' },
      { name: 'Group B', value: stats.groupCounts.B, label: 'Hài lòng' },
      { name: 'Group C', value: stats.groupCounts.C, label: 'Trung bình' },
      { name: 'Group D', value: stats.groupCounts.D, label: 'Không hài lòng' },
      { name: 'Group E', value: stats.groupCounts.E, label: 'Rất không hài lòng' },
    ];
  }, [stats]);

  // Available users for selected course
  const availableUsers = useMemo(() => {
    if (!selectedCourseId) return [];
    return getUsersByCourseId(selectedCourseId);
  }, [selectedCourseId]);

  // Get selected user's courses
  const userCoursesData = useMemo(() => {
    if (!selectedUserId) return null;
    
    const courses = getUserCourses(selectedUserId);
    const selectedCourse = courses.find(c => c.courseId === selectedCourseId);
    const otherCourses = courses.filter(c => c.courseId !== selectedCourseId);
    
    return { selectedCourse, otherCourses, allCourses: courses };
  }, [selectedUserId, selectedCourseId]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
    setSelectedUserId(""); // Reset user selection when course changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thống kê Người học
          </h1>
          <p className="text-lg text-gray-600">
            Phân tích và thống kê chi tiết về người học
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Tổng số người học</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Người học hài lòng (A+B)</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.groupCounts.A + stats.groupCounts.B}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Người học không hài lòng (C+D+E)</div>
            <div className="text-3xl font-bold text-red-600">
              {stats.groupCounts.C + stats.groupCounts.D + stats.groupCounts.E}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart: User distribution by groups */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Phân bố Người học theo Groups
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={groupDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {groupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: User count by satisfaction level */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Số lượng Người học theo Mức độ Hài lòng
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng">
                  {groupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specific User Lookup */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tra cứu Người học Cụ thể
          </h2>
          
          {/* Course and User Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Course Selection */}
            <div>
              <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn khóa học
              </label>
              <select
                id="courseSelect"
                value={selectedCourseId}
                onChange={handleCourseChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">-- Chọn khóa học --</option>
                {coursesData.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseId}
                  </option>
                ))}
              </select>
            </div>

            {/* User Selection */}
            <div>
              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn người học
              </label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={!selectedCourseId}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedCourseId
                    ? "-- Chọn người học --"
                    : "-- Vui lòng chọn khóa học trước --"}
                </option>
                {availableUsers.map((userId) => (
                  <option key={userId} value={userId}>
                    {userId}
                  </option>
                ))}
              </select>
              {!selectedCourseId && (
                <p className="mt-2 text-sm text-gray-500">
                  Dropdown này chỉ hiển thị những user học khóa đã chọn
                </p>
              )}
            </div>
          </div>

          {/* User Details */}
          {userCoursesData && selectedUserId && (
            <div className="space-y-6 border-t pt-6">
              {/* Current Course Info */}
              {userCoursesData.selectedCourse && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-200">
                  <div className="text-sm text-gray-600 mb-2">
                    Người học: <span className="font-semibold">{selectedUserId}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Khóa học đang xem: <span className="font-semibold">{selectedCourseId}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div className={`text-5xl font-bold ${
                      userCoursesData.selectedCourse.group === 'A' ? 'text-green-600' :
                      userCoursesData.selectedCourse.group === 'B' ? 'text-blue-600' :
                      userCoursesData.selectedCourse.group === 'C' ? 'text-yellow-600' :
                      userCoursesData.selectedCourse.group === 'D' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {userCoursesData.selectedCourse.group}
                    </div>
                    <div className="text-lg text-gray-700">
                      {SATISFACTION_GROUPS[userCoursesData.selectedCourse.group as keyof typeof SATISFACTION_GROUPS].label}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Mức độ hài lòng: {userCoursesData.selectedCourse.satisfactionPercentage}%
                  </div>
                </div>
              )}

              {/* All Courses Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tất cả các khóa học của người học này
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Khóa học</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Mức độ hài lòng</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Phân loại</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Nhãn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCoursesData.allCourses.map((course) => (
                        <tr 
                          key={course.courseId} 
                          className={`border-b border-gray-200 ${
                            course.courseId === selectedCourseId ? 'bg-cyan-50' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-gray-800 font-medium">
                            {course.courseId}
                            {course.courseId === selectedCourseId && (
                              <span className="ml-2 text-xs bg-cyan-600 text-white px-2 py-1 rounded">
                                Đang xem
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            {course.satisfactionPercentage}%
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              course.group === 'A' ? 'bg-green-100 text-green-700' :
                              course.group === 'B' ? 'bg-blue-100 text-blue-700' :
                              course.group === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              course.group === 'D' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Group {course.group}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {SATISFACTION_GROUPS[course.group as keyof typeof SATISFACTION_GROUPS].label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">Group A</div>
                    <div className="text-lg font-bold text-green-600">
                      {userCoursesData.allCourses.filter(c => c.group === 'A').length}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-gray-600 mb-1">Group B</div>
                    <div className="text-lg font-bold text-blue-600">
                      {userCoursesData.allCourses.filter(c => c.group === 'B').length}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="text-xs text-gray-600 mb-1">Group C</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {userCoursesData.allCourses.filter(c => c.group === 'C').length}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-gray-600 mb-1">Group D</div>
                    <div className="text-lg font-bold text-orange-600">
                      {userCoursesData.allCourses.filter(c => c.group === 'D').length}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-xs text-gray-600 mb-1">Group E</div>
                    <div className="text-lg font-bold text-red-600">
                      {userCoursesData.allCourses.filter(c => c.group === 'E').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedUserId && (
            <div className="text-center py-12 text-gray-400">
              <p>Vui lòng chọn khóa học và người học để xem thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
