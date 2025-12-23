"use client";

import { useMemo, useState } from "react";
import { coursesData } from "@/data/courseData";
import { getCourseStatistics } from "@/data/predictionData";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

type Course = {
  courseId: string;
  name: string;
  about?: string;
  field: string;
  schools?: string[];
  level?: string;
  totalStudentsEnrolled: number;
  totalVideos: number;
  totalExercises: number;
  isPrerequisites: boolean;
};

export default function CourseDashboardPage() {
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const allFields = useMemo(() => {
    const fieldSet = new Set((coursesData as any[]).map((c) => c.field));
    return ["all", ...Array.from(fieldSet).sort()];
  }, []);

  const allSchools = useMemo(() => {
    const schoolSet = new Set<string>();
    (coursesData as any[]).forEach((c) =>
      (c.schools ?? []).forEach((s: string) => schoolSet.add(s))
    );
    return ["all", ...Array.from(schoolSet).sort()];
  }, []);

  const allLevels = useMemo(() => {
    const levelSet = new Set<string>();
    (coursesData as any[]).forEach((c) => {
      if (c.level) levelSet.add(c.level);
    });
    return ["all", ...Array.from(levelSet).sort()];
  }, []);

  const filteredCourses = useMemo(() => {
    return (coursesData as Course[]).filter((course) => {
      const matchesField =
        selectedField === "all" || course.field === selectedField;

      const matchesSchool =
        selectedSchool === "all" ||
        (course.schools ?? []).includes(selectedSchool);

      const matchesLevel =
        selectedLevel === "all" ||
        (course.level ?? "").toLowerCase() === selectedLevel.toLowerCase();

      const hay = `${course.name} ${course.about ?? ""} ${
        course.courseId
      }`.toLowerCase();
      const matchesSearch =
        !searchTerm || hay.includes(searchTerm.toLowerCase());

      return matchesField && matchesSchool && matchesLevel && matchesSearch;
    });
  }, [selectedField, selectedSchool, selectedLevel, searchTerm]);

  const stats = useMemo(() => {
    const totalCourses = filteredCourses.length;
    const totalStudents = filteredCourses.reduce(
      (sum, c) => sum + c.totalStudentsEnrolled,
      0
    );

    const avgVideos =
      totalCourses > 0
        ? Math.round(
            filteredCourses.reduce((sum, c) => sum + c.totalVideos, 0) /
              totalCourses
          )
        : 0;

    const avgExercises =
      totalCourses > 0
        ? Math.round(
            filteredCourses.reduce((sum, c) => sum + c.totalExercises, 0) /
              totalCourses
          )
        : 0;

    const prereqRate =
      totalCourses > 0
        ? Math.round(
            (filteredCourses.filter((c) => c.isPrerequisites).length /
              totalCourses) *
              100
          )
        : 0;

    const median = (arr: number[]) => {
      if (!arr.length) return 0;
      const a = [...arr].sort((x, y) => x - y);
      const mid = Math.floor(a.length / 2);
      return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
    };

    const medianVideos = median(filteredCourses.map((c) => c.totalVideos));
    const medianExercises = median(
      filteredCourses.map((c) => c.totalExercises)
    );

    return {
      totalCourses,
      totalStudents,
      avgVideos,
      avgExercises,
      prereqRate,
      medianVideos,
      medianExercises,
    };
  }, [filteredCourses]);

  const topFieldsByEnrollment = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredCourses.forEach((course) => {
      dist[course.field] =
        (dist[course.field] || 0) + course.totalStudentsEnrolled;
    });

    return Object.entries(dist)
      .map(([field, students]) => ({ field, students }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 8);
  }, [filteredCourses]);

  const top10Courses = useMemo(() => {
    return [...filteredCourses]
      .sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)
      .slice(0, 10)
      .map((c) => ({
        name: c.name,
        courseId: c.courseId,
        students: c.totalStudentsEnrolled,
      }));
  }, [filteredCourses]);

  const videosVsStudents = useMemo(() => {
    return filteredCourses.slice(0, 1500).map((c) => ({
      name: c.name,
      courseId: c.courseId,
      videos: c.totalVideos,
      students: c.totalStudentsEnrolled,
      exercises: c.totalExercises,
    }));
  }, [filteredCourses]);

  const prereqImpact = useMemo(() => {
    const groups = [
      {
        key: "Có prerequisites",
        items: filteredCourses.filter((c) => c.isPrerequisites),
      },
      {
        key: "Không prerequisites",
        items: filteredCourses.filter((c) => !c.isPrerequisites),
      },
    ];
    const safeAvg = (items: Course[], key: keyof Course) =>
      items.length
        ? Math.round(
            items.reduce((s, x) => s + Number(x[key] ?? 0), 0) / items.length
          )
        : 0;

    return groups.map((g) => ({
      group: g.key,
      avgStudents: safeAvg(g.items, "totalStudentsEnrolled"),
      avgVideos: safeAvg(g.items, "totalVideos"),
      avgExercises: safeAvg(g.items, "totalExercises"),
      countCourses: g.items.length,
    }));
  }, [filteredCourses]);

  const resetFilters = () => {
    setSelectedField("all");
    setSelectedSchool("all");
    setSelectedLevel("all");
    setSearchTerm("");
  };

  // Optional: show a selected course’s distribution/insights (kept minimal)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const selectedCourseStats = useMemo(() => {
    if (!selectedCourseId) return null;
    return getCourseStatistics(selectedCourseId);
  }, [selectedCourseId]);

  // Selected course info from the current filtered list
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return filteredCourses.find((c) => c.courseId === selectedCourseId) ?? null;
  }, [filteredCourses, selectedCourseId]);

  const selectedCourseDist = useMemo(() => {
    if (!selectedCourseStats) return [];
    // Ưu tiên dùng distribution nếu có
    if (Array.isArray((selectedCourseStats as any).distribution)) {
      return (selectedCourseStats as any).distribution.map((d: any) => ({
        group: d.name ?? d.group ?? "Unknown",
        value: Number(d.value ?? d.count ?? 0),
        percentage: Number(d.percentage ?? 0),
      }));
    }
    // Fallback từ groupCounts (A-E)
    const gc = (selectedCourseStats as any).groupCounts;
    if (gc && typeof gc === "object") {
      return Object.entries(gc).map(([k, v]) => ({
        group: `Group ${k}`,
        value: Number(v ?? 0),
        percentage: 0,
      }));
    }
    return [];
  }, [selectedCourseStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Dashboard Khóa học
            </h1>
            <p className="text-gray-600 mt-2">
              Tổng quan dữ liệu khóa học & các biểu đồ có giá trị cho phân tích
              (đã bỏ “Phân bố Videos theo khoảng”).
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:shadow transition"
          >
            Reset filters
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lĩnh vực
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              >
                {allFields.map((f) => (
                  <option key={f} value={f}>
                    {f === "all" ? "Tất cả lĩnh vực" : f}
                  </option>
                ))}
              </select>
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trường/Đơn vị
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              >
                {allSchools.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "Tất cả trường" : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              >
                {allLevels.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv === "all" ? "Tất cả level" : lv}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên khóa học / mô tả / mã..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-bold text-cyan-600">
              {stats.totalCourses}
            </span>{" "}
            khóa học ·{" "}
            <span className="font-bold text-blue-600">
              {stats.totalStudents.toLocaleString()}
            </span>{" "}
            học viên
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
          <Kpi
            title="Tổng khóa học"
            value={stats.totalCourses.toLocaleString()}
            accent="text-cyan-600"
          />
          <Kpi
            title="Tổng học viên"
            value={stats.totalStudents.toLocaleString()}
            accent="text-blue-600"
          />
          <Kpi
            title="TB Videos/Khóa"
            value={stats.avgVideos.toLocaleString()}
            accent="text-purple-600"
          />
          <Kpi
            title="TB Exercises/Khóa"
            value={stats.avgExercises.toLocaleString()}
            accent="text-orange-600"
          />
          <Kpi
            title="Tỷ lệ có Prereq"
            value={`${stats.prereqRate}%`}
            accent="text-emerald-600"
          />
          <Kpi
            title="Median Videos"
            value={stats.medianVideos.toLocaleString()}
            accent="text-slate-700"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top fields by enrollment */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Số Học viên theo Lĩnh vực (Top 8)
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={topFieldsByEnrollment}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  domain={[0, "dataMax"]}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="field"
                  stroke="#6b7280"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => Number(value).toLocaleString()}
                />
                <Bar dataKey="students" fill="#10b981" name="Học viên" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 courses */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top 10 Khóa học theo Số học viên
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={top10Courses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tickFormatter={(v) => Number(v).toLocaleString()} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p: any = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-sm">
                          <p className="font-bold text-gray-900 line-clamp-2">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {p.courseId}
                          </p>
                          <p className="text-sm text-blue-600">
                            {Number(p.students).toLocaleString()} học viên
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="students" fill="#3b82f6" name="Học viên" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scatter videos vs students */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Mối quan hệ: Videos ↔ Học viên
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              X: số videos · Y: số học viên · kích thước điểm: số exercises
            </p>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart
                margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="videos"
                  name="Videos"
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <YAxis
                  type="number"
                  dataKey="students"
                  name="Students"
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <ZAxis
                  type="number"
                  dataKey="exercises"
                  range={[60, 260]}
                  name="Exercises"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p: any = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-sm">
                          <p className="font-bold text-gray-900 line-clamp-2">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {p.courseId}
                          </p>
                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <div>
                              Videos:{" "}
                              <span className="font-semibold">
                                {Number(p.videos).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              Students:{" "}
                              <span className="font-semibold">
                                {Number(p.students).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              Exercises:{" "}
                              <span className="font-semibold">
                                {Number(p.exercises).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Scatter
                  name="Courses"
                  data={videosVsStudents}
                  fill="#06b6d4"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Prereq impact */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Prerequisites có ảnh hưởng tới Enrollment?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              So sánh trung bình số học viên (tooltip có thêm videos/exercises &
              số khóa).
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={prereqImpact}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="group" />
                <YAxis tickFormatter={(v) => Number(v).toLocaleString()} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p: any = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-bold text-gray-900">{p.group}</p>
                          <p className="text-sm text-purple-700">
                            Avg Students:{" "}
                            {Number(p.avgStudents).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Avg Videos: {Number(p.avgVideos).toLocaleString()} ·
                            Avg Exercises:{" "}
                            {Number(p.avgExercises).toLocaleString()} · Courses:{" "}
                            {Number(p.countCourses).toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgStudents" fill="#8b5cf6" name="Avg Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course picker (kept) */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Thống kê Khóa học Cụ thể
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Chọn một khóa học để xem thống kê phân bố (nếu bạn đã có trong
                predictionData).
              </p>
            </div>

            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full md:w-[420px] px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
            >
              <option value="">— Chọn khóa học —</option>
              {filteredCourses.slice(0, 300).map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.name} ({c.courseId})
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {selectedCourse.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    ID:{" "}
                    <span className="font-mono">{selectedCourse.courseId}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                    {selectedCourse.field}
                  </span>
                  {selectedCourse.level && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                      {selectedCourse.level}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedCourse.isPrerequisites
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {selectedCourse.isPrerequisites
                      ? "Có prerequisites"
                      : "Không prerequisites"}
                  </span>
                </div>
              </div>

              {selectedCourse.about && (
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {selectedCourse.about}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <InfoCard
                  title="Học viên đăng ký"
                  value={selectedCourse.totalStudentsEnrolled.toLocaleString()}
                />
                <InfoCard
                  title="Tổng videos"
                  value={selectedCourse.totalVideos.toLocaleString()}
                />
                <InfoCard
                  title="Tổng exercises"
                  value={selectedCourse.totalExercises.toLocaleString()}
                />
                <InfoCard
                  title="Students / Video"
                  value={
                    selectedCourse.totalVideos > 0
                      ? (
                          selectedCourse.totalStudentsEnrolled /
                          selectedCourse.totalVideos
                        ).toFixed(2)
                      : "—"
                  }
                />
                <InfoCard
                  title="Students / Exercise"
                  value={
                    selectedCourse.totalExercises > 0
                      ? (
                          selectedCourse.totalStudentsEnrolled /
                          selectedCourse.totalExercises
                        ).toFixed(2)
                      : "—"
                  }
                />
                <InfoCard
                  title="School(s)"
                  value={
                    selectedCourse.schools && selectedCourse.schools.length
                      ? selectedCourse.schools.slice(0, 3).join(", ") +
                        (selectedCourse.schools.length > 3 ? "…" : "")
                      : "—"
                  }
                />
              </div>

              {selectedCourseStats && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* KPI từ predictionData */}
                  <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Thống kê từ Prediction Data
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <div>
                        Total Users:{" "}
                        <span className="font-bold">
                          {Number(
                            (selectedCourseStats as any).totalUsers ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        Avg Satisfaction:{" "}
                        <span className="font-bold">
                          {Number(
                            (selectedCourseStats as any).avgSatisfaction ?? 0
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        Overall Group:{" "}
                        <span className="font-bold">
                          {(selectedCourseStats as any).overallGroup ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Biểu đồ phân bố group */}
                  <div className="rounded-2xl border border-gray-200 p-5 bg-white lg:col-span-2">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Phân bố nhóm (Group A–E)
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={selectedCourseDist}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          tickFormatter={(v) => Number(v).toLocaleString()}
                        />
                        <YAxis type="category" dataKey="group" width={110} />
                        <Tooltip
                          formatter={(v: any, _n, p: any) => {
                            const pct = p?.payload?.percentage;
                            return pct
                              ? [
                                  `${Number(v).toLocaleString()} (${pct}%)`,
                                  "Users",
                                ]
                              : [Number(v).toLocaleString(), "Users"];
                          }}
                        />
                        <Bar dataKey="value" fill="#6366f1" name="Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="mt-2 text-xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

function Kpi({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
        {title}
      </div>
      <div className={`text-2xl font-extrabold ${accent}`}>{value}</div>
    </div>
  );
}
