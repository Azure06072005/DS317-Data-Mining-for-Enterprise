// app/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
