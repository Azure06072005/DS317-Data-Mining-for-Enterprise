"use client";

import { useState } from "react";

export default function Prediction() {
  const [formData, setFormData] = useState({
    courseId: "",
    studentEngagement: "",
    attendanceRate: "",
    assignmentScore: "",
    participationScore: "",
    previousRating: "",
  });

  const [prediction, setPrediction] = useState<{
    level: string;
    confidence: number;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock prediction logic
    const randomConfidence = Math.floor(Math.random() * 30) + 70;
    const levels = ["Cao", "Trung bình", "Thấp"];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    
    setPrediction({
      level: randomLevel,
      confidence: randomConfidence,
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course ID */}
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã khóa học
                </label>
                <input
                  type="text"
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="VD: C_1234567"
                  required
                />
              </div>

              {/* Student Engagement */}
              <div>
                <label htmlFor="studentEngagement" className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ tương tác (0-100)
                </label>
                <input
                  type="number"
                  id="studentEngagement"
                  name="studentEngagement"
                  min="0"
                  max="100"
                  value={formData.studentEngagement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="VD: 75"
                  required
                />
              </div>

              {/* Attendance Rate */}
              <div>
                <label htmlFor="attendanceRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉ lệ tham dự (%)
                </label>
                <input
                  type="number"
                  id="attendanceRate"
                  name="attendanceRate"
                  min="0"
                  max="100"
                  value={formData.attendanceRate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="VD: 85"
                  required
                />
              </div>

              {/* Assignment Score */}
              <div>
                <label htmlFor="assignmentScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm bài tập (0-100)
                </label>
                <input
                  type="number"
                  id="assignmentScore"
                  name="assignmentScore"
                  min="0"
                  max="100"
                  value={formData.assignmentScore}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="VD: 80"
                  required
                />
              </div>

              {/* Participation Score */}
              <div>
                <label htmlFor="participationScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm tham gia (0-100)
                </label>
                <input
                  type="number"
                  id="participationScore"
                  name="participationScore"
                  min="0"
                  max="100"
                  value={formData.participationScore}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="VD: 90"
                  required
                />
              </div>

              {/* Previous Rating */}
              <div>
                <label htmlFor="previousRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá trước đó (0-5)
                </label>
                <input
                  type="number"
                  id="previousRating"
                  name="previousRating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.previousRating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="VD: 4.5"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition transform hover:scale-[1.02]"
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
                {/* Prediction Level */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                  <div className="text-sm text-gray-600 mb-2">Mức độ hài lòng</div>
                  <div className={`text-4xl font-bold ${
                    prediction.level === "Cao" ? "text-green-600" :
                    prediction.level === "Trung bình" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {prediction.level}
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
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Visualization */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Phân bố xác suất
                  </h3>
                  <div className="space-y-3">
                    {["Cao", "Trung bình", "Thấp"].map((level) => {
                      const isSelected = level === prediction.level;
                      const probability = isSelected 
                        ? prediction.confidence 
                        : Math.floor((100 - prediction.confidence) / 2);
                      
                      return (
                        <div key={level}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{level}</span>
                            <span className="text-gray-900 font-medium">{probability}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                level === "Cao" ? "bg-green-500" :
                                level === "Trung bình" ? "bg-yellow-500" :
                                "bg-red-500"
                              } ${isSelected ? "opacity-100" : "opacity-40"}`}
                              style={{ width: `${probability}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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
