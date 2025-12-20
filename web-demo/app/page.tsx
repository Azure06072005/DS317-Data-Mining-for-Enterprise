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
                    Dự án <strong>EduPredict</strong> hướng tới việc xây dựng mô hình <em>dự đoán sớm</em> mức độ hài&nbsp;lòng của học viên 
                    đối với các khóa học trực tuyến trên nền tảng XuetangX. Mô hình sử dụng bộ dữ liệu <strong>MOOC‑CubeX</strong> 
                    quy mô lớn – gồm 4 216 khóa học, hơn 230 000 video, 358 000 bài tập và hơn 296 triệu bản ghi hành vi của 
                    3,33 triệu học viên【591452651977941†L56-L62】. Điểm thách thức của đề tài là bộ dữ liệu không chứa 
                    nhãn hài&nbsp;lòng trực tiếp; do đó nhóm thiết kế một nhãn <em>proxy</em> bằng cách kết hợp bốn thành phần: hiệu quả học tập 
                    (Learning), cảm xúc bình luận (Sentiment), độ phức tạp khóa học (Course) và tính đều đặn theo thời gian (Time), 
                    qua đó phân loại thành 5 mức độ hài&nbsp;lòng【325245144627243†L83-L90】.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Mục tiêu</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Dự đoán sớm mức độ hài&nbsp;lòng của học viên dựa trên chuỗi hành vi học tập và tương tác, từ đó kịp thời can&nbsp;thiệp giảm bỏ&nbsp;học【543749709443744†L2580-L2631】.</li>
                    <li>Phân tích các yếu tố ảnh hưởng đến sự hài&nbsp;lòng (hiệu quả học tập, hành vi xem video, cảm xúc bình luận, độ phức tạp khóa học).</li>
                    <li>Xây dựng nhãn hài&nbsp;lòng gián tiếp dựa trên trọng số của bốn thành phần Learning–Sentiment–Course–Time【325245144627243†L83-L90】.</li>
                    <li>Triển khai hệ thống dự đoán và dashboard BI để hỗ trợ giảng viên và quản&nbsp;trị viên đưa ra quyết định cải thiện chất lượng khóa học【543749709443744†L2591-L2623】.</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Nguồn dữ liệu</h3>
                  <p className="text-gray-600 mb-4">
                    <strong>MOOC‑CubeX</strong> là một kho dữ liệu tổng hợp nhiều nguồn tài nguyên học thuật – từ thông tin khóa học, 
                    hồ sơ học viên, hành vi xem video, làm bài tập tới bình luận và đồ thị khái niệm – được duy trì bởi 
                    Tsinghua University và XuetangX【591452651977941†L48-L68】. Bộ dữ liệu cung cấp nền tảng vững chắc cho 
                    nghiên cứu dự đoán hài&nbsp;lòng nhờ quy mô lớn, độ bao phủ cao và cấu trúc xoay quanh đồ thị khái niệm【591452651977941†L48-L75】.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Kết quả thực nghiệm</h2>
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">Bộ dữ liệu và kết quả</h3>
                  <p className="text-gray-600 mb-4">
                    Bộ dữ liệu time series được xây dựng gồm <strong>337 617</strong> cặp <code>user_id&nbsp;×&nbsp;course_id</code>, 
                    tương ứng hơn 1,35&nbsp;triệu dòng dữ liệu và 30&nbsp;đặc trưng ở định dạng dài; sau khi xoay trục sang 
                    định dạng rộng có 110&nbsp;đặc trưng dùng huấn luyện【325245144627243†L74-L90】. Phân phối nhãn hài&nbsp;lòng 
                    rất mất cân bằng: nhãn&nbsp;2 chiếm khoảng&nbsp;85,9%, trong khi các nhãn 1, 3, 4 và 5 chiếm dưới 7% tổng số mẫu【325245144627243†L100-L107】. 
                    Kết quả thử nghiệm sơ bộ cho thấy các mô hình như Random&nbsp;Forest và XGBoost đạt hiệu suất dự đoán tốt, 
                    đặc biệt khi sử dụng Node2Vec và SMOTE để làm giàu và cân bằng dữ liệu.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Số cặp học&nbsp;viên–khóa</h4>
                      <p className="text-4xl font-bold text-blue-600">337k+</p>
                      <p className="text-gray-600 mt-2">Sau khi lọc dữ liệu</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Số đặc trưng</h4>
                      <p className="text-4xl font-bold text-green-600">110</p>
                      <p className="text-gray-600 mt-2">Trong định dạng rộng</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Phân tích kết quả</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Bộ dữ liệu được xây dựng từ 4&nbsp;phase và 337 617 cặp học&nbsp;viên–khóa, sau pivot thành 110 đặc trưng【325245144627243†L74-L90】.</li>
                    <li>Phân phối nhãn mất cân bằng nghiêm trọng: nhãn 2 áp đảo (~85,9%), các nhãn còn lại rất ít【325245144627243†L100-L107】.</li>
                    <li>Các đặc trưng quan trọng bao gồm: điểm <em>earned_score</em>, số bài làm, thời lượng và mẫu xem video (rewind/fast‑forward, session), và số bình luận tích cực/tiêu cực【325245144627243†L109-L165】.</li>
                    <li>Áp dụng Node2Vec giúp biểu diễn các mối quan hệ trong đồ thị và SMOTE giúp cân bằng dữ liệu, cải thiện hiệu suất mô hình【543749709443744†L128-L139】.</li>
                    <li>F1‑score được chọn làm độ đo chính; cùng với AUC‑ROC để đánh giá mô hình trên dữ liệu mất cân bằng【325245144627243†L883-L904】.</li>
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
                      <h4 className="text-lg font-bold text-gray-800 mb-2">1. Thu thập và tiền&nbsp;xử&nbsp;lý</h4>
                      <p className="text-gray-600">
                        - Lọc bỏ các khóa học <em>self‑paced</em> và trích xuất dữ liệu hành vi (user, course, video, exercise, comment) từ MOOC‑CubeX.<br/>
                        - Làm sạch, chuẩn hóa dữ liệu, xử lý giá trị thiếu và ngoại lai; chỉ giữ những cặp <code>user_id&nbsp;×&nbsp;course_id</code> có ít nhất một tương tác【325245144627243†L70-L74】.<br/>
                        - Xây dựng bộ dữ liệu chuỗi thời gian gồm 4&nbsp;phase với 30 đặc trưng ở định dạng dài.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">2. Xây dựng dữ liệu giai đoạn &amp; đặc&nbsp;trưng</h4>
                      <p className="text-gray-600">
                        - Chia tiến trình học của mỗi học&nbsp;viên thành 4&nbsp;phase dựa trên tỷ lệ thời gian còn lại (0–25%, 25–50%, 50–75%, 75–100%)【325245144627243†L52-L60】.<br/>
                        - Tạo các đặc trưng tĩnh (giới tính, số khóa, số video/bài&nbsp;tập, số lĩnh vực), đặc trưng học tập (số bài làm, earned_score, số lần nộp), đặc trưng video (thời lượng xem, rewind/fast‑forward, session_count, speed_change_count) và đặc trưng bình luận (số bình luận tích cực, trung tính, tiêu cực)【325245144627243†L109-L165】.<br/>
                        - Xoay trục dữ liệu sang định dạng rộng với 110 đặc trưng để huấn luyện mô hình.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">3. Gán nhãn hài&nbsp;lòng</h4>
                      <p className="text-gray-600">
                        - Tính điểm <em>satisfaction_score</em> dựa trên bốn trụ cột: Learning, Sentiment, Course và Time; áp dụng trọng số (0.60, 0.15, 0.15, 0.10) và điều chỉnh theo độ tin cậy của bình luận【325245144627243†L83-L90】.<br/>
                        - Ánh xạ điểm số thành 5 mức độ hài&nbsp;lòng (1→5) để tạo nhãn huấn luyện.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">4. Cân bằng &amp; làm&nbsp;giàu dữ liệu</h4>
                      <p className="text-gray-600">
                        - Sử dụng Node2Vec để tạo embedding cho đồ thị người&nbsp;học–khóa&nbsp;học–khái&nbsp;niệm và kết hợp vào bộ dữ liệu【543749709443744†L128-L139】.<br/>
                        - Áp dụng kỹ thuật SMOTE để tăng cường các lớp thiểu số, xây dựng các bộ dữ liệu gốc, Node2Vec, SMOTE và SMOTE&nbsp;+&nbsp;Node2Vec.
                      </p>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-600">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">5. Huấn luyện &amp; đánh&nbsp;giá mô hình</h4>
                      <p className="text-gray-600">
                        - Thử nghiệm các thuật toán học máy và học sâu: Random Forest, XGBoost, LightGBM, TabNet, LSTM, GRU và TCN để khai thác cả dữ liệu bảng và chuỗi thời gian【325245144627243†L700-L835】.<br/>
                        - Huấn luyện theo từng giai đoạn để dự đoán sớm; sử dụng cross‑validation và tìm kiếm siêu tham số để tối ưu hiệu suất.<br/>
                        - Đánh giá mô hình bằng F1‑score, Accuracy và AUC‑ROC; phân tích độ quan trọng của đặc trưng và triển khai vào dashboard BI để hỗ trợ can&nbsp;thiệp【325245144627243†L883-L904】【543749709443744†L2591-L2623】.
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
