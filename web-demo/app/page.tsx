import Image from "next/image";

export default function Home() {
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
      </div>
    </div>
  );
}
