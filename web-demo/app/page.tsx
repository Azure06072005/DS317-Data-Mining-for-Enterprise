"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'methods'>('overview');

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <div className="relative bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Logos */}
          <div className="flex items-center justify-center gap-8 mb-12 flex-wrap">
            <div className="p-3 flex items-center justify-center" style={{ height: '120px', width: 'auto' }}>
              <Image
                src="/xuetangx-trn-sq.png"
                alt="XuetangX Logo"
                width={120}
                height={60}
                className="object-contain"
                style={{ maxHeight: '60px', width: 'auto' }}
              />
            </div>
            <div className="p-3 flex items-center justify-center" style={{ height: '120px', width: 'auto' }}>
              <Image
                src="/GMA-new-logo.png"
                alt="Global MOOC Alliance Logo"
                width={120}
                height={60}
                className="object-contain"
                style={{ maxHeight: '60px', width: 'auto' }}
              />
            </div>
            <div className="p-3 flex items-center justify-center" style={{ height: '120px', width: 'auto' }}>
              <Image
                src="/Logo_UIT_updated.svg.png"
                alt="UIT Logo"
                width={120}
                height={60}
                className="object-contain"
                style={{ maxHeight: '60px', width: 'auto' }}
              />
            </div>
            <div className="p-3 flex items-center justify-center" style={{ height: '120px', width: 'auto' }}>
              <Image
                src="/Tsinghua_University_Logo.svg.png"
                alt="Tsinghua University Logo"
                width={120}
                height={60}
                className="object-contain"
                style={{ maxHeight: '60px', width: 'auto' }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 py-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              EduPredict - Dự đoán Mức độ Hài lòng Học viên
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              Hệ thống dự đoán mức độ hài lòng của học viên sử dụng Data Mining
            </p>

            <div className="pt-6 space-y-2">
              <p className="text-lg md:text-xl font-semibold text-blue-50">
                DS317 - Data Mining for Enterprise
              </p>
              <p className="text-base md:text-lg text-blue-100">
                Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM
              </p>
            </div>
          </div>
        </div>

        {/* Wave Effect */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Dự đoán chính xác</h3>
            <p className="text-gray-600">
              Sử dụng các thuật toán Data Mining tiên tiến để dự đoán mức độ hài lòng của học viên
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Phân tích dữ liệu</h3>
            <p className="text-gray-600">
              Dashboard trực quan với các biểu đồ và thống kê chi tiết về học viên và khóa học
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Giao diện thân thiện</h3>
            <p className="text-gray-600">
              Thiết kế hiện đại, dễ sử dụng, tương thích đa nền tảng và responsive
            </p>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex justify-center border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-8 py-4 text-lg font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Mô tả đề tài
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-8 py-4 text-lg font-semibold transition-all ${
                activeTab === 'results'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Kết quả thực nghiệm
            </button>
            <button
              onClick={() => setActiveTab('methods')}
              className={`px-8 py-4 text-lg font-semibold transition-all ${
                activeTab === 'methods'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Phương pháp thực nghiệm dự án
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Mô tả đề tài</h2>
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">Tổng quan</h3>
                  <p className="text-gray-600 mb-4">
                    Dự án EduPredict tập trung vào việc phát triển hệ thống dự đoán mức độ hài lòng của học viên 
                    trong các khóa học trực tuyến (MOOC) sử dụng các kỹ thuật Data Mining tiên tiến.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Mục tiêu</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Dự đoán mức độ hài lòng của học viên dựa trên hành vi học tập và tương tác với khóa học</li>
                    <li>Phân tích các yếu tố ảnh hưởng đến sự hài lòng của học viên</li>
                    <li>Cung cấp thông tin chi tiết để cải thiện chất lượng khóa học</li>
                    <li>Hỗ trợ giảng viên và quản trị viên trong việc tối ưu hóa nội dung học tập</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Nguồn dữ liệu</h3>
                  <p className="text-gray-600 mb-4">
                    Dự án sử dụng dữ liệu từ MOOCCubeX, một tập dữ liệu lớn về các khóa học trực tuyến 
                    bao gồm thông tin về học viên, khóa học, video bài giảng, bài tập và tương tác của người học.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Kết quả thực nghiệm</h2>
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">Độ chính xác của mô hình</h3>
                  <p className="text-gray-600 mb-4">
                    Các mô hình Data Mining đã được huấn luyện và đánh giá trên tập dữ liệu MOOCCubeX 
                    với các kết quả đáng khích lệ.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Độ chính xác</h4>
                      <p className="text-4xl font-bold text-blue-600">85%+</p>
                      <p className="text-gray-600 mt-2">Trên tập test</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">F1-Score</h4>
                      <p className="text-4xl font-bold text-green-600">0.83</p>
                      <p className="text-gray-600 mt-2">Cân bằng giữa precision và recall</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Phân tích kết quả</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Mô hình có khả năng dự đoán chính xác mức độ hài lòng của học viên</li>
                    <li>Các đặc trưng quan trọng nhất bao gồm: tỷ lệ hoàn thành video, điểm bài tập, và tương tác với nội dung</li>
                    <li>Việc sử dụng Node2Vec embeddings giúp cải thiện độ chính xác đáng kể</li>
                    <li>Phương pháp SMOTE giúp cân bằng dữ liệu và cải thiện hiệu suất trên các nhóm thiểu số</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'methods' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Phương pháp thực nghiệm dự án</h2>
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">Quy trình thực hiện</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">1. Thu thập và tiền xử lý dữ liệu</h4>
                      <p className="text-gray-600">
                        - Trích xuất dữ liệu từ MOOCCubeX dataset<br/>
                        - Làm sạch và chuẩn hóa dữ liệu<br/>
                        - Xử lý giá trị thiếu và outliers
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">2. Feature Engineering</h4>
                      <p className="text-gray-600">
                        - Tạo các đặc trưng từ hành vi học tập (video watching, exercise completion)<br/>
                        - Sử dụng Node2Vec để tạo graph embeddings<br/>
                        - Tính toán các chỉ số thống kê theo từng giai đoạn (period 1-4)
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">3. Cân bằng dữ liệu</h4>
                      <p className="text-gray-600">
                        - Áp dụng kỹ thuật SMOTE (Synthetic Minority Over-sampling Technique)<br/>
                        - Xử lý vấn đề imbalanced data trong phân loại mức độ hài lòng
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">4. Huấn luyện mô hình</h4>
                      <p className="text-gray-600">
                        - Thử nghiệm nhiều thuật toán: Random Forest, XGBoost, Neural Networks<br/>
                        - Cross-validation để đánh giá và tối ưu hóa mô hình<br/>
                        - Hyperparameter tuning để đạt hiệu suất tốt nhất
                      </p>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">5. Đánh giá và triển khai</h4>
                      <p className="text-gray-600">
                        - Đánh giá trên tập test độc lập<br/>
                        - Phân tích feature importance<br/>
                        - Triển khai mô hình lên web application
                      </p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Công nghệ sử dụng</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <p className="font-semibold text-gray-800">Python</p>
                      <p className="text-sm text-gray-600">Ngôn ngữ chính</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <p className="font-semibold text-gray-800">Scikit-learn</p>
                      <p className="text-sm text-gray-600">Machine Learning</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <p className="font-semibold text-gray-800">Node2Vec</p>
                      <p className="text-sm text-gray-600">Graph Embeddings</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <p className="font-semibold text-gray-800">Next.js</p>
                      <p className="text-sm text-gray-600">Web Framework</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <p className="font-semibold text-gray-800">React</p>
                      <p className="text-sm text-gray-600">UI Library</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <p className="font-semibold text-gray-800">Recharts</p>
                      <p className="text-sm text-gray-600">Data Visualization</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
