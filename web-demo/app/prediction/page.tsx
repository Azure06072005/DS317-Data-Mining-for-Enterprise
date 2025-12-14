"use client";

import { useState } from "react";
import { coursesData } from "@/data/courseData";
import { SATISFACTION_GROUPS } from "@/types/prediction";
import {
  getUsersByCourseId,
  getUserCourseSatisfaction,
  getUserCourses,
  getCourseStatistics
} from "@/data/predictionData";

type PredictionType = "course" | "user";

interface CoursePredictionResult {
  type: "course";
  courseId: string;
  totalUsers: number;
  avgSatisfaction: number;
  overallGroup: 'A' | 'B' | 'C' | 'D' | 'E';
  groupCounts: Record<'A' | 'B' | 'C' | 'D' | 'E', number>;
  distribution: Array<{ name: string; value: number; percentage: number }>;
}

interface UserPredictionResult {
  type: "user";
  userId: string;
  courseId: string;
  satisfaction: {
    userId: string;
    courseId: string;
    satisfactionLabel: number;
    satisfactionPercentage: number;
    group: 'A' | 'B' | 'C' | 'D' | 'E';
  };
  otherCourses: Array<{
    userId: string;
    courseId: string;
    satisfactionLabel: number;
    satisfactionPercentage: number;
    group: 'A' | 'B' | 'C' | 'D' | 'E';
  }>;
}

type PredictionResult = CoursePredictionResult | UserPredictionResult;

