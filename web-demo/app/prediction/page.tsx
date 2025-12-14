"use client";

import { useState } from "react";
import { coursesData, getCourseById } from "@/data/courseData";
import { PredictionResult, SATISFACTION_GROUPS } from "@/types/prediction";

export default function Prediction() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  // Performance metrics for 4 periods
  const [performanceMetrics, setPerformanceMetrics] = useState({
    accuracy_p1: 0, accuracy_p2: 0, accuracy_p3: 0, accuracy_p4: 0,
    avg_earned_ratio_p1: 0, avg_earned_ratio_p2: 0, avg_earned_ratio_p3: 0, avg_earned_ratio_p4: 0,
    avg_earned_score_p1: 0, avg_earned_score_p2: 0, avg_earned_score_p3: 0, avg_earned_score_p4: 0,
  });
  
  // Engagement metrics
  const [engagementMetrics, setEngagementMetrics] = useState({
    numberOfSessions: 0,
    totalTimeSpent: 0,
    videoCompletionRate: 0,
    exerciseCompletionRate: 0,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
  };

  const handlePerformanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerformanceMetrics(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const getPerformanceValue = (key: keyof typeof performanceMetrics): number => {
    return performanceMetrics[key];
  };

  const handleEngagementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEngagementMetrics(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Weighting constants for satisfaction calculation
    const ACCURACY_WEIGHT = 0.3;
    const EARNED_RATIO_WEIGHT = 0.3;
    const EARNED_SCORE_WEIGHT = 0.2;
    const ENGAGEMENT_WEIGHT = 0.2;
    
    // Calculate average metrics
    const avgAccuracy = (performanceMetrics.accuracy_p1 + performanceMetrics.accuracy_p2 + 
                         performanceMetrics.accuracy_p3 + performanceMetrics.accuracy_p4) / 4;
    const avgRatio = (performanceMetrics.avg_earned_ratio_p1 + performanceMetrics.avg_earned_ratio_p2 + 
                      performanceMetrics.avg_earned_ratio_p3 + performanceMetrics.avg_earned_ratio_p4) / 4;
    const avgScore = (performanceMetrics.avg_earned_score_p1 + performanceMetrics.avg_earned_score_p2 + 
                      performanceMetrics.avg_earned_score_p3 + performanceMetrics.avg_earned_score_p4) / 4;
    
    const engagementScore = (engagementMetrics.videoCompletionRate + engagementMetrics.exerciseCompletionRate) / 2;
    
    // Calculate overall satisfaction level (0-100)
    const satisfactionLevel = Math.min(100, Math.max(0,
      (avgAccuracy * 100 * ACCURACY_WEIGHT) + 
      (avgRatio * 100 * EARNED_RATIO_WEIGHT) + 
      (avgScore * EARNED_SCORE_WEIGHT) + 
      (engagementScore * ENGAGEMENT_WEIGHT)
    ));
    
    // Determine group based on satisfaction level
    let group: 'A' | 'B' | 'C' | 'D' | 'E';
    if (satisfactionLevel >= 80) group = 'A';
    else if (satisfactionLevel >= 65) group = 'B';
    else if (satisfactionLevel >= 50) group = 'C';
    else if (satisfactionLevel >= 30) group = 'D';
    else group = 'E';
    
    const groupInfo = SATISFACTION_GROUPS[group];
    
    // Deterministic confidence based on input consistency
    const performanceVariance = Math.abs(avgAccuracy - avgRatio) + 
                                Math.abs(avgAccuracy - (avgScore / 100)) +
                                Math.abs(avgRatio - (avgScore / 100));
    const baseConfidence = 85;
    const confidencePenalty = Math.min(10, performanceVariance * 20);
    const confidence = Math.floor(baseConfidence - confidencePenalty);
    
    setPrediction({
      satisfactionLevel: Math.round(satisfactionLevel),
      confidence,
      group,
      groupLabel: groupInfo.label,
      groupPercentage: groupInfo.percentage,
    });
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
            Nhập thông tin để dự đoán mức độ hài lòng của học viên
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thông tin đầu vào
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Group 1: Course Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  1. Thông tin khóa học
                </h3>
                
                {/* Course ID Dropdown */}
                <div className="mb-4">
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã khóa học
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

                {/* Auto-filled course information */}
                {selectedCourse && (
                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Tổng số học viên</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedCourse.totalStudentsEnrolled.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tổng số video</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedCourse.totalVideos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tổng số bài tập</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedCourse.totalExercises}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Số lĩnh vực</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedCourse.numFields}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">Yêu cầu điều kiện</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedCourse.isPrerequisites ? "Có" : "Không"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Group 2: Performance Metrics */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  2. Chỉ số hiệu suất học tập (4 giai đoạn)
                </h3>
                
                {/* Accuracy for 4 periods */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Độ chính xác (0-1)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['p1', 'p2', 'p3', 'p4'].map((period) => {
                      const fieldName = `accuracy_${period}` as keyof typeof performanceMetrics;
                      return (
                        <div key={fieldName}>
                          <label htmlFor={fieldName} className="block text-xs text-gray-600 mb-1">
                            P{period.charAt(1)}
                          </label>
                          <input
                            type="number"
                            id={fieldName}
                            name={fieldName}
                            min="0"
                            max="1"
                            step="0.01"
                            value={getPerformanceValue(fieldName)}
                            onChange={handlePerformanceChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average Earned Ratio for 4 periods */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tỷ lệ điểm đạt được (0-1)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['p1', 'p2', 'p3', 'p4'].map((period) => {
                      const fieldName = `avg_earned_ratio_${period}` as keyof typeof performanceMetrics;
                      return (
                        <div key={fieldName}>
                          <label htmlFor={fieldName} className="block text-xs text-gray-600 mb-1">
                            P{period.charAt(1)}
                          </label>
                          <input
                            type="number"
                            id={fieldName}
                            name={fieldName}
                            min="0"
                            max="1"
                            step="0.01"
                            value={getPerformanceValue(fieldName)}
                            onChange={handlePerformanceChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average Earned Score for 4 periods */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Điểm trung bình (0-100)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['p1', 'p2', 'p3', 'p4'].map((period) => {
                      const fieldName = `avg_earned_score_${period}` as keyof typeof performanceMetrics;
                      return (
                        <div key={fieldName}>
                          <label htmlFor={fieldName} className="block text-xs text-gray-600 mb-1">
                            P{period.charAt(1)}
                          </label>
                          <input
                            type="number"
                            id={fieldName}
                            name={fieldName}
                            min="0"
                            max="100"
                            step="0.1"
                            value={getPerformanceValue(fieldName)}
                            onChange={handlePerformanceChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Group 3: Engagement Metrics */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  3. Chỉ số tương tác
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="numberOfSessions" className="block text-sm font-medium text-gray-700 mb-2">
                      Số phiên học
                    </label>
                    <input
                      type="number"
                      id="numberOfSessions"
                      name="numberOfSessions"
                      min="0"
                      value={engagementMetrics.numberOfSessions}
                      onChange={handleEngagementChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                      placeholder="VD: 50"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="totalTimeSpent" className="block text-sm font-medium text-gray-700 mb-2">
                      Tổng thời gian học (phút)
                    </label>
                    <input
                      type="number"
                      id="totalTimeSpent"
                      name="totalTimeSpent"
                      min="0"
                      value={engagementMetrics.totalTimeSpent}
                      onChange={handleEngagementChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                      placeholder="VD: 1200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="videoCompletionRate" className="block text-sm font-medium text-gray-700 mb-2">
                      Tỷ lệ hoàn thành video (%)
                    </label>
                    <input
                      type="number"
                      id="videoCompletionRate"
                      name="videoCompletionRate"
                      min="0"
                      max="100"
                      step="0.1"
                      value={engagementMetrics.videoCompletionRate}
                      onChange={handleEngagementChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                      placeholder="VD: 85.5"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="exerciseCompletionRate" className="block text-sm font-medium text-gray-700 mb-2">
                      Tỷ lệ hoàn thành bài tập (%)
                    </label>
                    <input
                      type="number"
                      id="exerciseCompletionRate"
                      name="exerciseCompletionRate"
                      min="0"
                      max="100"
                      step="0.1"
                      value={engagementMetrics.exerciseCompletionRate}
                      onChange={handleEngagementChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                      placeholder="VD: 75.0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition transform hover:scale-[1.02]"
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
                {/* Prediction Group */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-200">
                  <div className="text-sm text-gray-600 mb-2">Nhóm phân loại</div>
                  <div className="flex items-baseline gap-3">
                    <div className={`text-5xl font-bold ${
                      prediction.group === 'A' ? 'text-green-600' :
                      prediction.group === 'B' ? 'text-blue-600' :
                      prediction.group === 'C' ? 'text-yellow-600' :
                      prediction.group === 'D' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {prediction.group}
                    </div>
                    <div className="text-lg text-gray-700">{prediction.groupLabel}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Tỷ lệ: {prediction.groupPercentage}% học viên
                  </div>
                </div>

                {/* Satisfaction Level */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Mức độ hài lòng</span>
                    <span className="text-sm font-bold text-gray-900">{prediction.satisfactionLevel}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 ${
                        prediction.satisfactionLevel >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        prediction.satisfactionLevel >= 65 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        prediction.satisfactionLevel >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        prediction.satisfactionLevel >= 30 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${prediction.satisfactionLevel}%` }}
                    ></div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Độ tin cậy</span>
                    <span className="text-sm font-bold text-gray-900">{prediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Group Distribution */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Phân bố nhóm hài lòng
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(SATISFACTION_GROUPS).map(([key, info]) => {
                      const isSelected = key === prediction.group;
                      
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">
                              Nhóm {key}: {info.label}
                            </span>
                            <span className="text-gray-900 font-medium">{info.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                info.color === 'green' ? 'bg-green-500' :
                                info.color === 'blue' ? 'bg-blue-500' :
                                info.color === 'yellow' ? 'bg-yellow-500' :
                                info.color === 'orange' ? 'bg-orange-500' :
                                'bg-red-500'
                              } ${isSelected ? 'opacity-100' : 'opacity-40'}`}
                              style={{ width: `${info.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
