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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { coursesData } from "@/data/courseData";

// Calculate statistics from course_resource.csv
const totalCourses = coursesData.length;
const totalStudents = coursesData.reduce((sum, course) => sum + course.totalStudentsEnrolled, 0);
const totalVideos = coursesData.reduce((sum, course) => sum + course.totalVideos, 0);
const totalExercises = coursesData.reduce((sum, course) => sum + course.totalExercises, 0);
const avgVideosPerCourse = Math.round(totalVideos / totalCourses);
const avgExercisesPerCourse = Math.round(totalExercises / totalCourses);
const avgStudentsPerCourse = Math.round(totalStudents / totalCourses);
const coursesWithPrerequisites = coursesData.filter(c => c.isPrerequisites).length;
const coursesWithoutPrerequisites = totalCourses - coursesWithPrerequisites;
const prerequisitesPercentage = ((coursesWithPrerequisites / totalCourses) * 100).toFixed(1);

// Find course with most and least students
const courseWithMostStudents = [...coursesData].sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)[0];
const courseWithLeastStudents = [...coursesData].sort((a, b) => a.totalStudentsEnrolled - b.totalStudentsEnrolled)[0];

// Top 10 courses by students
const top10Courses = [...coursesData]
  .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
  .slice(0, 10);

// Top 10 courses by videos
const top10CoursesByVideos = [...coursesData]
  .sort((a, b) => b.totalVideos - a.totalVideos)
  .slice(0, 10)
  .map(course => ({
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

coursesData.forEach(course => {
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
const studentDistributionData = [...coursesData]
  .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
  .map((course, index) => ({
    index: index + 1,
    courseId: course.courseId,
    students: course.totalStudentsEnrolled
  }));

// Dữ liệu thống kê
const statsData = [
  { title: "Tổng số khóa học", value: totalCourses.toString(), change: "+15.03%", trend: "up", color: "blue" },
  { title: "Tổng số học viên", value: totalStudents.toLocaleString(), change: "+11.01%", trend: "up", color: "green" },
  { title: "Trung bình videos/khóa học", value: avgVideosPerCourse.toString(), change: "+6.08%", trend: "up", color: "orange" },
  { title: "Trung bình exercises/khóa học", value: avgExercisesPerCourse.toString(), change: "+8.12%", trend: "up", color: "purple" },
];

// Additional stats cards
const additionalStatsData = [
  { title: "Tổng số videos", value: totalVideos.toLocaleString(), color: "cyan" },
  { title: "Tổng số exercises", value: totalExercises.toLocaleString(), color: "indigo" },
  { title: "Khóa học nhiều học viên nhất", value: `${courseWithMostStudents.courseId} (${courseWithMostStudents.totalStudentsEnrolled.toLocaleString()})`, color: "pink" },
  { title: "Tỷ lệ khóa học có điều kiện", value: `${prerequisitesPercentage}%`, color: "teal" },
];

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
  { name: "Có yêu cầu", value: coursesWithPrerequisites, color: "#3b82f6" },
  { name: "Không yêu cầu", value: coursesWithoutPrerequisites, color: "#10b981" },
];

// Dữ liệu phân phối kết quả (from previous data)
const resultDistributionData = [
  { name: "Group E", value: 53.9, color: "#ff6b9d" },
  { name: "Group D", value: 18.9, color: "#ffa940" },
  { name: "Group C", value: 10.7, color: "#13c2c2" },
  { name: "Group B", value: 11.1, color: "#52c41a" },
  { name: "Group A", value: 5.7, color: "#1890ff" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 space-x-2">
        <span>Welcome</span>
        <span>→</span>
        <span className="text-blue-600 font-medium">Dashboard</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
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

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {additionalStatsData.map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
            <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
            <div className="flex items-end justify-between">
              <h3 className={stat.title === "Khóa học nhiều học viên nhất" ? "text-xl font-bold text-gray-800" : "text-3xl font-bold text-gray-800"}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Xu hướng học viên */}
        <div className="lg:col-span-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Xu hướng học viên</h2>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-600">2019</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span className="text-gray-600">2020</span>
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
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Bảng xếp hạng khóa học</h2>
            <button className="text-gray-400 hover:text-gray-600">
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
                <div className="w-8 text-gray-600">{index + 1}</div>
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
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tỷ lệ khóa học có/không có prerequisites */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Phân bố yêu cầu điều kiện</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={prerequisitesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
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
          <div className="mt-4">
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

        {/* Phân phối kết quả học tập */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Phân phối kết quả học tập
            </h2>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resultDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
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
          <div className="mt-4">
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
      </div>

      {/* New Charts Row - Top 10 Videos & Exercise Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Courses by Videos */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Top 10 khóa học theo số lượng video</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={top10CoursesByVideos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="courseId" type="category" width={100} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="videos" fill="#3b82f6" name="Số lượng video" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Distribution */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Phân bố số lượng exercises</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={exerciseDistributionData}>
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
              <Bar dataKey="count" fill="#10b981" name="Số khóa học" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Distribution Area Chart */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Phân bố học viên theo khóa học</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={studentDistributionData}>
            <defs>
              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
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
            <Area type="monotone" dataKey="students" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStudents)" name="students" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics Table */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Thống kê tổng quan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Trung bình videos/khóa học</p>
            <p className="text-2xl font-bold text-blue-600">{avgVideosPerCourse}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Trung bình exercises/khóa học</p>
            <p className="text-2xl font-bold text-green-600">{avgExercisesPerCourse}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Trung bình học viên/khóa học</p>
            <p className="text-2xl font-bold text-orange-600">{avgStudentsPerCourse.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Khóa học nhiều học viên nhất</p>
            <p className="text-lg font-bold text-purple-600">{courseWithMostStudents.courseId}</p>
            <p className="text-sm text-gray-500">{courseWithMostStudents.totalStudentsEnrolled.toLocaleString()} học viên</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Khóa học ít học viên nhất</p>
            <p className="text-lg font-bold text-pink-600">{courseWithLeastStudents.courseId}</p>
            <p className="text-sm text-gray-500">{courseWithLeastStudents.totalStudentsEnrolled.toLocaleString()} học viên</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Tổng số khóa học</p>
            <p className="text-2xl font-bold text-cyan-600">{totalCourses}</p>
            <p className="text-sm text-gray-500">{prerequisitesPercentage}% có điều kiện</p>
          </div>
        </div>
      </div>
    </div>
  );
}