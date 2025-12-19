"use client";

import { useState, useMemo } from "react";
import { 
  userCourseSatisfactionData,
  getEnrichedUserCourses,
} from "@/data/predictionData";
import { coursesData } from "@/data/courseData";
import { SATISFACTION_GROUPS } from "@/types/prediction";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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
  const [selectedUserId, setSelectedUserId] = useState("");

  // Get all unique users
  const allUsers = useMemo(() => {
    const userSet = new Set(userCourseSatisfactionData.map(d => d.userId));
    return Array.from(userSet).sort();
  }, []);

  // Calculate overview statistics
  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    
    const groupCounts = {
      A: userCourseSatisfactionData.filter(d => d.group === 'A').length,
      B: userCourseSatisfactionData.filter(d => d.group === 'B').length,
      C: userCourseSatisfactionData.filter(d => d.group === 'C').length,
      D: userCourseSatisfactionData.filter(d => d.group === 'D').length,
      E: userCourseSatisfactionData.filter(d => d.group === 'E').length,
    };
    
    const totalEnrollments = userCourseSatisfactionData.length;
    const avgCoursesPerUser = (totalEnrollments / totalUsers).toFixed(1);
    
    return { totalUsers, groupCounts, totalEnrollments, avgCoursesPerUser };
  }, [allUsers]);

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

  // Get selected user's data with all courses
  const selectedUserData = useMemo(() => {
    if (!selectedUserId) return null;
    
    const courses = getEnrichedUserCourses(selectedUserId);
    
    // Guard against empty courses array
    if (courses.length === 0) {
      return {
        courses: [],
        avgSatisfaction: 0,
        groupCounts: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        fieldPreferences: {},
        recommendedFields: [],
        radarData: [
          { subject: 'Group A', value: 0, fullMark: 5 },
          { subject: 'Group B', value: 0, fullMark: 5 },
          { subject: 'Group C', value: 0, fullMark: 5 },
          { subject: 'Group D', value: 0, fullMark: 5 },
          { subject: 'Group E', value: 0, fullMark: 5 },
        ],
      };
    }
    
    // Calculate user statistics
    const avgSatisfaction = courses.reduce((sum, c) => sum + c.satisfactionPercentage, 0) / courses.length;
    const groupCounts = {
      A: courses.filter(c => c.group === 'A').length,
      B: courses.filter(c => c.group === 'B').length,
      C: courses.filter(c => c.group === 'C').length,
      D: courses.filter(c => c.group === 'D').length,
      E: courses.filter(c => c.group === 'E').length,
    };
    
    // Calculate field preferences based on satisfaction
    const fieldPreferences: Record<string, { count: number; avgSatisfaction: number }> = {};
    courses.forEach(course => {
      if (!fieldPreferences[course.field]) {
        fieldPreferences[course.field] = { count: 0, avgSatisfaction: 0 };
      }
      fieldPreferences[course.field].count += 1;
      fieldPreferences[course.field].avgSatisfaction += course.satisfactionPercentage;
    });
    
    // Calculate average satisfaction per field
    Object.keys(fieldPreferences).forEach(field => {
      fieldPreferences[field].avgSatisfaction = 
        fieldPreferences[field].avgSatisfaction / fieldPreferences[field].count;
    });
    
    // Get recommended fields based on high satisfaction
    const recommendedFields = Object.entries(fieldPreferences)
      .filter(([_, data]) => data.avgSatisfaction >= 60)
      .sort((a, b) => b[1].avgSatisfaction - a[1].avgSatisfaction)
      .map(([field, data]) => ({
        field,
        avgSatisfaction: Math.round(data.avgSatisfaction),
        coursesTaken: data.count
      }));
    
    // Use a fixed maximum value for better visualization
    const maxCoursesForRadar = Math.max(courses.length, 5);
    
    // Radar chart data for user performance
    const radarData = [
      { subject: 'Group A', value: groupCounts.A, fullMark: maxCoursesForRadar },
      { subject: 'Group B', value: groupCounts.B, fullMark: maxCoursesForRadar },
      { subject: 'Group C', value: groupCounts.C, fullMark: maxCoursesForRadar },
      { subject: 'Group D', value: groupCounts.D, fullMark: maxCoursesForRadar },
      { subject: 'Group E', value: groupCounts.E, fullMark: maxCoursesForRadar },
    ];
    
    return { courses, avgSatisfaction, groupCounts, fieldPreferences, recommendedFields, radarData };
  }, [selectedUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Hồ sơ Người học
          </h1>
          <p className="text-lg text-gray-600">
            Xem tổng quan và phân tích chi tiết về từng người học
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-sm text-gray-600 mb-2 font-medium">Tổng số người học</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-sm text-gray-600 mb-2 font-medium">Người học hài lòng (A+B)</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats.groupCounts.A + stats.groupCounts.B}
              </div>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-sm text-gray-600 mb-2 font-medium">Người học không hài lòng (C+D+E)</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {stats.groupCounts.C + stats.groupCounts.D + stats.groupCounts.E}
              </div>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-sm text-gray-600 mb-2 font-medium">Trung bình khóa học/người học</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                {stats.avgCoursesPerUser}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Pie Chart: User distribution by groups */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
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
                  outerRadius={100}
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
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
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

        {/* User Profile Lookup - Redesigned */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Hồ sơ Người học Chi tiết
          </h2>
          
          {/* User Selection */}
          <div className="mb-8">
            <label htmlFor="userSelect" className="block text-sm font-semibold text-gray-700 mb-3">
              Chọn người học để xem tất cả thống kê khóa học
            </label>
            <select
              id="userSelect"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white text-lg shadow-sm hover:border-purple-300"
            >
              <option value="">-- Chọn người học --</option>
              {allUsers.map((userId) => (
                <option key={userId} value={userId}>
                  {userId}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Details */}
          {selectedUserData && selectedUserId && (
            <div className="space-y-8 border-t-2 border-purple-100 pt-8">
              {/* User Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-md">
                  <div className="text-sm text-gray-600 mb-2 font-medium">ID Người học</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedUserId}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 shadow-md">
                  <div className="text-sm text-gray-600 mb-2 font-medium">Tổng số khóa học</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {selectedUserData.courses.length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-md">
                  <div className="text-sm text-gray-600 mb-2 font-medium">Mức độ hài lòng TB</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedUserData.avgSatisfaction.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Radar Chart - Performance across groups */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Phân tích Hiệu suất theo Groups
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={selectedUserData.radarData}>
                    <PolarGrid stroke="#d1d5db" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="Số khóa học" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* All Courses Table */}
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                  Tất cả các khóa học ({selectedUserData.courses.length} khóa)
                </h3>
                <div className="overflow-x-auto rounded-xl border-2 border-purple-100">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
                      <tr>
                        <th className="text-left py-4 px-6 font-bold text-gray-700">#</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700">Khóa học</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700">Lĩnh vực</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700">Mức độ hài lòng</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700">Phân loại</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {selectedUserData.courses.map((course, index) => (
                        <tr 
                          key={course.courseId} 
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-colors"
                        >
                          <td className="py-4 px-6 text-gray-600 font-medium">{index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-800">{course.courseName}</div>
                            <div className="text-xs text-gray-500">{course.courseId}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {course.field}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-3 max-w-[150px]">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    course.satisfactionPercentage >= 80 ? 'bg-green-500' :
                                    course.satisfactionPercentage >= 60 ? 'bg-blue-500' :
                                    course.satisfactionPercentage >= 40 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${course.satisfactionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-700">
                                {course.satisfactionPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                              course.group === 'A' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                              course.group === 'B' ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white' :
                              course.group === 'C' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                              course.group === 'D' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' :
                              'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                            }`}>
                              {course.group} - {SATISFACTION_GROUPS[course.group].label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics Cards */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 shadow-md">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Group A</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {selectedUserData.groupCounts.A}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200 shadow-md">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Group B</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {selectedUserData.groupCounts.B}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border-2 border-yellow-200 shadow-md">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Group C</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      {selectedUserData.groupCounts.C}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200 shadow-md">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Group D</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {selectedUserData.groupCounts.D}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-200 shadow-md">
                    <div className="text-xs text-gray-600 mb-1 font-medium">Group E</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {selectedUserData.groupCounts.E}
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Preferences and Recommendations */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  🎯 Sở thích Lĩnh vực & Gợi ý Khóa học
                </h3>
                
                {selectedUserData.recommendedFields.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Lĩnh vực phù hợp (Mức độ hài lòng ≥ 60%):</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedUserData.recommendedFields.map((rec, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-800">{rec.field}</span>
                              <span className="text-green-600 font-bold">{rec.avgSatisfaction}%</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {rec.coursesTaken} khóa học đã học
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-3">💡 Gợi ý khóa học mới:</h4>
                      <div className="space-y-2">
                        {selectedUserData.recommendedFields.slice(0, 2).flatMap(rec => {
                          // Get courses in this field that the user hasn't taken
                          const takenCourseIds = new Set(selectedUserData.courses.map(c => c.courseId));
                          const availableCourses = coursesData
                            .filter(c => c.field === rec.field && !takenCourseIds.has(c.courseId))
                            .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
                            .slice(0, 2);
                          
                          return availableCourses.map((course, idx) => (
                            <div key={`${rec.field}-${idx}`} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                              <span className="text-green-600 mr-2">→</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">{course.courseName}</div>
                                <div className="text-xs text-gray-600">{course.description}</div>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-green-200 text-green-700 rounded">
                                    {course.field}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {course.totalStudentsEnrolled.toLocaleString()} học viên
                                  </span>
                                </div>
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Chưa đủ dữ liệu để đưa ra gợi ý.</p>
                )}
              </div>
            </div>
          )}

          {!selectedUserId && (
            <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-100">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-gray-500 text-lg">Vui lòng chọn người học để xem hồ sơ chi tiết và thống kê tất cả các khóa học</p>
            </div>
          )}
        </div>

        {/* Predictive Model Ideas Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 mt-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Ý tưởng Mô hình Dự đoán cho Người học
          </h2>
          
          <div className="space-y-6">
            {/* High-level Objectives */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Mục tiêu Cao cấp
              </h3>
              <div className="ml-11 space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 Dự đoán Mức độ Hài lòng Cá nhân hóa</h4>
                  <p className="text-gray-600">
                    Phát triển mô hình dự đoán mức độ hài lòng của từng người học dựa trên lịch sử học tập, 
                    hành vi tương tác, và đặc điểm cá nhân để cung cấp khuyến nghị phù hợp.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">📊 Phân tích Xu hướng Học tập</h4>
                  <p className="text-gray-600">
                    Xác định các pattern trong hành vi học tập để dự đoán khả năng hoàn thành khóa học 
                    và mức độ tương tác trong tương lai.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">🔍 Phát hiện Học viên Có Nguy cơ</h4>
                  <p className="text-gray-600">
                    Nhận diện sớm những học viên có nguy cơ bỏ học hoặc không hài lòng để kịp thời 
                    can thiệp và hỗ trợ.
                  </p>
                </div>
              </div>
            </div>

            {/* Feasible Methods */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Phương pháp Khả thi
              </h3>
              <div className="ml-11 space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">🤖 Machine Learning Collaborative Filtering</h4>
                  <p className="text-gray-600 mb-2">
                    Sử dụng kỹ thuật collaborative filtering để dự đoán mức độ hài lòng dựa trên 
                    hành vi của những người học tương tự.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                    <li>User-based collaborative filtering: Tìm người học có pattern tương tự</li>
                    <li>Item-based collaborative filtering: Phân tích mối quan hệ giữa các khóa học</li>
                    <li>Matrix factorization: Giảm chiều dữ liệu để tìm latent factors</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">📈 Time Series Analysis</h4>
                  <p className="text-gray-600 mb-2">
                    Phân tích chuỗi thời gian để dự đoán xu hướng học tập và mức độ tương tác trong tương lai.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                    <li>LSTM/GRU networks cho sequential pattern learning</li>
                    <li>ARIMA models cho short-term predictions</li>
                    <li>Prophet cho long-term trend forecasting</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">🌐 Graph Neural Networks</h4>
                  <p className="text-gray-600 mb-2">
                    Mở rộng phương pháp Node2Vec hiện tại với Graph Neural Networks để học representation tốt hơn.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                    <li>GraphSAGE: Học node embeddings từ neighborhood aggregation</li>
                    <li>GAT (Graph Attention Networks): Sử dụng attention mechanism</li>
                    <li>Heterogeneous graph learning: Kết hợp user-course-video graph</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 Deep Learning Ensemble</h4>
                  <p className="text-gray-600 mb-2">
                    Kết hợp nhiều mô hình deep learning để cải thiện độ chính xác và robustness.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                    <li>Stacking: Kết hợp CNN (video features) + RNN (sequential behavior) + MLP (tabular data)</li>
                    <li>Boosting: XGBoost/LightGBM cho structured data</li>
                    <li>Voting: Ensemble của multiple models với weighted voting</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">💡 Feature Engineering Nâng cao</h4>
                  <p className="text-gray-600 mb-2">
                    Tạo các đặc trưng mới từ dữ liệu thô để cải thiện hiệu suất mô hình.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                    <li>Engagement score: Tính toán từ video watch time, exercise attempts, forum participation</li>
                    <li>Learning velocity: Tốc độ hoàn thành các module so với baseline</li>
                    <li>Consistency index: Đo lường sự đều đặn trong việc học</li>
                    <li>Difficulty adaptation: Khả năng thích nghi với độ khó của bài tập</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                Lộ trình Triển khai
              </h3>
              <div className="ml-11 space-y-2">
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">Phase 1:</span>
                  <p className="text-gray-600">Xây dựng baseline model với Random Forest và logistic regression</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">Phase 2:</span>
                  <p className="text-gray-600">Thử nghiệm advanced feature engineering và Graph Neural Networks</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">Phase 3:</span>
                  <p className="text-gray-600">Triển khai deep learning ensemble và time series analysis</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">Phase 4:</span>
                  <p className="text-gray-600">A/B testing và continuous improvement dựa trên feedback thực tế</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
