export default function Team() {
  const members = [
    {
      id: 1,
      name: "Huỳnh Lê Minh Thành",
      class: "22521346",
      department: "Khoa khoa học và Kỹ thuật thông tin",
    },
    {
      id: 2,
      name: "Trương Hoàng Khiêm",
      class: "23520730",
      department: "Khoa khoa học máy tính",
    },
    {
      id: 3,
      name: "Nguyễn Nghĩa Trung Kiên",
      class: "23520801",
      department: "Khoa khoa học máy tính",
    },
    {
      id: 4,
      name: "Trần Anh Kiệt",
      class: "23520820",
      department: "Khoa khoa học và Kỹ thuật thông tin",
    },
    {
      id: 5,
      name: "Nguyễn Duy",
      class: "24520384",
      department: "Khoa khoa học và Kỹ thuật thông tin",
    },
    {
      id: 6,
      name: "Võ Phan Kiều My",
      class: "24521095",
      department: "Khoa khoa học và Kỹ thuật thông tin",
    },
  ];

  const gradients = [
    "from-blue-400 to-purple-500",
    "from-green-400 to-blue-500",
    "from-purple-400 to-pink-500",
    "from-orange-400 to-red-500",
    "from-cyan-400 to-teal-500",
    "from-indigo-400 to-blue-500",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thành viên nhóm
          </h1>
          <p className="text-lg text-gray-600">
            Đội ngũ phát triển dự án EduPredict
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Card Header with Gradient */}
              <div
                className={`h-32 bg-gradient-to-br ${gradients[index]}`}
              ></div>

              {/* Avatar */}
              <div className="flex justify-center -mt-16 mb-4">
                <div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradients[index]} border-4 border-white flex items-center justify-center`}
                >
                  <span className="text-white text-4xl font-bold">
                    {member.name.charAt(member.name.length - 1)}
                  </span>
                </div>
              </div>

              {/* Member Info */}
              <div className="text-center px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  MSSV: {member.class}
                </p>
                <p className="text-sm text-gray-500">{member.department}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
