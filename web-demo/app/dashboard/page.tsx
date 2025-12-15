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

// Calculate KPI metrics
const courseCompletionRate = 78.88;
const studentAttendanceRate = 88.42;
const retentionRate = 87.52;

// Dữ liệu xu hướng học viên theo thời gian (2019-2023)
const trendData = [
  { year: "2019", students: 450 },
  { year: "2020", students: 680 },
  { year: "2021", students: 820 },
  { year: "2022", students: 950 },
  { year: "2023", students: 1100 },
];

// Phân bố khóa học theo num_fields (Donut Chart)
const numFieldsData = [
  { name: "0 lĩnh vực", value: 227, color: "#0d9488" },
  { name: "1 lĩnh vực", value: 68, color: "#14b8a6" },
  { name: "2 lĩnh vực", value: 12, color: "#2dd4bf" },
  { name: "3 lĩnh vực", value: 2, color: "#5eead4" },
];

// Phân bố theo nhóm hài lòng (Pie Chart)
const satisfactionGroupData = [
  { name: "Nhóm A (Rất hài lòng)", value: 40, color: "#0d9488" },
  { name: "Nhóm B-E (Khác)", value: 60, color: "#d1d5db" },
];

// Phân bố theo nhóm Satisfaction (Bar Chart)
const satisfactionDistributionData = [
  { group: "Nhóm A", count: 590 },
  { group: "Nhóm B", count: 550 },
  { group: "Nhóm C", count: 541 },
  { group: "Nhóm D", count: 305 },
  { group: "Nhóm E", count: 150 },
];

// Phân bố theo quy mô khóa học (Horizontal Bar Chart)
const courseSizeData = [
  { size: ">50K học viên", courses: 15 },
  { size: "20K-50K", courses: 78 },
  { size: "10K-20K", courses: 89 },
  { size: "<10K", courses: 75 },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">
          EDUCATION DASHBOARD - DỰ ĐOÁN MỨC ĐỘ HÀI LÒNG HỌC VIÊN
        </h1>
      </div>

      {/* Hàng 1: 3 cột bằng nhau */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Xu hướng học viên theo thời gian */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4">
            Xu hướng học viên theo thời gian
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#6b7280" />
              <YAxis stroke="#6b7280" label={{ value: 'Học viên (K)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ fill: "#0d9488", r: 4 }}
                name="Học viên"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart - Phân bố khóa học theo lĩnh vực */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4">
            Phân bố khóa học theo lĩnh vực
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={numFieldsData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ value }) => value}
                labelLine={false}
              >
                {numFieldsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {numFieldsData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-sm mr-2"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-[#1e293b]">{item.value} khóa học</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart - Phân bố theo nhóm hài lòng */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4">
            Phân bố theo nhóm hài lòng
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={satisfactionGroupData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {satisfactionGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {satisfactionGroupData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-[#1e293b]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hàng 2: 2 cột (1/3 + 2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái (1/3) - KPI Cards dọc */}
        <div className="space-y-4">
          {/* KPI Card 1 */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-500 mb-2">Tỷ lệ hoàn thành khóa học</div>
            <div className="text-3xl font-bold text-[#0d9488]">{courseCompletionRate}%</div>
          </div>

          {/* KPI Card 2 */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-500 mb-2">Tỷ lệ tham gia học viên</div>
            <div className="text-3xl font-bold text-[#0d9488]">{studentAttendanceRate}%</div>
          </div>

          {/* KPI Card 3 */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-500 mb-2">Tỷ lệ giữ chân học viên</div>
            <div className="text-3xl font-bold text-[#0d9488]">{retentionRate}%</div>
          </div>

          {/* KPI Card 4 */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-500 mb-2">Trung bình Videos/Khóa học</div>
            <div className="text-3xl font-bold text-[#0d9488]">{avgVideosPerCourse}</div>
          </div>
        </div>

        {/* Cột phải (2/3) - 2 Charts xếp dọc */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bar Chart - Phân bố theo nhóm Satisfaction */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-[#1e293b] mb-4">
              Phân bố theo nhóm Satisfaction
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={satisfactionDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis type="category" dataKey="group" stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 8, 8, 0]} label={{ position: 'right' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Horizontal Bar Chart - Phân bố theo quy mô khóa học */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-[#1e293b] mb-4">
              Phân bố theo quy mô khóa học
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={courseSizeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" label={{ value: 'Số lượng khóa học', position: 'insideBottom', offset: -5 }} />
                <YAxis type="category" dataKey="size" stroke="#6b7280" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="courses" fill="#f97316" radius={[0, 8, 8, 0]} label={{ position: 'right' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}