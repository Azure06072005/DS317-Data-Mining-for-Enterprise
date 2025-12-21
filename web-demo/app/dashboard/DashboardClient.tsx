'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { CourseInfo, CourseStatsResponse } from '@/lib/types';

type Props = {
  stats: CourseStatsResponse;
  allCourses: CourseInfo[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold leading-none tracking-tight">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      {children}
    </div>
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-4">{children}</div>;
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export default function DashboardClient({ stats, allCourses }: Props) {
  // ======= High-level stats =======
  const totalCourses = allCourses?.length ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;
  const totalSubmissions = stats?.totalSubmissions ?? 0;

  // ======= Charts data =======
  const studentsByCourse = (stats?.studentsByCourse ?? [])
    .map((item) => {
      const courseName =
        allCourses?.find((c) => c.id === item.courseId)?.title ?? item.courseId ?? 'N/A';
      return {
        name: courseName,
        value: item.count ?? 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const submissionsByCourse = (stats?.submissionCountsByCourse ?? [])
    .map((item) => {
      const courseName =
        allCourses?.find((c) => c.id === item.courseId)?.title ?? item.courseId ?? 'N/A';
      return {
        name: courseName,
        value: item.count ?? 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const passFailData = [
    { name: 'Đạt', value: stats?.passedSubmissions ?? 0 },
    { name: 'Chưa đạt', value: stats?.failedSubmissions ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <div className="p-6 pb-2">
            <CardHeader title="Tổng quan" description="Chỉ số tổng hợp toàn hệ thống" />
          </div>
          <CardContent>
            <div className="divide-y">
              <StatRow label="Số khóa học" value={formatNumber(totalCourses)} />
              <StatRow label="Tổng học viên" value={formatNumber(totalStudents)} />
              <StatRow label="Tổng bài nộp" value={formatNumber(totalSubmissions)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-6 pb-2">
            <CardHeader title="Insights" description="Tóm tắt nhanh từ dữ liệu hiện có" />
          </div>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Dữ liệu biểu đồ đã được tinh gọn để giảm nhiễu. Các điểm nổi bật bên dưới giúp bạn
                nắm nhanh xu hướng.
              </div>
              <div className="divide-y">
                <StatRow
                  label="Khóa học có nhiều học viên nhất"
                  value={studentsByCourse[0]?.name ? studentsByCourse[0].name : 'N/A'}
                />
                <StatRow
                  label="Số học viên (khóa học top)"
                  value={formatNumber(studentsByCourse[0]?.value ?? 0)}
                />
                <StatRow
                  label="Khóa học có nhiều bài nộp nhất"
                  value={submissionsByCourse[0]?.name ? submissionsByCourse[0].name : 'N/A'}
                />
                <StatRow
                  label="Số bài nộp (khóa học top)"
                  value={formatNumber(submissionsByCourse[0]?.value ?? 0)}
                />
                <StatRow
                  label="Tỷ lệ đạt"
                  value={(() => {
                    const total = (stats?.passedSubmissions ?? 0) + (stats?.failedSubmissions ?? 0);
                    const rate = total > 0 ? ((stats?.passedSubmissions ?? 0) / total) * 100 : 0;
                    return `${rate.toFixed(1)}%`;
                  })()}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <div className="p-6 pb-2">
            <CardHeader title="Học viên theo khóa học" description="Phân bố số học viên theo từng khóa" />
          </div>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByCourse} margin={{ top: 10, right: 16, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend />
                  <Bar name="Học viên" dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-6 pb-2">
            <CardHeader title="Kết quả bài nộp" description="Tỷ lệ đạt/chưa đạt" />
          </div>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend />
                  <Pie
                    data={passFailData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    label={(entry) => `${entry.name}: ${formatNumber(entry.value)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
