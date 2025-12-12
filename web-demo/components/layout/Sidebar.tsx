"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Quick Access",
      items: [
        { name: "Dashboard", icon: "🏠", path: "/" },
        { name: "Dự đoán", icon: "🔮", path: "/prediction" },
        { name: "Thành viên", icon: "👥", path: "/team" },
      ],
    },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen text-white">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">EduPredict</h1>
            <p className="text-xs text-slate-400">Student Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      pathname === item.path
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">Quản lý giáo dục</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
