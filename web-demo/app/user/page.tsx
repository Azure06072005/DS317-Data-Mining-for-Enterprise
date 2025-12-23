"use client";

import { useMemo, useState } from "react";
import {
  userCourseSatisfactionData,
  getEnrichedUserCourses,
} from "@/data/predictionData";
import { coursesData } from "@/data/courseData";
import { SATISFACTION_GROUPS } from "@/types/prediction";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type GroupKey = "A" | "B" | "C" | "D" | "E";

type CourseRow = {
  courseId: string;
  courseName?: string;
  name?: string;
  description?: string;
  about?: string;
  field?: string;
  schools?: string[];
  level?: string;
  totalStudentsEnrolled?: number;
  totalVideos?: number;
  totalExercises?: number;
  isPrerequisites?: boolean;
};

type PredictionRow = {
  userId: string;
  courseId: string;
  satisfactionPercentage: number;
  group: GroupKey;
  courseName: string;
  field: string;
};

const GROUP_COLORS: Record<GroupKey, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  E: "#ef4444",
};

const GROUP_META: Record<GroupKey, { label: string; tone: string }> = {
  A: { label: "Rất hài lòng", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  B: { label: "Hài lòng", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  C: { label: "Trung bình", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  D: { label: "Không hài lòng", tone: "bg-orange-50 text-orange-700 border-orange-200" },
  E: { label: "Rất không hài lòng", tone: "bg-red-50 text-red-700 border-red-200" },
};

function safeNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pct(v: number, digits = 1) {
  return `${(v * 100).toFixed(digits)}%`;
}

function getCourseTitle(c: CourseRow | undefined | null) {
  if (!c) return "Unknown course";
  return c.courseName || c.name || c.courseId;
}

function getCourseDesc(c: CourseRow | undefined | null) {
  if (!c) return "";
  return c.description || c.about || "";
}

export default function EarlySatisfactionPredictionPage() {
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [focusCourseId, setFocusCourseId] = useState<string>("");
  const [focusUserId, setFocusUserId] = useState<string>("");

  const [riskThreshold, setRiskThreshold] = useState<number>(0.35);

  const courseIndex = useMemo(() => {
    const map = new Map<string, CourseRow>();
    (coursesData as CourseRow[]).forEach((c) => map.set(c.courseId, c));
    return map;
  }, []);

  const allPredictions = useMemo<PredictionRow[]>(() => {
    return (userCourseSatisfactionData as any[]).map((r) => {
      const c = courseIndex.get(String(r.courseId));
      const field = String(c?.field ?? r.field ?? "Unknown");
      return {
        userId: String(r.userId),
        courseId: String(r.courseId),
        satisfactionPercentage: safeNum(r.satisfactionPercentage, safeNum(r.satisfaction, 0)),
        group: (r.group as GroupKey) ?? "C",
        courseName: getCourseTitle(c),
        field,
      };
    });
  }, [courseIndex]);

  const allUsers = useMemo(() => {
    const s = new Set<string>();
    allPredictions.forEach((p) => s.add(p.userId));
    return Array.from(s).sort();
  }, [allPredictions]);

  const allFields = useMemo(() => {
    const s = new Set<string>();
    allPredictions.forEach((p) => s.add(p.field));
    return ["all", ...Array.from(s).sort()];
  }, [allPredictions]);

  const allCourses = useMemo(() => {
    const s = new Map<string, string>();
    allPredictions.forEach((p) => {
      if (!s.has(p.courseId)) s.set(p.courseId, p.courseName);
    });
    return [
      { id: "all", name: "Tất cả khóa học" },
      ...Array.from(s.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [allPredictions]);

  const filteredPredictions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allPredictions.filter((p) => {
      const okField = selectedField === "all" || p.field === selectedField;
      const okCourse = selectedCourseId === "all" || p.courseId === selectedCourseId;
      const okGroup = selectedGroup === "all" || p.group === (selectedGroup as GroupKey);
      const hay = `${p.userId} ${p.courseId} ${p.courseName} ${p.field}`.toLowerCase();
      const okSearch = !q || hay.includes(q);
      return okField && okCourse && okGroup && okSearch;
    });
  }, [allPredictions, selectedField, selectedCourseId, selectedGroup, searchTerm]);

  const cohortStats = useMemo(() => {
    const totalPredictions = filteredPredictions.length;
    const userSet = new Set(filteredPredictions.map((p) => p.userId));
    const uniqueUsers = userSet.size;

    const counts: Record<GroupKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    let sumSat = 0;
    filteredPredictions.forEach((p) => {
      counts[p.group] += 1;
      sumSat += safeNum(p.satisfactionPercentage, 0);
    });

    const avgSatisfaction = totalPredictions ? sumSat / totalPredictions : 0;
    const satisfied = counts.A + counts.B;
    const atRisk = counts.D + counts.E;

    return {
      totalPredictions,
      uniqueUsers,
      avgSatisfaction,
      counts,
      satisfied,
      atRisk,
      avgCoursesPerUser: uniqueUsers ? totalPredictions / uniqueUsers : 0,
    };
  }, [filteredPredictions]);

  const groupDistribution = useMemo(() => {
    return (["A", "B", "C", "D", "E"] as GroupKey[]).map((g) => ({
      name: `Group ${g}`,
      group: g,
      value: cohortStats.counts[g],
      label: SATISFACTION_GROUPS?.[g]?.label ?? GROUP_META[g].label,
    }));
  }, [cohortStats.counts]);

  const fieldRiskTop8 = useMemo(() => {
    const agg: Record<string, { n: number; atRisk: number }> = {};
    filteredPredictions.forEach((p) => {
      if (!agg[p.field]) agg[p.field] = { n: 0, atRisk: 0 };
      agg[p.field].n += 1;
      agg[p.field].atRisk += p.group === "D" || p.group === "E" ? 1 : 0;
    });

    return Object.entries(agg)
      .filter(([, v]) => v.n >= 25)
      .map(([field, v]) => ({ field, atRiskRate: v.atRisk / v.n, n: v.n }))
      .sort((a, b) => b.atRiskRate - a.atRiskRate)
      .slice(0, 8);
  }, [filteredPredictions]);

  const courseRiskTop10 = useMemo(() => {
    const agg: Record<string, { n: number; atRisk: number; name: string; field: string }> = {};
    filteredPredictions.forEach((p) => {
      if (!agg[p.courseId]) {
        agg[p.courseId] = { n: 0, atRisk: 0, name: p.courseName, field: p.field };
      }
      agg[p.courseId].n += 1;
      agg[p.courseId].atRisk += p.group === "D" || p.group === "E" ? 1 : 0;
    });

    return Object.entries(agg)
      .filter(([, v]) => v.n >= 20)
      .map(([courseId, v]) => ({
        courseId,
        name: v.name,
        field: v.field,
        users: v.n,
        atRiskRate: v.atRisk / v.n,
      }))
      .sort((a, b) => b.atRiskRate - a.atRiskRate)
      .slice(0, 10);
  }, [filteredPredictions]);

  const atRiskLearnersTop12 = useMemo(() => {
    const agg: Record<string, { n: number; atRisk: number; avgSat: number }> = {};
    filteredPredictions.forEach((p) => {
      if (!agg[p.userId]) agg[p.userId] = { n: 0, atRisk: 0, avgSat: 0 };
      agg[p.userId].n += 1;
      agg[p.userId].atRisk += p.group === "D" || p.group === "E" ? 1 : 0;
      agg[p.userId].avgSat += safeNum(p.satisfactionPercentage, 0);
    });

    return Object.entries(agg)
      .filter(([, v]) => v.n >= 2)
      .map(([userId, v]) => ({
        userId,
        courses: v.n,
        atRiskRate: v.atRisk / v.n,
        avgSat: v.avgSat / v.n,
      }))
      .sort((a, b) => b.atRiskRate - a.atRiskRate)
      .slice(0, 12);
  }, [filteredPredictions]);

  // Drill-down: Course
  const focusCourse = useMemo(() => {
    if (!focusCourseId) return null;
    return courseIndex.get(focusCourseId) ?? null;
  }, [focusCourseId, courseIndex]);

  const focusCourseRows = useMemo(() => {
    if (!focusCourseId) return [];
    return allPredictions.filter((p) => p.courseId === focusCourseId);
  }, [allPredictions, focusCourseId]);

  const focusCourseDist = useMemo(() => {
    const counts: Record<GroupKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    focusCourseRows.forEach((p) => (counts[p.group] += 1));
    return (["A", "B", "C", "D", "E"] as GroupKey[]).map((g) => ({
      name: `Group ${g}`,
      group: g,
      value: counts[g],
    }));
  }, [focusCourseRows]);

  const focusCourseAtRisk = useMemo(() => {
    const n = focusCourseRows.length;
    if (!n) return 0;
    const at = focusCourseRows.filter((p) => p.group === "D" || p.group === "E").length;
    return at / n;
  }, [focusCourseRows]);

  const focusCourseAtRiskUsers = useMemo(() => {
    return focusCourseRows
      .filter((p) => p.group === "D" || p.group === "E")
      .sort((a, b) => safeNum(a.satisfactionPercentage, 0) - safeNum(b.satisfactionPercentage, 0))
      .slice(0, 15);
  }, [focusCourseRows]);

  // Drill-down: User
  const focusUserCourses = useMemo(() => {
    if (!focusUserId) return null;
    const courses = getEnrichedUserCourses(focusUserId);
    return courses ?? [];
  }, [focusUserId]);

  const focusUserSummary = useMemo(() => {
    if (!focusUserCourses) return null;
    const n = focusUserCourses.length;
    if (!n)
      return {
        n: 0,
        avgSat: 0,
        counts: { A: 0, B: 0, C: 0, D: 0, E: 0 } as Record<GroupKey, number>,
        atRiskRate: 0,
      };

    const counts: Record<GroupKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    let sum = 0;
    focusUserCourses.forEach((c: any) => {
      const g = (c.group as GroupKey) ?? "C";
      counts[g] += 1;
      sum += safeNum(c.satisfactionPercentage, 0);
    });
    const at = (counts.D + counts.E) / n;
    return { n, avgSat: sum / n, counts, atRiskRate: at };
  }, [focusUserCourses]);

  const resetFilters = () => {
    setSelectedField("all");
    setSelectedCourseId("all");
    setSelectedGroup("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Dự đoán sớm mức độ hài lòng học viên
            </h1>
            <p className="text-gray-600 mt-2 max-w-3xl">
              Tổng hợp dự đoán theo <span className="font-semibold">User × Course</span>, phát hiện sớm nhóm{" "}
              <span className="font-semibold text-orange-600">At-risk (D+E)</span> và gợi ý can thiệp theo khóa học.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="blue" text="Early Prediction cockpit" />
              <Pill tone="gray" text={`Users: ${cohortStats.uniqueUsers.toLocaleString()}`} />
              <Pill tone="orange" text={`Ngưỡng At-risk: ${pct(riskThreshold, 0)}`} />
            </div>
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
          <SectionTitle
            title="Cohort Filters"
            subtitle="Lọc theo field / course / group và tìm kiếm theo user, course."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
            <Select
              label="Lĩnh vực"
              value={selectedField}
              onChange={setSelectedField}
              options={allFields.map((x) => ({ value: x, label: x === "all" ? "Tất cả lĩnh vực" : x }))}
            />
            <Select
              label="Khóa học"
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              options={allCourses.map((x) => ({ value: x.id, label: x.name }))}
            />
            <Select
              label="Nhóm hài lòng"
              value={selectedGroup}
              onChange={setSelectedGroup}
              options={[
                { value: "all", label: "Tất cả nhóm" },
                { value: "A", label: "Group A (Rất hài lòng)" },
                { value: "B", label: "Group B (Hài lòng)" },
                { value: "C", label: "Group C (Trung bình)" },
                { value: "D", label: "Group D (Không hài lòng)" },
                { value: "E", label: "Group E (Rất không hài lòng)" },
              ]}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="user_id / course_id / tên khóa..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Ngưỡng At-risk (tỷ lệ D+E)</div>
              <input
                type="range"
                min={0.1}
                max={0.8}
                step={0.05}
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-2">
                Dùng để gắn cờ khóa học/học viên cần ưu tiên can thiệp.
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-800">Insight nhanh</div>
              <div className="text-sm text-gray-700 mt-2 leading-relaxed">
                Cohort hiện có <span className="font-bold">{cohortStats.totalPredictions.toLocaleString()}</span>{" "}
                dự đoán trên <span className="font-bold">{cohortStats.uniqueUsers.toLocaleString()}</span>{" "}
                người học. Tỷ lệ At-risk (D+E) là{" "}
                <span className="font-extrabold text-orange-600">
                  {pct(cohortStats.atRisk / Math.max(cohortStats.totalPredictions, 1))}
                </span>.
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
          <StatCard title="Dự đoán (rows)" value={cohortStats.totalPredictions.toLocaleString()} tone="slate" />
          <StatCard title="Users" value={cohortStats.uniqueUsers.toLocaleString()} tone="blue" />
          <StatCard title="Hài lòng (A+B)" value={cohortStats.satisfied.toLocaleString()} tone="emerald" />
          <StatCard title="At-risk (D+E)" value={cohortStats.atRisk.toLocaleString()} tone="orange" />
          <StatCard title="Avg Satisfaction" value={`${cohortStats.avgSatisfaction.toFixed(1)}%`} tone="purple" />
          <StatCard title="Avg courses/user" value={cohortStats.avgCoursesPerUser.toFixed(2)} tone="cyan" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Distribution donut */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <SectionTitle
              title="Phân bố dự đoán theo nhóm (A–E)"
              subtitle="Tổng quan chất lượng trải nghiệm: A tốt nhất → E kém nhất."
            />
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {groupDistribution.map((d) => (
                      <Cell key={d.group} fill={GROUP_COLORS[d.group]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              {(["A", "B", "C", "D", "E"] as GroupKey[]).map((g) => (
                <div key={g} className={`rounded-xl border p-3 ${GROUP_META[g].tone}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider">Group {g}</div>
                  <div className="mt-1 text-lg font-extrabold text-gray-900">
                    {cohortStats.counts[g].toLocaleString()}
                  </div>
                  <div className="text-[11px] mt-1">{GROUP_META[g].label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top risky courses */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <SectionTitle
              title="Top khóa học rủi ro (D+E)"
              subtitle="Tỷ lệ At-risk theo course (lọc min sample). Click để drill-down."
            />

            <div className="mt-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseRiskTop10} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Number(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any, _n, p: any) => {
                      const users = p?.payload?.users ?? 0;
                      const field = p?.payload?.field ?? "";
                      return [`${pct(Number(v))} · Users: ${Number(users).toLocaleString()} · ${field}`, "At-risk"];
                    }}
                  />
                  <Bar dataKey="atRiskRate" fill="#f97316" name="At-risk rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Gợi ý: ưu tiên kiểm tra nội dung/bài tập, pacing, và hỗ trợ học viên cho các course có At-risk vượt ngưỡng.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {courseRiskTop10.slice(0, 6).map((c) => (
                <button
                  key={c.courseId}
                  onClick={() => setFocusCourseId(c.courseId)}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
                  title={c.name}
                >
                  Drill-down
                </button>
              ))}
            </div>
          </div>

          {/* Field risk */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <SectionTitle title="Top lĩnh vực rủi ro" subtitle="Field có tỷ lệ D+E cao (lọc min sample)." />
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fieldRiskTop8} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Number(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="field" width={160} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any, _n, p: any) => {
                      const n = p?.payload?.n ?? 0;
                      return [`${pct(Number(v))} · Rows: ${Number(n).toLocaleString()}`, "At-risk"];
                    }}
                  />
                  <Bar dataKey="atRiskRate" fill="#fb923c" name="At-risk rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top learners */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <SectionTitle title="Top học viên At-risk" subtitle="Ưu tiên can thiệp theo learner (tỷ lệ course D+E cao)." />

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Courses</th>
                    <th className="py-3 pr-4">Avg Sat</th>
                    <th className="py-3 pr-4">At-risk rate</th>
                    <th className="py-3 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskLearnersTop12.map((u) => {
                    const flagged = u.atRiskRate >= riskThreshold;
                    return (
                      <tr key={u.userId} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 font-semibold text-gray-900">{u.userId}</td>
                        <td className="py-3 pr-4">{u.courses}</td>
                        <td className="py-3 pr-4">{u.avgSat.toFixed(1)}%</td>
                        <td className="py-3 pr-4">
                          <span className={flagged ? "font-extrabold text-orange-600" : "text-gray-700"}>
                            {pct(u.atRiskRate)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => setFocusUserId(u.userId)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-800 font-semibold hover:shadow transition"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!atRiskLearnersTop12.length && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        Không đủ dữ liệu để xếp hạng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Drill-down */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-10">
          <SectionTitle title="Drill-down" subtitle="Xem chi tiết theo Khóa học hoặc theo Người học để gợi ý can thiệp." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Course drill-down */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-lg font-extrabold text-gray-900">Theo khóa học</div>
                  <div className="text-sm text-gray-500 mt-1">Phân bố nhóm + danh sách học viên rủi ro.</div>
                </div>
                <Pill
                  tone={focusCourseAtRisk >= riskThreshold ? "orange" : "gray"}
                  text={`At-risk: ${pct(focusCourseAtRisk)}`}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn khóa học</label>
                <select
                  value={focusCourseId}
                  onChange={(e) => setFocusCourseId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                >
                  <option value="">— Chọn khóa học —</option>
                  {allCourses.slice(1, 501).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {!focusCourseId && (
                <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                  Chọn một khóa học để xem phân tích.
                </div>
              )}

              {focusCourseId && (
                <div className="mt-5">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="font-bold text-gray-900">{getCourseTitle(focusCourse)}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{focusCourseId}</div>
                    {getCourseDesc(focusCourse) && (
                      <div className="text-sm text-gray-700 mt-2 leading-relaxed">{getCourseDesc(focusCourse)}</div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={focusCourseDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                            {focusCourseDist.map((d) => (
                              <Cell key={d.group} fill={GROUP_COLORS[d.group]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Khuyến nghị can thiệp</div>
                      <div className="space-y-3">
                        <ActionCard
                          priority={focusCourseAtRisk >= riskThreshold ? "High" : "Medium"}
                          title="Nudge sớm cho học viên D/E"
                          detail="Gửi nhắc học + lộ trình 3 ngày; ưu tiên video recap + bài tập dễ để tạo động lực."
                        />
                        <ActionCard
                          priority="Medium"
                          title="Tăng hỗ trợ & Q&A"
                          detail="Bổ sung FAQ/hint, tổ chức Q&A theo tuần; theo dõi phản hồi tiêu cực."
                        />
                        <ActionCard
                          priority="Low"
                          title="Rà soát prereq & pacing"
                          detail="Nếu course khó, cân nhắc thêm nội dung nền hoặc giảm độ khó bài tập đầu."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-semibold text-gray-800 mb-2">
                      Học viên At-risk trong khóa (Top {Math.min(15, focusCourseAtRiskUsers.length)})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="py-3 pr-4">User</th>
                            <th className="py-3 pr-4">Satisfaction</th>
                            <th className="py-3 pr-4">Group</th>
                            <th className="py-3 pr-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {focusCourseAtRiskUsers.map((p) => (
                            <tr key={`${p.userId}-${p.courseId}`} className="border-b last:border-b-0">
                              <td className="py-3 pr-4 font-semibold text-gray-900">{p.userId}</td>
                              <td className="py-3 pr-4">{safeNum(p.satisfactionPercentage, 0).toFixed(1)}%</td>
                              <td className="py-3 pr-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${GROUP_META[p.group].tone}`}>
                                  {p.group} · {GROUP_META[p.group].label}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <button
                                  onClick={() => setFocusUserId(p.userId)}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-800 font-semibold hover:shadow transition"
                                >
                                  Xem learner
                                </button>
                              </td>
                            </tr>
                          ))}
                          {!focusCourseAtRiskUsers.length && (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-gray-500">
                                Không có học viên D/E trong khóa này.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Learner drill-down */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-lg font-extrabold text-gray-900">Theo người học</div>
                  <div className="text-sm text-gray-500 mt-1">Tổng hợp course đã học & mức độ hài lòng dự đoán.</div>
                </div>
                <Pill
                  tone={focusUserSummary && focusUserSummary.atRiskRate >= riskThreshold ? "orange" : "gray"}
                  text={`At-risk: ${focusUserSummary ? pct(focusUserSummary.atRiskRate) : "—"}`}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn người học</label>
                <select
                  value={focusUserId}
                  onChange={(e) => setFocusUserId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                >
                  <option value="">— Chọn người học —</option>
                  {allUsers.slice(0, 2000).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {!focusUserId && (
                <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                  Chọn một người học để xem phân tích.
                </div>
              )}

              {focusUserId && focusUserSummary && (
                <div className="mt-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MiniKpi title="Courses" value={focusUserSummary.n.toLocaleString()} />
                    <MiniKpi title="Avg Sat" value={`${focusUserSummary.avgSat.toFixed(1)}%`} />
                    <MiniKpi title="At-risk rate" value={pct(focusUserSummary.atRiskRate)} emphasize={focusUserSummary.atRiskRate >= riskThreshold} />
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-3 px-4">Course</th>
                          <th className="py-3 px-4">Field</th>
                          <th className="py-3 px-4">Satisfaction</th>
                          <th className="py-3 px-4">Group</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {(focusUserCourses ?? []).map((c: any) => {
                          const g = (c.group as GroupKey) ?? "C";
                          return (
                            <tr key={c.courseId} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-gray-900">{c.courseName ?? c.name ?? c.courseId}</div>
                                <div className="text-xs text-gray-500 font-mono">{c.courseId}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                  {c.field ?? "Unknown"}
                                </span>
                              </td>
                              <td className="py-3 px-4">{safeNum(c.satisfactionPercentage, 0).toFixed(1)}%</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${GROUP_META[g].tone}`}>
                                  {g} · {SATISFACTION_GROUPS?.[g]?.label ?? GROUP_META[g].label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {(!focusUserCourses || focusUserCourses.length === 0) && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-500">
                              Không có dữ liệu khóa học cho user này.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold text-gray-800 mb-2">Khuyến nghị cho người học</div>
                    <div className="space-y-3">
                      <ActionCard
                        priority={focusUserSummary.atRiskRate >= riskThreshold ? "High" : "Medium"}
                        title="Cá nhân hóa lộ trình học"
                        detail="Gợi ý học theo mục tiêu nhỏ mỗi ngày; ưu tiên video ngắn + bài tập dễ để tạo momentum."
                      />
                      <ActionCard
                        priority="Medium"
                        title="Tăng tương tác"
                        detail="Nhắc tham gia diễn đàn/Q&A; gửi reminder theo lịch để tăng consistency."
                      />
                      <ActionCard
                        priority="Low"
                        title="Khuyến nghị course phù hợp"
                        detail="Ưu tiên khóa ít prerequisites và độ khó phù hợp với lịch sử hài lòng."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact model note */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <SectionTitle title="Ghi chú mô hình" subtitle="Tóm tắt mục tiêu early prediction và cách dùng dashboard này." />
          <ul className="mt-4 text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>
              Nhóm <span className="font-semibold">D/E</span> được xem là <span className="font-semibold text-orange-700">At-risk</span>. Ưu tiên can thiệp sớm để giảm khả năng bỏ học và tăng trải nghiệm.
            </li>
            <li>Các leaderboard (course/field/learner) giúp bạn chọn đúng nơi cần can thiệp trước.</li>
            <li>Khi có dữ liệu theo phase (P1–P4), có thể mở rộng thêm biểu đồ xu hướng theo thời gian.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold text-gray-900">{title}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function Pill({ text, tone }: { text: string; tone: "gray" | "blue" | "emerald" | "orange" }) {
  const cls =
    tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "orange"
      ? "bg-orange-50 text-orange-700"
      : "bg-gray-100 text-gray-700";
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cls}`}>{text}</span>;
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "slate" | "blue" | "cyan" | "emerald" | "orange" | "purple";
}) {
  const cls =
    tone === "blue"
      ? "text-blue-600"
      : tone === "cyan"
      ? "text-cyan-600"
      : tone === "emerald"
      ? "text-emerald-600"
      : tone === "orange"
      ? "text-orange-600"
      : tone === "purple"
      ? "text-purple-600"
      : "text-slate-700";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-extrabold ${cls}`}>{value}</div>
    </div>
  );
}

function MiniKpi({ title, value, emphasize }: { title: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`rounded-xl border ${emphasize ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"} p-4`}>
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
      <div className={`mt-1 text-lg font-extrabold ${emphasize ? "text-orange-700" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function ActionCard({ title, detail, priority }: { title: string; detail: string; priority: "High" | "Medium" | "Low" }) {
  const cls =
    priority === "High"
      ? "bg-red-50 text-red-700 border-red-200"
      : priority === "Medium"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-gray-900">{title}</div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>{priority}</span>
      </div>
      <div className="text-sm text-gray-700 mt-2 leading-relaxed">{detail}</div>
    </div>
  );
}