export default function Prediction() {
  const [predictionType, setPredictionType] = useState<PredictionType>("course");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Get available users for selected course
  const availableUsers = selectedCourseId ? getUsersByCourseId(selectedCourseId) : [];

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourseId = e.target.value;
    setSelectedCourseId(newCourseId);
    setSelectedUserId(""); // Reset user selection when course changes
    setPrediction(null);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
    setPrediction(null);
  };

  const handlePredictionTypeChange = (type: PredictionType) => {
    setPredictionType(type);
    setSelectedCourseId("");
    setSelectedUserId("");
    setPrediction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (predictionType === "course") {
      // Predict by course - show overall satisfaction
      const stats = getCourseStatistics(selectedCourseId);
      if (stats) {
        setPrediction({
          type: "course",
          courseId: selectedCourseId,
          ...stats
        });
      }
    } else {
      // Predict by user - show user's satisfaction with selected course + other courses
      const userCourseSat = getUserCourseSatisfaction(selectedUserId, selectedCourseId);
      const otherCourses = getUserCourses(selectedUserId).filter(c => c.courseId !== selectedCourseId);
      
      if (userCourseSat) {
        setPrediction({
          type: "user",
          userId: selectedUserId,
          courseId: selectedCourseId,
          satisfaction: userCourseSat,
          otherCourses
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dự đoán Mức độ Hài lòng
          </h1>
          <p className="text-lg text-gray-600">
            Chọn loại dự đoán và nhập thông tin để xem kết quả
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thông tin đầu vào
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Prediction Type Selection */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Chọn loại dự đoán
                </h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handlePredictionTypeChange("course")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                      predictionType === "course"
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Theo Khóa học
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePredictionTypeChange("user")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                      predictionType === "user"
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Theo Người học
                  </button>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Khóa học
                </label>
                <select
                  id="courseId"
                  value={selectedCourseId}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white"
                  required
                >
                  <option value="">-- Chọn khóa học --</option>
                  {coursesData.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseId}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Selection - Only shown for "user" type and after course is selected */}
              {predictionType === "user" && (
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    Người học
                  </label>
                  <select
                    id="userId"
                    value={selectedUserId}
                    onChange={handleUserChange}
                    disabled={!selectedCourseId}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
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
                      Dropdown này chỉ hiện những user học khóa đã chọn
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedCourseId || (predictionType === "user" && !selectedUserId)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Dự đoán
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Kết quả dự đoán
            </h2>
            
            {prediction ? (
              <div className="space-y-6">
                {prediction.type === "course" ? (
                  /* Course Prediction Results */
                  <>
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-200">
                      <div className="text-sm text-gray-600 mb-2">Khóa học: {prediction.courseId}</div>
                      <div className="text-sm text-gray-600 mb-2">Tổng số người học: {prediction.totalUsers}</div>
                      <div className="flex items-baseline gap-3 mt-4">
                        <div className={`text-5xl font-bold ${
                          prediction.overallGroup === 'A' ? 'text-green-600' :
                          prediction.overallGroup === 'B' ? 'text-blue-600' :
                          prediction.overallGroup === 'C' ? 'text-yellow-600' :
                          prediction.overallGroup === 'D' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {prediction.overallGroup}
                        </div>
                        <div className="text-lg text-gray-700">
                          {SATISFACTION_GROUPS[prediction.overallGroup as keyof typeof SATISFACTION_GROUPS].label}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Mức độ hài lòng trung bình: {prediction.avgSatisfaction}%
                      </div>
                    </div>

                    {/* Group Statistics */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thống kê phân nhóm
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Group A</div>
                          <div className="text-2xl font-bold text-green-600">{prediction.groupCounts.A}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Group B</div>
                          <div className="text-2xl font-bold text-blue-600">{prediction.groupCounts.B}</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Group C</div>
                          <div className="text-2xl font-bold text-yellow-600">{prediction.groupCounts.C}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Group D</div>
                          <div className="text-2xl font-bold text-orange-600">{prediction.groupCounts.D}</div>
                        </div>
                        <div className="col-span-2 bg-red-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Group E</div>
                          <div className="text-2xl font-bold text-red-600">{prediction.groupCounts.E}</div>
                        </div>
                      </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Biểu đồ phân bố
                      </h3>
                      <div className="space-y-3">
                        {prediction.distribution.map((item) => (
                          <div key={item.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 font-medium">{item.name}</span>
                              <span className="text-gray-900 font-medium">
                                {item.value} ({item.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  item.name === 'Group A' ? 'bg-green-500' :
                                  item.name === 'Group B' ? 'bg-blue-500' :
                                  item.name === 'Group C' ? 'bg-yellow-500' :
                                  item.name === 'Group D' ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* User Prediction Results */
                  <>
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-200">
                      <div className="text-sm text-gray-600 mb-2">Người học: {prediction.userId}</div>
                      <div className="text-sm text-gray-600 mb-2">Khóa học đang xem: {prediction.courseId}</div>
                      <div className="flex items-baseline gap-3 mt-4">
                        <div className={`text-5xl font-bold ${
                          prediction.satisfaction.group === 'A' ? 'text-green-600' :
                          prediction.satisfaction.group === 'B' ? 'text-blue-600' :
                          prediction.satisfaction.group === 'C' ? 'text-yellow-600' :
                          prediction.satisfaction.group === 'D' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {prediction.satisfaction.group}
                        </div>
                        <div className="text-lg text-gray-700">
                          {SATISFACTION_GROUPS[prediction.satisfaction.group as keyof typeof SATISFACTION_GROUPS].label}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Mức độ hài lòng: {prediction.satisfaction.satisfactionPercentage}%
                      </div>
                    </div>

                    {/* Other Courses Table */}
                    {prediction.otherCourses.length > 0 && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Các khóa học khác của người học này
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-300">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Khóa học</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mức độ hài lòng</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phân loại</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prediction.otherCourses.map((course) => (
                                <tr key={course.courseId} className="border-b border-gray-200">
                                  <td className="py-3 px-4 text-gray-800">{course.courseId}</td>
                                  <td className="py-3 px-4 text-gray-800">{course.satisfactionPercentage}%</td>
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
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Info */}
                <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Lưu ý:</span> Kết quả dự đoán được tính toán dựa trên mô hình Data Mining đã được huấn luyện với dữ liệu lịch sử.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium">Chưa có kết quả</p>
                <p className="text-sm">Vui lòng nhập thông tin và nhấn nút Dự đoán</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
