"use client";

import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CourseInfo } from "@/types/prediction";
import { CourseStatsResponse } from "@/types/api";

interface DashboardClientProps {
  stats: CourseStatsResponse;
  allCourses: CourseInfo[];
}

// Gradient mappings for stat cards
const STAT_CARD_GRADIENTS = {
  cyan: 'from-cyan-100 to-blue-100',
  indigo: 'from-indigo-100 to-purple-100',
  pink: 'from-pink-100 to-rose-100',
  teal: 'from-teal-100 to-emerald-100',
} as const;

const STAT_CARD_TEXT_GRADIENTS = {
  cyan: 'from-cyan-600 to-blue-600',
  indigo: 'from-indigo-600 to-purple-600',
  pink: 'from-pink-600 to-rose-600',
  teal: 'from-teal-600 to-emerald-600',
} as const;

export default function DashboardClient({ stats, allCourses }: DashboardClientProps) {
  // Calculate derived statistics
  const totalCourses = stats.totalCourses;
  const totalStudents = stats.totalStudents;
  const avgVideosPerCourse = stats.avgVideosPerCourse;
  const avgExercisesPerCourse = stats.avgExercisesPerCourse;
  
  const totalVideos = allCourses.reduce((sum, course) => sum + course.totalVideos, 0);
  const totalExercises = allCourses.reduce((sum, course) => sum + course.totalExercises, 0);
  const avgStudentsPerCourse = Math.round(totalStudents / totalCourses);
  const prerequisitesPercentage = ((stats.coursesWithPrerequisites / totalCourses) * 100).toFixed(1);
  
  // Find course with most and least students
  const courseWithMostStudents = stats.topCoursesByStudents[0];
  const courseWithLeastStudents = [...allCourses].sort((a, b) => a.totalStudentsEnrolled - b.totalStudentsEnrolled)[0];
  
  // Top 10 courses
  const top10Courses = stats.topCoursesByStudents.slice(0, 10);
  
  // Top 10 courses by videos
  const top10CoursesByVideos = stats.topCoursesByVideos.slice(0, 10).map(course => ({
    courseId: course.courseId,
    videos: course.totalVideos
  }));
  
  // Exercise distribution buckets
  const exerciseBuckets = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "61-80": 0,
    "81-100": 0,
    ">100": 0
  };
  
  allCourses.forEach(course => {
    const exercises = course.totalExercises;
    if (exercises <= 20) exerciseBuckets["0-20"]++;
    else if (exercises <= 40) exerciseBuckets["21-40"]++;
    else if (exercises <= 60) exerciseBuckets["41-60"]++;
    else if (exercises <= 80) exerciseBuckets["61-80"]++;
    else if (exercises <= 100) exerciseBuckets["81-100"]++;
    else exerciseBuckets[">100"]++;
  });
  
  const exerciseDistributionData = Object.entries(exerciseBuckets).map(([range, count]) => ({
    range,
    count
  }));
  
  // Student distribution by course (sorted descending)
  const studentDistributionData = [...allCourses]
    .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
    .map((course, index) => ({
      index: index + 1,
      courseId: course.courseId,
      students: course.totalStudentsEnrolled
    }));
  
  // Dữ liệu thống kê - Focus on student satisfaction prediction
  const statsData = [
    { title: "Tổng số khóa học", value: totalCourses.toString(), change: "+15.03%", trend: "up", color: "blue" },
    { title: "Tổng số học viên", value: totalStudents.toLocaleString(), change: "+11.01%", trend: "up", color: "green" },
    { title: "Khóa học có điều kiện", value: `${prerequisitesPercentage}%`, change: "+3.2%", trend: "up", color: "orange" },
    { title: "Trung bình học viên/khóa học", value: avgStudentsPerCourse.toString(), change: "+5.4%", trend: "up", color: "purple" },
  ];
  
  // Additional stats cards - Focus on satisfaction prediction metrics
  const additionalStatsData = [
    { title: "Trung bình videos/khóa học", value: avgVideosPerCourse.toString(), color: "cyan", size: "large" },
    { title: "Trung bình exercises/khóa học", value: avgExercisesPerCourse.toString(), color: "indigo", size: "large" },
    { title: "Khóa học nhiều học viên nhất", value: `${courseWithMostStudents.courseName}`, subValue: `${courseWithMostStudents.totalStudentsEnrolled.toLocaleString()} học viên`, color: "pink", size: "small" },
    { title: "Tổng tài nguyên học tập", value: `${totalVideos + totalExercises} items`, subValue: `${totalVideos} videos + ${totalExercises} exercises`, color: "teal", size: "small" },
  ];
  
  // Field distribution statistics
  const fieldDistribution = allCourses.reduce((acc, course) => {
    acc[course.field] = (acc[course.field] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const fieldDistributionData = Object.entries(fieldDistribution)
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count);
  
  // Student enrollment by field
  const studentsByField = allCourses.reduce((acc, course) => {
    acc[course.field] = (acc[course.field] || 0) + course.totalStudentsEnrolled;
    return acc;
  }, {} as Record<string, number>);
  
  const studentsByFieldData = Object.entries(studentsByField)
    .map(([field, students]) => ({ field, students }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 8);
  
  // Dữ liệu xu hướng học viên (mock data - keeping for visualization)
  const trendData = [
    { month: "Jan", value2019: 0, value2020: 250 },
    { month: "Feb", value2019: 8500, value2020: 350 },
    { month: "Mar", value2019: 11000, value2020: 400 },
    { month: "Apr", value2019: 7500, value2020: 450 },
    { month: "May", value2019: 10500, value2020: 500 },
    { month: "Jun", value2019: 16000, value2020: 550 },
    { month: "Jul", value2019: 14500, value2020: 600 },
    { month: "Aug", value2019: 5000, value2020: 650 },
    { month: "Sep", value2019: 10500, value2020: 700 },
    { month: "Oct", value2019: 11000, value2020: 750 },
    { month: "Nov", value2019: 8500, value2020: 800 },
    { month: "Dec", value2019: 0, value2020: 850 },
  ];
  
  // Prerequisites distribution
  const prerequisitesData = [
    { name: "Có yêu cầu", value: stats.coursesWithPrerequisites, color: "#3b82f6" },
    { name: "Không yêu cầu", value: stats.coursesWithoutPrerequisites, color: "#10b981" },
  ];
  
  // Dữ liệu phân phối kết quả (from previous data)
  const resultDistributionData = [
    { name: "Group E", value: 53.9, color: "#ff6b9d" },
    { name: "Group D", value: 18.9, color: "#ffa940" },
    { name: "Group C", value: 10.7, color: "#13c2c2" },
    { name: "Group B", value: 11.1, color: "#52c41a" },
    { name: "Group A", value: 5.7, color: "#1890ff" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard - Dự đoán Mức độ Hài lòng Học viên
        </h1>
        <p className="text-gray-600">Phân tích dữ liệu và thống kê các yếu tố ảnh hưởng đến sự hài lòng của học viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <div key={idx} className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-purple-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="text-sm text-gray-600 mb-3 font-medium">{stat.title}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{stat.value}</h3>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    stat.trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}
                >
                  {stat.change} {stat.trend === "up" ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalStatsData.map((stat, idx) => (
          <div key={idx} className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${STAT_CARD_GRADIENTS[stat.color as keyof typeof STAT_CARD_GRADIENTS]} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="relative z-10">
              <p className="text-sm text-gray-600 mb-3 font-medium">{stat.title}</p>
              <h3 className={`${stat.size === "small" ? "text-lg" : "text-3xl"} font-bold bg-gradient-to-r ${STAT_CARD_TEXT_GRADIENTS[stat.color as keyof typeof STAT_CARD_TEXT_GRADIENTS]} bg-clip-text text-transparent`}>{stat.value}</h3>
              {(stat as any).subValue && (
                <p className="text-xs text-gray-500 mt-2">{(stat as any).subValue}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Xu hướng học viên */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Xu hướng học viên</h2>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-700 font-medium">2019</span>
              </div>
              <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span className="text-gray-700 font-medium">2020</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
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
              <Line
                type="monotone"
                dataKey="value2019"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={true}
                name="2019"
              />
              <Line
                type="monotone"
                dataKey="value2020"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={true}
                name="2020"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bảng xếp hạng */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Bảng xếp hạng khóa học</h2>
            <button className="text-gray-400 hover:text-purple-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-xs text-gray-500 pb-2 border-b-2 border-purple-100">
              <div className="w-8">#</div>
              <div className="flex-1 font-semibold">Khóa học</div>
              <div className="w-24 text-right font-semibold">Học viên</div>
            </div>
            {top10Courses.map((course, index) => (
              <div key={course.courseId} className="flex items-center text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 p-2 rounded-lg transition-colors">
                <div className="w-8">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{course.courseName}</div>
                  <div className="text-xs text-gray-500">
                    {course.field} • {course.totalVideos} videos • {course.totalExercises} exercises
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {course.totalStudentsEnrolled.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Distribution - Full Width */}
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Phân bố số lượng bài tập theo khóa học
          </h2>
          <p className="text-sm text-gray-600">Yếu tố quan trọng cho mức độ hài lòng</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={exerciseDistributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="range" stroke="#6b7280" label={{ value: 'Số lượng bài tập', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#6b7280" label={{ value: 'Số khóa học', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#10b981" name="Số khóa học" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Student Distribution Area Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Phân bố học viên theo khóa học</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={studentDistributionData}>
            <defs>
              <linearGradient id="dashboardStudentDistributionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="index" stroke="#6b7280" label={{ value: 'Thứ hạng khóa học', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === 'students') return [value.toLocaleString(), 'Học viên'];
                return [value, name];
              }}
            />
            <Area type="monotone" dataKey="students" stroke="#8b5cf6" fillOpacity={1} fill="url(#dashboardStudentDistributionGradient)" name="students" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Field-Based Statistics - New Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Phân bố Khóa học theo Lĩnh vực
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fieldDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="field" 
                stroke="#6b7280" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#6b7280" label={{ value: 'Số khóa học', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" name="Số khóa học" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Tổng: {fieldDistributionData.length} lĩnh vực khác nhau</p>
          </div>
        </div>

        {/* Students by Field */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Số Học viên theo Lĩnh vực (Top 8)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByFieldData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis 
                type="category" 
                dataKey="field" 
                stroke="#6b7280" 
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Bar dataKey="students" fill="#10b981" name="Học viên" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights for Student Satisfaction Prediction */}
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Yếu tố Ảnh hưởng đến Mức độ Hài lòng
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-600">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📚 Tài nguyên học tập</h3>
            <p className="text-gray-600 mb-3">
              Số lượng và chất lượng video bài giảng cùng bài tập thực hành là yếu tố quan trọng ảnh hưởng đến sự hài lòng.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trung bình videos:</span>
                <span className="font-bold text-blue-600">{avgVideosPerCourse} videos/khóa học</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trung bình bài tập:</span>
                <span className="font-bold text-blue-600">{avgExercisesPerCourse} exercises/khóa học</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-600">
            <h3 className="text-lg font-bold text-gray-800 mb-3">🎓 Độ khó và Điều kiện tiên quyết</h3>
            <p className="text-gray-600 mb-3">
              Khóa học có điều kiện tiên quyết thường có mức độ hài lòng cao hơn do phù hợp với trình độ học viên.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Khóa học có điều kiện:</span>
                <span className="font-bold text-green-600">{stats.coursesWithPrerequisites} khóa học</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tỷ lệ:</span>
                <span className="font-bold text-green-600">{prerequisitesPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-600">
            <h3 className="text-lg font-bold text-gray-800 mb-3">👥 Quy mô lớp học</h3>
            <p className="text-gray-600 mb-3">
              Khóa học có số lượng học viên vừa phải thường có tương tác tốt hơn và mức độ hài lòng cao hơn.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trung bình học viên:</span>
                <span className="font-bold text-orange-600">{avgStudentsPerCourse.toLocaleString()}/khóa học</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng học viên:</span>
                <span className="font-bold text-orange-600">{totalStudents.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-600">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Phân bố kết quả học tập</h3>
            <p className="text-gray-600 mb-3">
              Kết quả học tập có mối liên hệ chặt chẽ với mức độ hài lòng - học viên đạt kết quả tốt thường hài lòng hơn.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Group A (Rất hài lòng):</span>
                <span className="font-bold text-purple-600">5.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Group E (Không hài lòng):</span>
                <span className="font-bold text-purple-600">53.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
