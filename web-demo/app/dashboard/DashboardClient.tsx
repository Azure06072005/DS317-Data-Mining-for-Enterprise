"use client";

import DashboardCard from "@/components/dashboard/Card";
import { Course } from "@prisma/client";

type DashboardClientProps = {
  stats: {
    totalCourses: number;
    totalExercises: number;
    totalStudents: number;
    totalRequests: number;
    averageEnrollment: number;
    completionRate: number;
    pendingCourses: number;
    activeCourses: number;
    requestsByStatus: Record<string, number>;
    requestsByType: Record<string, number>;
    completedCourses: number;
    averageExercisesPerCourse: number;
    mostPopularCourse: string;
    coursesByField: Record<string, number>;
    averagePrerequisitesPerCourse: number;
    approvalRate: number;
  };
  allCourses: Course[];
};

/**
 * Recharts-based dashboard layout.
 * Noisy charts removed per request:
 * - "Phân bố yêu cầu điều kiện"
 * - "Phân bố số lượng bài tập theo khóa học"
 * - "Số Học viên theo Lĩnh vực (Top 8)"
 *
 * The removed Top-8 section is replaced with a Recharts-free insights card
 * to preserve the 2-column layout.
 */
export default function DashboardClient({ stats, allCourses }: DashboardClientProps) {
  // NOTE: keep computations minimal; only derive what is used in remaining cards.
  const requestsByStatusData = Object.entries(stats.requestsByStatus || {}).map(
    ([name, value]) => ({ name, value })
  );

  const requestsByTypeData = Object.entries(stats.requestsByType || {}).map(
    ([name, value]) => ({ name, value })
  );

  // Keep original Recharts implementation for remaining charts.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
  } = require("recharts");

  const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#14b8a6"];

  return (
    <div className="flex flex-col gap-6">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Tổng số khóa học" value={stats.totalCourses} />
        <DashboardCard title="Tổng số bài tập" value={stats.totalExercises} />
        <DashboardCard title="Tổng số học viên" value={stats.totalStudents} />
        <DashboardCard title="Tổng số yêu cầu" value={stats.totalRequests} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="TB Học viên / khóa" value={stats.averageEnrollment.toFixed(2)} />
        <DashboardCard title="Tỷ lệ hoàn thành" value={`${stats.completionRate.toFixed(2)}%`} />
        <DashboardCard title="Khóa chờ duyệt" value={stats.pendingCourses} />
        <DashboardCard title="Khóa đang hoạt động" value={stats.activeCourses} />
      </div>

      {/* Charts (2-column) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Requests by Status - Bar */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">Yêu cầu theo trạng thái</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsByStatusData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Type - Pie */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">Yêu cầu theo loại</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={requestsByTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {requestsByTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Courses snapshot - Recharts-free card replacing noisy Top-8 section */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">Insights nhanh</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Khóa học phổ biến nhất</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {stats.mostPopularCourse || "—"}
              </div>
            </div>

            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">TB bài tập / khóa</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {stats.averageExercisesPerCourse.toFixed(2)}
              </div>
            </div>

            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Số khóa đã hoàn thành</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {stats.completedCourses}
              </div>
            </div>

            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Tỷ lệ phê duyệt</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {stats.approvalRate.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Optional: contextual hint from underlying course list */}
          <div className="mt-4 text-xs text-slate-500">
            Tổng số khóa trong danh sách: <span className="font-medium text-slate-700">{allCourses?.length ?? 0}</span>
          </div>
        </div>

        {/* Courses by Field - keep original style; small bar */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold">Khóa học theo lĩnh vực</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(stats.coursesByField || {}).map(([name, value]) => ({ name, value }))}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
