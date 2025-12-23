"use client";

import { useMemo, useState } from "react";
import { coursesData } from "@/data/courseData";
import { getCourseStatistics } from "@/data/predictionData";
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
  LineChart,
  Line,
} from "recharts";

type PhaseKey = "P1" | "P2" | "P3" | "P4";

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

type CourseStats = {
  totalUsers?: number;
  avgSatisfaction?: number;
  overallGroup?: string;
  groupCounts?: Record<string, number>;
  distribution?: Array<{ name: string; value: number; percentage?: number }>;
};

const GROUP_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  E: "#ef4444",
};

const PHASES: PhaseKey[] = ["P1", "P2", "P3", "P4"];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function safeNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fmtPct(x: number, digits = 1) {
  return `${(x * 100).toFixed(digits)}%`;
}

export default function EarlyPredictionPageV2() {
  // Cohort filters
  const [selectedField, setSelectedField] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Context controls
  const [selectedPhase, setSelectedPhase] = useState<PhaseKey>("P2");
  const [riskThreshold, setRiskThreshold] = useState<number>(0.3); // D+E rate threshold (demo)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const allFields = useMemo(() => {
    const s = new Set((coursesData as any[]).map((c) => c.field).filter(Boolean));
    return ["all", ...Array.from(s).sort()];
  }, []);

  const allSchools = useMemo(() => {
    const s = new Set<string>();
    (coursesData as any[]).forEach((c) => (c.schools ?? []).forEach((x: string) => s.add(x)));
    return ["all", ...Array.from(s).sort()];
  }, []);

  const allLevels = useMemo(() => {
    const s = new Set<string>();
    (coursesData as any[]).forEach((c) => {
      if (c.level) s.add(c.level);
    });
    return ["all", ...Array.from(s).sort()];
  }, []);

  const filteredCourses = useMemo(() => {
    return (coursesData as Course[]).filter((c) => {
      const okField = selectedField === "all" || c.field === selectedField;
      const okSchool = selectedSchool === "all" || (c.schools ?? []).includes(selectedSchool);
      const okLevel =
        selectedLevel === "all" || (c.level ?? "").toLowerCase() === selectedLevel.toLowerCase();
      const hay = `${c.name} ${c.about ?? ""} ${c.courseId}`.toLowerCase();
      const okSearch = !searchTerm || hay.includes(searchTerm.toLowerCase());
      return okField && okSchool && okLevel && okSearch;
    });
  }, [selectedField, selectedSchool, selectedLevel, searchTerm]);

  // For demo performance, only analyze a subset (still representative for UI)
  const ANALYZE_LIMIT = 500;

  const analyzedCourses = useMemo(() => {
    const sample = filteredCourses.slice(0, ANALYZE_LIMIT);
    return sample.map((c) => {
      let stats: CourseStats | null = null;
      try {
        stats = getCourseStatistics(c.courseId) as CourseStats;
      } catch {
        stats = null;
      }

      const totalUsers = safeNum(stats?.totalUsers, 0);
      const avgSatisfaction = safeNum(stats?.avgSatisfaction, 0);
      const gc = stats?.groupCounts ?? {};
      const d = safeNum(gc["D"], 0);
      const e = safeNum(gc["E"], 0);
      const atRiskRate = totalUsers > 0 ? (d + e) / totalUsers : 0;

      return {
        course: c,
        stats,
        totalUsers,
        avgSatisfaction,
        atRiskRate,
        overallGroup: stats?.overallGroup ?? "—",
      };
    });
  }, [filteredCourses]);

  // Cohort KPIs (weighted by totalUsers where available)
  const cohortKpis = useMemo(() => {
    const totalCourses = filteredCourses.length;
    const totalEnrollments = filteredCourses.reduce((s, c) => s + safeNum(c.totalStudentsEnrolled, 0), 0);

    const totalUsers = analyzedCourses.reduce((s, x) => s + x.totalUsers, 0);
    const weightedSatisfaction = analyzedCourses.reduce((s, x) => s + x.avgSatisfaction * x.totalUsers, 0);
    const avgSatisfaction = totalUsers > 0 ? weightedSatisfaction / totalUsers : 0;

    const totalAtRisk = analyzedCourses.reduce((s, x) => s + x.atRiskRate * x.totalUsers, 0);
    const atRiskRate = totalUsers > 0 ? totalAtRisk / totalUsers : 0;

    const prereqRate =
      totalCourses > 0
        ? filteredCourses.filter((c) => c.isPrerequisites).length / totalCourses
        : 0;

    return {
      totalCourses,
      totalEnrollments,
      analyzedCount: analyzedCourses.length,
      totalUsers,
      avgSatisfaction,
      atRiskRate,
      prereqRate,
    };
  }, [filteredCourses, analyzedCourses]);

  // Cohort at-risk trend by phase (mocked from atRiskRate to support early prediction UI)
  const cohortPhaseTrend = useMemo(() => {
    const base = cohortKpis.atRiskRate;
    const multipliers: Record<PhaseKey, number> = { P1: 0.92, P2: 0.97, P3: 1.0, P4: 1.05 };
    return PHASES.map((p, idx) => {
      const bump = (idx - 1) * 0.01; // tiny drift
      const risk = clamp01(base * multipliers[p] + bump);
      return { phase: p, atRisk: risk, label: fmtPct(risk) };
    });
  }, [cohortKpis.atRiskRate]);

  // Top at-risk courses list (minUsers to avoid noise)
  const atRiskCourses = useMemo(() => {
    const MIN_USERS = 20;
    return analyzedCourses
      .filter((x) => x.totalUsers >= MIN_USERS)
      .sort((a, b) => b.atRiskRate - a.atRiskRate)
      .slice(0, 12)
      .map((x) => ({
        courseId: x.course.courseId,
        name: x.course.name,
        field: x.course.field,
        totalUsers: x.totalUsers,
        avgSatisfaction: x.avgSatisfaction,
        atRiskRate: x.atRiskRate,
      }));
  }, [analyzedCourses]);

  // Field risk leaderboard
  const fieldRiskTop = useMemo(() => {
    const agg: Record<string, { users: number; atRiskUsers: number }> = {};
    analyzedCourses.forEach((x) => {
      const f = x.course.field || "Unknown";
      if (!agg[f]) agg[f] = { users: 0, atRiskUsers: 0 };
      agg[f].users += x.totalUsers;
      agg[f].atRiskUsers += x.atRiskRate * x.totalUsers;
    });

    return Object.entries(agg)
      .filter(([, v]) => v.users >= 50)
      .map(([field, v]) => ({ field, atRiskRate: v.users ? v.atRiskUsers / v.users : 0, users: v.users }))
      .sort((a, b) => b.atRiskRate - a.atRiskRate)
      .slice(0, 8);
  }, [analyzedCourses]);

  // Selected course drill-down
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return (coursesData as Course[]).find((c) => c.courseId === selectedCourseId) ?? null;
  }, [selectedCourseId]);

  const selectedCourseStats = useMemo(() => {
    if (!selectedCourseId) return null;
    try {
      return getCourseStatistics(selectedCourseId) as CourseStats;
    } catch {
      return null;
    }
  }, [selectedCourseId]);

  const selectedDist = useMemo(() => {
    const stats = selectedCourseStats;
    if (!stats) return [];
    if (Array.isArray(stats.distribution) && stats.distribution.length) {
      return stats.distribution.map((d) => ({
        group: d.name.replace("Group ", "").trim(), // "A".."E" or "Group A"
        value: safeNum(d.value, 0),
        percentage: safeNum(d.percentage, 0),
      }));
    }
    const gc = stats.groupCounts ?? {};
    return ["A", "B", "C", "D", "E"].map((k) => ({
      group: k,
      value: safeNum(gc[k], 0),
      percentage: 0,
    }));
  }, [selectedCourseStats]);

  const selectedAtRiskRate = useMemo(() => {
    const stats = selectedCourseStats;
    const totalUsers = safeNum(stats?.totalUsers, 0);
    const gc = stats?.groupCounts ?? {};
    const d = safeNum(gc["D"], 0);
    const e = safeNum(gc["E"], 0);
    return totalUsers > 0 ? (d + e) / totalUsers : 0;
  }, [selectedCourseStats]);

  const selectedPhaseTrend = useMemo(() => {
    const base = selectedAtRiskRate;
    const multipliers: Record<PhaseKey, number> = { P1: 0.9, P2: 0.95, P3: 1.0, P4: 1.08 };
    return PHASES.map((p, idx) => {
      const bump = (idx - 1) * 0.015;
      const risk = clamp01(base * multipliers[p] + bump);
      return { phase: p, atRisk: risk, label: fmtPct(risk) };
    });
  }, [selectedAtRiskRate]);

  const selectedRecommendations = useMemo(() => {
    const risk = selectedAtRiskRate;
    const avg = safeNum(selectedCourseStats?.avgSatisfaction, 0);
    const isHigh = risk >= riskThreshold;

    const actions: Array<{ title: string; detail: string; priority: "High" | "Medium" | "Low" }> = [];

    if (isHigh) {
      actions.push({
        title: "Can thiệp sớm (P1–P2)",
        detail:
          "Ưu tiên nhắc học + gợi ý lộ trình 3 ngày; tập trung học viên nhóm D/E.",
        priority: "High",
      });
      actions.push({
        title: "Tối ưu nội dung 'easy wins'",
        detail:
          "Gợi ý 1–2 video recap ngắn + 1 bài tập dễ để tăng cảm giác tiến bộ.",
        priority: "High",
      });
    } else {
      actions.push({
        title: "Theo dõi định kỳ",
        detail: "Rủi ro chưa cao. Theo dõi tiếp ở Phase tiếp theo và nhắc nhẹ.",
        priority: "Medium",
      });
    }

    if (avg < 60) {
      actions.push({
        title: "Cải thiện trải nghiệm",
        detail:
          "Avg Satisfaction thấp: rà soát khó khăn chính (bài tập, prereq, pacing), bổ sung FAQ/hint.",
        priority: "Medium",
      });
    }

    actions.push({
      title: "Kích hoạt tương tác cộng đồng",
      detail: "Khuyến khích bình luận/diễn đàn: Q&A theo tuần để giảm churn.",
      priority: "Low",
    });

    return actions.slice(0, 3);
  }, [selectedAtRiskRate, selectedCourseStats, riskThreshold]);

  const selectedDrivers = useMemo(() => {
    // Lightweight “explain” mock that matches L-S-C-T theme
    // You can later replace by SHAP/feature-importance for the selected phase/model.
    const base = clamp01(0.55 + (selectedAtRiskRate - 0.2));
    return [
      { k: "Learning (earned_score, accuracy)", v: clamp01(base * 0.9) },
      { k: "Engagement (watch_ratio, sessions)", v: clamp01(base * 0.75) },
      { k: "Social (sentiment/comments)", v: clamp01(base * 0.55) },
      { k: "Time (days_until_first_watch)", v: clamp01(base * 0.35) },
    ];
  }, [selectedAtRiskRate]);

  const resetFilters = () => {
    setSelectedField("all");
    setSelectedSchool("all");
    setSelectedLevel("all");
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
            <p className="text-gray-600 mt-2">
              Theo dõi rủi ro theo <span className="font-semibold">Phase</span>, ưu tiên can thiệp, và drill-down theo khóa học.
            </p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Pill text="Early Prediction · P1–P2" tone="blue" />
              <Pill text={`Đang phân tích: ${cohortKpis.analyzedCount}/${filteredCourses.length} khóa`} tone="gray" />
              <Pill text={`Ngưỡng rủi ro: ${fmtPct(riskThreshold, 0)}`} tone="orange" />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:shadow transition"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Cohort controls */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-8">
          <SectionTitle title="Cohort & Phase Controls" subtitle="Lọc cohort và chọn Phase để hiển thị ngữ cảnh dự đoán." />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5">
            <Select label="Lĩnh vực" value={selectedField} onChange={setSelectedField} options={allFields} />
            <Select label="Trường/Đơn vị" value={selectedSchool} onChange={setSelectedSchool} options={allSchools} />
            <Select label="Level" value={selectedLevel} onChange={setSelectedLevel} options={allLevels} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phase</label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value as PhaseKey)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên khóa học / mô tả / mã..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Risk threshold */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Ngưỡng rủi ro (D+E)</div>
              <input
                type="range"
                min={0.05}
                max={0.7}
                step={0.05}
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-2">
                Dùng để gắn cờ “At-risk”. (Demo: tính từ phân bố nhóm của predictionData)
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-800">Insight tự động</div>
              <div className="text-sm text-gray-700 mt-2 leading-relaxed">
                At-risk (D+E) của cohort hiện tại:{" "}
                <span className="font-extrabold text-orange-600">{fmtPct(cohortKpis.atRiskRate)}</span>.{" "}
                Ưu tiên can thiệp ở <span className="font-semibold">P1–P2</span> cho các khóa có rủi ro cao.
              </div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
          <StatCard title="Khóa học (cohort)" value={cohortKpis.totalCourses.toLocaleString()} tone="slate" />
          <StatCard title="Enrollments" value={cohortKpis.totalEnrollments.toLocaleString()} tone="blue" />
          <StatCard title="Total Users (sample)" value={cohortKpis.totalUsers.toLocaleString()} tone="cyan" />
          <StatCard title="Avg Satisfaction" value={cohortKpis.avgSatisfaction.toFixed(2)} tone="emerald" />
          <StatCard title="At-risk (D+E)" value={fmtPct(cohortKpis.atRiskRate)} tone="orange" />
          <StatCard title="Prereq rate" value={fmtPct(cohortKpis.prereqRate)} tone="purple" />
        </div>

        {/* Charts: trend + distribution/leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Trend by phase */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <SectionTitle
              title="Xu hướng At-risk theo Phase"
              subtitle="Theo dõi tỷ lệ nhóm D+E theo tiến độ (mock từ cohort distribution để demo UI)."
            />
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cohortPhaseTrend} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="phase" />
                  <YAxis tickFormatter={(v) => `${Number(v * 100).toFixed(0)}%`} domain={[0, 1]} />
                  <Tooltip formatter={(v: any) => fmtPct(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="atRisk" name="At-risk (D+E)" stroke="#f97316" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              Gợi ý: Nếu đường At-risk tăng dần qua phase, ưu tiên “nudges” sớm và kiểm tra nội dung/bài tập ở phase đầu.
            </div>
          </div>

          {/* Field risk leaderboard */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <SectionTitle
              title="Lĩnh vực có rủi ro cao"
              subtitle="Top 8 field theo tỷ lệ D+E (weighted theo users trong sample)."
            />
            <div className="mt-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fieldRiskTop} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Number(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="field" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any, _n, p: any) => {
                      const users = p?.payload?.users ?? 0;
                      return [`${fmtPct(Number(v))} · Users: ${Number(users).toLocaleString()}`, "At-risk"];
                    }}
                  />
                  <Bar dataKey="atRiskRate" fill="#fb923c" name="At-risk rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Intervention list */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-10">
          <SectionTitle
            title="Danh sách ưu tiên can thiệp (Top khóa học)"
            subtitle={`Gắn cờ nếu D+E ≥ ${fmtPct(riskThreshold, 0)} và đủ số mẫu. (Demo dựa trên predictionData)`}
          />

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 pr-4">Course</th>
                  <th className="py-3 pr-4">Field</th>
                  <th className="py-3 pr-4">Users</th>
                  <th className="py-3 pr-4">Avg Sat</th>
                  <th className="py-3 pr-4">At-risk (D+E)</th>
                  <th className="py-3 pr-4">Ưu tiên</th>
                  <th className="py-3 pr-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {atRiskCourses.map((c) => {
                  const flagged = c.atRiskRate >= riskThreshold;
                  const priority = flagged ? (c.atRiskRate >= riskThreshold + 0.15 ? "High" : "Medium") : "Low";
                  return (
                    <tr key={c.courseId} className="border-b last:border-b-0">
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => setSelectedCourseId(c.courseId)}
                          className="text-blue-600 font-semibold hover:underline line-clamp-1"
                          title={c.name}
                        >
                          {c.name}
                        </button>
                        <div className="text-xs text-gray-500 font-mono">{c.courseId}</div>
                      </td>
                      <td className="py-3 pr-4">{c.field}</td>
                      <td className="py-3 pr-4">{Number(c.totalUsers).toLocaleString()}</td>
                      <td className="py-3 pr-4">{Number(c.avgSatisfaction).toFixed(2)}</td>
                      <td className="py-3 pr-4">
                        <span className={flagged ? "font-extrabold text-orange-600" : "text-gray-700"}>
                          {fmtPct(c.atRiskRate)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Pill text={priority} tone={priority === "High" ? "red" : priority === "Medium" ? "orange" : "gray"} />
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => setSelectedCourseId(c.courseId)}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
                        >
                          Drill-down
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!atRiskCourses.length && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      Không có dữ liệu đủ điều kiện (hoặc cohort quá nhỏ).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Ghi chú: Đây là danh sách “course-level” (vì demo chưa có learner-level prediction). Khi có dữ liệu user_id theo phase, bảng này có thể chuyển thành “Top learners at-risk”.
          </div>
        </div>

        {/* Drill-down */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <SectionTitle
            title="Drill-down theo Khóa học"
            subtitle="Xem phân bố nhóm, xu hướng theo phase và gợi ý can thiệp."
          />

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn khóa học</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              >
                <option value="">— Chọn khóa học —</option>
                {filteredCourses.slice(0, 600).map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.name} ({c.courseId})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-800">Phase đang xem</div>
              <div className="mt-2 flex items-center justify-between">
                <Pill text={selectedPhase} tone="blue" />
                <div className="text-xs text-gray-500">Early focus: P1–P2</div>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                Ngưỡng rủi ro: <span className="font-bold">{fmtPct(riskThreshold, 0)}</span>
              </div>
            </div>
          </div>

          {!selectedCourse && (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              Chọn một khóa học để xem phân tích chi tiết.
            </div>
          )}

          {selectedCourse && (
            <div className="mt-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{selectedCourse.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ID: <span className="font-mono">{selectedCourse.courseId}</span>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Pill text={selectedCourse.field} tone="gray" />
                    {selectedCourse.level && <Pill text={selectedCourse.level} tone="blue" />}
                    <Pill
                      text={selectedCourse.isPrerequisites ? "Có prerequisites" : "Không prerequisites"}
                      tone={selectedCourse.isPrerequisites ? "orange" : "emerald"}
                    />
                  </div>
                  {selectedCourse.about && (
                    <div className="mt-4 text-gray-700 leading-relaxed max-w-3xl">
                      {selectedCourse.about}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MiniKpi title="Enrollments" value={selectedCourse.totalStudentsEnrolled.toLocaleString()} />
                  <MiniKpi title="Videos" value={selectedCourse.totalVideos.toLocaleString()} />
                  <MiniKpi title="Exercises" value={selectedCourse.totalExercises.toLocaleString()} />
                  <MiniKpi
                    title="At-risk (D+E)"
                    value={fmtPct(selectedAtRiskRate)}
                    emphasize={selectedAtRiskRate >= riskThreshold}
                  />
                </div>
              </div>

              {/* Charts + Explain + Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Distribution donut */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="text-sm font-semibold text-gray-800 mb-3">
                    Phân bố nhóm hài lòng (A–E)
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedDist.map((d) => ({ name: d.group, value: d.value }))}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                        >
                          {selectedDist.map((d) => (
                            <Cell key={d.group} fill={GROUP_COLORS[d.group] ?? "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    A tốt nhất → E kém nhất. At-risk = D + E.
                  </div>
                </div>

                {/* Phase trend */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:col-span-2">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        Xu hướng At-risk theo Phase
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Mock UI) Có thể thay bằng risk per phase thật khi có dữ liệu theo phase.
                      </div>
                    </div>
                    <Pill text={`Focus: ${selectedPhase}`} tone="blue" />
                  </div>

                  <div className="mt-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedPhaseTrend} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="phase" />
                        <YAxis tickFormatter={(v) => `${Number(v * 100).toFixed(0)}%`} domain={[0, 1]} />
                        <Tooltip formatter={(v: any) => fmtPct(Number(v))} />
                        <Legend />
                        <Line type="monotone" dataKey="atRisk" name="At-risk (D+E)" stroke="#f97316" strokeWidth={3} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Explain + actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-3">
                        Vì sao mô hình dự đoán như vậy?
                      </div>
                      <div className="space-y-3">
                        {selectedDrivers.map((d) => (
                          <div key={d.k}>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span className="font-semibold">{d.k}</span>
                              <span>{fmtPct(d.v, 0)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${Math.round(d.v * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-3">
                        * Demo. Khi có SHAP/feature-importance theo phase, thay thế trực tiếp tại đây.
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-3">Khuyến nghị can thiệp</div>
                      <div className="space-y-3">
                        {selectedRecommendations.map((a) => (
                          <ActionCard key={a.title} title={a.title} detail={a.detail} priority={a.priority} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick model note */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="text-sm font-semibold text-gray-800">Thông tin mô hình (rút gọn)</div>
                <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc pl-5">
                  <li>Dự đoán sớm tập trung Phase P1–P2 để tối đa hiệu quả can thiệp.</li>
                  <li>Nhãn được thiết kế theo 5 nhóm A–E (A tốt nhất → E kém nhất).</li>
                  <li>Hiện đang dùng dữ liệu demo từ <code className="px-2 py-0.5 bg-white border rounded">predictionData</code>; có thể thay bằng API thật.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-xs text-gray-500">
          Gợi ý tiếp theo: nếu bạn có dữ liệu learner-level (user_id, course_id, phase, proba), mình sẽ đổi bảng “Top khóa học” thành “Top học viên at-risk” và thêm timeline theo người học.
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
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
        {title}
      </div>
      <div className={`text-2xl font-extrabold ${cls}`}>{value}</div>
    </div>
  );
}

function MiniKpi({ title, value, emphasize }: { title: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`rounded-xl border ${emphasize ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"} p-3`}>
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
      <div className={`mt-1 text-lg font-extrabold ${emphasize ? "text-orange-700" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function Pill({ text, tone }: { text: string; tone: "gray" | "blue" | "emerald" | "orange" | "red" }) {
  const cls =
    tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "orange"
      ? "bg-orange-50 text-orange-700"
      : tone === "red"
      ? "bg-red-50 text-red-700"
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
  options: string[];
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
          <option key={o} value={o}>
            {o === "all" ? `Tất cả ${label.toLowerCase()}` : o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionCard({
  title,
  detail,
  priority,
}: {
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
}) {
  const tone = priority === "High" ? "red" : priority === "Medium" ? "orange" : "gray";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-gray-900">{title}</div>
        <Pill text={priority} tone={tone as any} />
      </div>
      <div className="text-sm text-gray-700 mt-2 leading-relaxed">{detail}</div>
    </div>
  );
}
