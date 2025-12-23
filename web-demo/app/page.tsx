"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type PeriodKey = "P1" | "P2" | "P3" | "P4";
type MetricCell = {
  QWK: number;
  Accuracy: number;
  F1_Macro: number;
  MSE: number;
};

type MetricsRoot = {
  title?: string;
  periods?: PeriodKey[];
  metrics: Record<string, Record<string, Record<PeriodKey, MetricCell>>>;
};

type MetricsJson = MetricsRoot["metrics"];

type HomeTab = "overview" | "results" | "methods" | "data_quality";

function MetricCard({
  title,
  value,
  delta,
  deltaDirection = "up",
  deltaColor = "green",
  icon,
}: {
  title: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  deltaColor?: "green" | "yellow" | "red" | "gray";
  icon?: React.ReactNode;
}) {
  const deltaColorClass =
    deltaColor === "green"
      ? "text-emerald-400"
      : deltaColor === "yellow"
      ? "text-yellow-300"
      : deltaColor === "red"
      ? "text-red-400"
      : "text-slate-300";

  return (
    <div className="relative rounded-2xl bg-slate-950/60 border border-slate-800 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-200">{title}</div>
          <div className="mt-3 text-3xl font-extrabold text-white">{value}</div>
        </div>
        <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200">
          {icon ?? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 19V5m0 14h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 15l3-3 3 3 6-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {delta && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={deltaColorClass}>
            {deltaDirection === "up" ? "↑" : "↓"} {delta}
          </span>
        </div>
      )}
    </div>
  );
}

type ImportanceItem = { feature: string; importance: number };
type ModelName =
  | "XGBoost"
  | "CatBoost"
  | "Random Forest"
  | "TabNet (Deep Learning)";
type ModelImportanceData = Record<ModelName, ImportanceItem[]>;
type FeatureImportancePack = {
  Raw: ModelImportanceData;
  Node2Vec: ModelImportanceData;
  SMOTE: ModelImportanceData;
  Node2Vec_SMOTE: ModelImportanceData;
};

function FeatureImportanceCard({
  model,
  data,
}: {
  model: ModelName;
  data: ImportanceItem[];
}) {
  // hiển thị top 15 để giống hình
  const chartData = data.slice(0, 15);

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
      <div className="text-center font-bold text-gray-900 mb-3">{model}</div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 10, bottom: 8, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="feature"
              width={170}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="importance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FeatureImportanceSection({
  title,
  data,
}: {
  title: string;
  data: ModelImportanceData;
}) {
  const models: ModelName[] = [
    "XGBoost",
    "CatBoost",
    "Random Forest",
    "TabNet (Deep Learning)",
  ];

  return (
    <div className="mt-10">
      <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 text-center mb-6">
        Feature Importance Breakdown - {title}
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-5">
        {models.map((m) => (
          <FeatureImportanceCard key={m} model={m} data={data[m]} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<HomeTab>("overview");

  // metrics.json should be placed at: /public/artifacts/metrics.json
  const [metrics, setMetrics] = useState<MetricsJson | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const featureImportance = useMemo<FeatureImportancePack>(() => {
    const mk = (pairs: Array<[string, number]>): ImportanceItem[] =>
      pairs.map(([feature, importance]) => ({ feature, importance }));

    const raw: ModelImportanceData = {
      XGBoost: mk([
        ["total_earned_score_p4", 0.66],
        ["earned_per_attempt_p4", 0.08],
        ["avg_earned_score_p4", 0.06],
        ["correct_submissions_p4", 0.04],
        ["is_prerequisites", 0.03],
        ["max_watch_point_ratio_p4", 0.02],
        ["accuracy_p4", 0.015],
        ["sent_3_count_p4", 0.012],
        ["sent_2_count_p4", 0.011],
        ["problems_done_p4", 0.01],
        ["sent_1_count_p4", 0.009],
        ["coverage_ratio_p4", 0.008],
        ["total_attempts_p4", 0.007],
        ["exercises_touched_p4", 0.006],
        ["total_exercises", 0.005],
      ]),
      CatBoost: mk([
        ["sent_3_count_p4", 16.8],
        ["is_prerequisites", 12.1],
        ["correct_submissions_p4", 7.5],
        ["accuracy_p4", 7.2],
        ["total_earned_score_p4", 6.9],
        ["total_exercises", 6.1],
        ["sent_2_count_p4", 5.8],
        ["total_videos", 4.2],
        ["sent_1_count_p4", 3.6],
        ["total_comments_p4", 3.4],
        ["earned_per_attempt_p4", 2.9],
        ["exercises_touched_p4", 2.1],
        ["avg_earned_score_p4", 1.8],
        ["total_students_enrolled", 1.4],
        ["num_fields", 1.1],
      ]),
      "Random Forest": mk([
        ["total_earned_score_p4", 0.72],
        ["accuracy_p4", 0.06],
        ["sent_3_count_p4", 0.05],
        ["sent_2_count_p4", 0.04],
        ["is_prerequisites", 0.03],
        ["total_videos", 0.02],
        ["sent_1_count_p4", 0.02],
        ["total_exercises", 0.015],
        ["correct_submissions_p4", 0.012],
        ["earned_per_attempt_p4", 0.01],
        ["total_comments_p4", 0.009],
        ["exercises_touched_p4", 0.008],
        ["total_attempts_p4", 0.007],
        ["problems_done_p4", 0.006],
        ["num_fields", 0.005],
      ]),
      "TabNet (Deep Learning)": mk([
        ["sent_2_count_p2", 0.32],
        ["sent_3_count_p2", 0.26],
        ["avg_earned_score_p4", 0.11],
        ["sent_3_count_p4", 0.05],
        ["total_attempts_p2", 0.04],
        ["problems_done_p2", 0.035],
        ["avg_problem_score_p1", 0.03],
        ["total_comments_p2", 0.028],
        ["total_earned_score_p3", 0.025],
        ["sent_2_count_p3", 0.022],
        ["correct_submissions_p2", 0.02],
        ["coverage_ratio_p1", 0.018],
        ["problems_done_p4", 0.016],
        ["exercises_touched_p3", 0.014],
        ["max_watch_point_ratio_p1", 0.012],
      ]),
    };

    // Node2Vec: thêm vài embedding như combined_emb_*
    const node2vec: ModelImportanceData = {
      ...raw,
      CatBoost: mk([
        ["sent_3_count_p4", 14.8],
        ["is_prerequisites", 11.2],
        ["correct_submissions_p4", 9.8],
        ["total_earned_score_p4", 8.0],
        ["accuracy_p4", 6.1],
        ["sent_2_count_p4", 4.8],
        ["total_comments_p4", 4.2],
        ["sent_1_count_p4", 3.7],
        ["earned_per_attempt_p4", 3.1],
        ["total_exercises", 2.9],
        ["total_videos", 2.4],
        ["combined_emb_11", 1.6],
        ["combined_emb_4", 1.3],
        ["combined_emb_9", 1.1],
        ["num_fields", 0.9],
      ]),
      "Random Forest": mk([
        ["total_earned_score_p4", 0.73],
        ["accuracy_p4", 0.06],
        ["sent_2_count_p4", 0.04],
        ["sent_3_count_p4", 0.03],
        ["is_prerequisites", 0.02],
        ["combined_emb_2", 0.015],
        ["combined_emb_7", 0.012],
        ["combined_emb_11", 0.01],
        ["combined_emb_4", 0.009],
        ["correct_submissions_p4", 0.008],
        ["total_attempts_p4", 0.007],
        ["total_comments_p4", 0.006],
        ["exercises_touched_p4", 0.005],
        ["problems_done_p4", 0.004],
        ["sent_1_count_p4", 0.003],
      ]),
      "TabNet (Deep Learning)": mk([
        ["combined_emb_8", 0.15],
        ["correct_submissions_p4", 0.12],
        ["problems_done_p3", 0.09],
        ["problems_done_p2", 0.06],
        ["interactions_per_video_p4", 0.05],
        ["total_earned_score_p4", 0.045],
        ["total_earned_score_p3", 0.04],
        ["course_watch_ratio_p3", 0.035],
        ["total_comments_p4", 0.032],
        ["earned_per_attempt_p1", 0.028],
        ["avg_earned_score_p4", 0.024],
        ["interactions_per_video_p1", 0.022],
        ["days_until_first_watch_p2", 0.02],
        ["accuracy_p2", 0.018],
        ["fast_forward_per_watch_p2", 0.016],
      ]),
    };

    // SMOTE: nhấn mạnh accuracy/earned_per_attempt
    const smote: ModelImportanceData = {
      XGBoost: mk([
        ["accuracy_p4", 0.4],
        ["total_earned_score_p4", 0.15],
        ["correct_submissions_p4", 0.12],
        ["problems_done_p4", 0.1],
        ["max_watch_point_ratio_p4", 0.03],
        ["earned_per_attempt_p4", 0.025],
        ["avg_earned_score_p4", 0.02],
        ["exercises_touched_p4", 0.018],
        ["total_earned_score_p3", 0.014],
        ["sent_3_count_p4", 0.012],
        ["sent_1_count_p4", 0.01],
        ["total_attempts_p4", 0.008],
        ["total_comments_p4", 0.007],
        ["sent_2_count_p4", 0.006],
        ["max_watch_point_ratio_p2", 0.005],
      ]),
      CatBoost: mk([
        ["sent_3_count_p4", 20.0],
        ["correct_submissions_p4", 10.2],
        ["accuracy_p4", 9.6],
        ["total_earned_score_p4", 8.1],
        ["earned_per_attempt_p4", 6.7],
        ["exercises_touched_p4", 5.8],
        ["sent_1_count_p4", 4.0],
        ["avg_earned_score_p4", 3.2],
        ["total_comments_p4", 2.9],
        ["problems_done_p4", 2.5],
        ["total_attempts_p4", 2.1],
        ["sent_2_count_p4", 1.6],
        ["avg_problem_score_p1", 1.1],
        ["sent_3_count_p3", 0.9],
        ["total_comments_p1", 0.8],
      ]),
      "Random Forest": mk([
        ["accuracy_p4", 0.79],
        ["total_earned_score_p4", 0.12],
        ["sent_3_count_p4", 0.03],
        ["earned_per_attempt_p4", 0.02],
        ["exercises_touched_p4", 0.01],
        ["sent_2_count_p4", 0.008],
        ["sent_1_count_p4", 0.007],
        ["correct_submissions_p3", 0.006],
        ["total_comments_p4", 0.005],
        ["avg_problem_score_p1", 0.004],
        ["problems_done_p4", 0.003],
        ["total_comments_p3", 0.0025],
        ["total_comments_p2", 0.002],
        ["accuracy_p3", 0.0018],
        ["total_attempts_p4", 0.0016],
      ]),
      "TabNet (Deep Learning)": mk([
        ["earned_per_attempt_p4", 0.16],
        ["accuracy_p4", 0.14],
        ["problems_done_p4", 0.1],
        ["correct_submissions_p4", 0.085],
        ["exercises_touched_p3", 0.08],
        ["earned_per_attempt_p2", 0.035],
        ["sent_3_count_p3", 0.03],
        ["avg_earned_score_p4", 0.028],
        ["total_comments_p4", 0.026],
        ["correct_submissions_p3", 0.022],
        ["weighted_watch_ratio_p2", 0.02],
        ["course_watch_ratio_p3", 0.018],
        ["total_comments_p1", 0.017],
        ["sent_2_count_p2", 0.015],
        ["avg_earned_ratio_p4", 0.013],
      ]),
    };

    const node2vec_smote: ModelImportanceData = {
      ...smote,
      CatBoost: mk([
        ["sent_3_count_p4", 12.0],
        ["accuracy_p4", 11.5],
        ["correct_submissions_p4", 10.8],
        ["total_earned_score_p4", 6.0],
        ["exercises_touched_p4", 5.1],
        ["combined_emb_11", 4.5],
        ["earned_per_attempt_p4", 4.2],
        ["combined_emb_4", 3.9],
        ["problems_done_p4", 3.6],
        ["sent_1_count_p4", 3.2],
        ["avg_earned_score_p4", 2.8],
        ["combined_emb_2", 2.2],
        ["combined_emb_8", 1.9],
        ["sent_2_count_p4", 1.6],
        ["combined_emb_10", 1.3],
      ]),
      "Random Forest": mk([
        ["accuracy_p4", 0.72],
        ["total_earned_score_p4", 0.12],
        ["sent_3_count_p4", 0.03],
        ["combined_emb_0", 0.015],
        ["combined_emb_11", 0.012],
        ["combined_emb_2", 0.01],
        ["sent_2_count_p4", 0.008],
        ["combined_emb_4", 0.007],
        ["exercises_touched_p4", 0.006],
        ["correct_submissions_p4", 0.005],
        ["combined_emb_5", 0.004],
        ["combined_emb_8", 0.0035],
        ["combined_emb_13", 0.003],
        ["combined_emb_10", 0.0026],
        ["combined_emb_7", 0.0022],
      ]),
      "TabNet (Deep Learning)": mk([
        ["total_earned_score_p4", 0.23],
        ["exercises_touched_p4", 0.15],
        ["avg_earned_score_p3", 0.09],
        ["sent_3_count_p4", 0.08],
        ["avg_problem_score_p2", 0.06],
        ["sent_2_count_p4", 0.05],
        ["rewind_per_watch_p3", 0.04],
        ["interactions_per_video_p2", 0.038],
        ["accuracy_p4", 0.03],
        ["combined_emb_5", 0.022],
        ["problems_done_p2", 0.018],
        ["sent_3_count_p2", 0.016],
        ["combined_emb_12", 0.014],
        ["total_attempts_p4", 0.012],
        ["max_watch_point_ratio_p2", 0.01],
      ]),
    };

    return {
      Raw: raw,
      Node2Vec: node2vec,
      SMOTE: smote,
      Node2Vec_SMOTE: node2vec_smote,
    };
  }, []);

  type FIView = keyof FeatureImportancePack; // "Raw" | "Node2Vec" | "SMOTE" | "Node2Vec_SMOTE"

  const fiOptions = useMemo<FIView[]>(
    () => ["Raw", "Node2Vec", "SMOTE", "Node2Vec_SMOTE"],
    []
  );

  const [selectedFI, setSelectedFI] = useState<FIView>("Raw");

  const datasetOptions = useMemo(() => Object.keys(metrics ?? {}), [metrics]);
  const [selectedDataset, setSelectedDataset] = useState<string>("Node2Vec");
  const modelOptions = useMemo(
    () =>
      Object.keys(
        (metrics?.[selectedDataset] ?? {}) as Record<string, unknown>
      ),
    [metrics, selectedDataset]
  );
  const [selectedModel, setSelectedModel] = useState<string>("Ensemble");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMetricsError(null);
        const res = await fetch("/artifacts/metrics.json", {
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error(`Không tải được metrics.json (HTTP ${res.status})`);
        const json = (await res.json()) as MetricsRoot;
        if (cancelled) return;
        setMetrics(json.metrics);
      } catch (e: any) {
        if (cancelled) return;
        setMetrics(null);
        setMetricsError(e?.message ?? "Không tải được metrics.json");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep selections valid when metrics loads/changes
  useEffect(() => {
    if (!metrics) return;
    if (datasetOptions.length && !metrics[selectedDataset]) {
      setSelectedDataset(datasetOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics]);

  useEffect(() => {
    if (!metrics) return;
    const models = Object.keys(metrics[selectedDataset] ?? {});
    if (models.length && !models.includes(selectedModel)) {
      setSelectedModel(models[0]);
    }
  }, [metrics, selectedDataset, selectedModel]);

  // ----- Data quality demo data (replace with your own API/JSON later) -----
  const hard = useMemo(
    () => ({
      completeness: {
        value: 100,
        delta: 12.5,
        dir: "up" as const,
        color: "green" as const,
      },
      consistency: {
        value: 100,
        delta: 7.8,
        dir: "up" as const,
        color: "green" as const,
      },
      timeliness: {
        value: 81.5,
        delta: 2.3,
        dir: "up" as const,
        color: "green" as const,
      },
      overall: {
        value: 85.93,
        delta: 5.6,
        dir: "up" as const,
        color: "green" as const,
      },
    }),
    []
  );

  const reliability = useMemo(
    () => ({
      accuracy: 84,
      f1_macro: 40,
      varAcc: { train: 0.38, test: 0.24 },
      varF1: { train: 5.76, test: 5.44 },
      notes: [
        "Chỉ số Accuracy cao nhưng F1 macro thấp và F1 qua các fold bị lệch nhiều hơn Accuracy.",
        "Dữ liệu mất cân bằng cần cải thiện.",
      ],
    }),
    []
  );

  const foldData = useMemo(
    () => [
      {
        fold: "Fold 1",
        accTrain: 73.2,
        accValid: 72.8,
        f1Train: 42.0,
        f1Valid: 41.0,
      },
      {
        fold: "Fold 2",
        accTrain: 72.9,
        accValid: 72.4,
        f1Train: 45.8,
        f1Valid: 43.1,
      },
      {
        fold: "Fold 3",
        accTrain: 73.5,
        accValid: 73.0,
        f1Train: 39.8,
        f1Valid: 45.2,
      },
      {
        fold: "Fold 4",
        accTrain: 88.2,
        accValid: 74.0,
        f1Train: 39.6,
        f1Valid: 39.4,
      },
      {
        fold: "Fold 5",
        accTrain: 73.1,
        accValid: 72.9,
        f1Train: 39.5,
        f1Valid: 39.2,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Logos */}
          <div className="flex items-center justify-center gap-10 mb-12 flex-wrap">
            <Image
              src="/xuetangx-trn-sq.png"
              alt="XuetangX"
              width={100}
              height={50}
              className="object-contain brightness-0 invert"
            />
            <Image
              src="/GMA-new-logo.png"
              alt="Global MOOC Alliance"
              width={100}
              height={50}
              className="object-contain brightness-0 invert"
            />
            <Image
              src="/Logo_UIT_updated.svg.png"
              alt="UIT"
              width={100}
              height={50}
              className="object-contain brightness-0 invert"
            />
            <Image
              src="/Tsinghua_University_Logo.svg.png"
              alt="Tsinghua"
              width={100}
              height={50}
              className="object-contain brightness-0 invert"
            />
          </div>

          <div className="text-center space-y-8 py-10">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              EduPredict: Hệ thống Dự báo Sớm Hài lòng
            </h1>
            <p className="text-2xl text-blue-100 max-w-4xl mx-auto font-light">
              Khai thác dữ liệu hành vi MOOC-CubeX để dự đoán trải nghiệm học
              viên thông qua mô hình học máy tiên tiến.
            </p>
            <div className="pt-8 border-t border-blue-400/30 inline-block w-full max-w-2xl">
              <p className="text-xl font-medium text-blue-50">
                Khai thác dữ liệu doanh nghiệp (DS317)
              </p>
              <p className="text-blue-200">
                Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM
              </p>
            </div>
          </div>
        </div>

        {/* Wave Effect */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-20"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">3.3M+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
              Học viên
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">296M+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
              Bản ghi hành vi
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">126+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
              Đặc trưng huấn luyện
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">4 Phase</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
              Dự báo sớm
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex flex-wrap border-b border-gray-100 bg-gray-50/50">
            {(
              ["overview", "results", "methods", "data_quality"] as HomeTab[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 md:px-8 py-6 text-lg font-bold transition-all uppercase tracking-wide ${
                  activeTab === tab
                    ? "bg-white text-blue-600 border-b-4 border-blue-600"
                    : "text-gray-400 hover:text-blue-500"
                }`}
              >
                {tab === "overview"
                  ? "Chi tiết đề tài"
                  : tab === "results"
                  ? "Kết quả phân tích"
                  : tab === "methods"
                  ? "Phương pháp & Kỹ thuật"
                  : "Chất lượng dữ liệu"}
              </button>
            ))}
          </div>

          <div className="p-10 md:p-16">
            {activeTab === "overview" && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
                    Mục tiêu Dự án
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Dự án giải quyết vấn đề cốt lõi trong MOOCs:{" "}
                    <strong>Sự thiếu hụt phản hồi tức thời</strong>. Bằng cách
                    sử dụng dữ liệu hành vi gián tiếp, EduPredict xây dựng mô
                    hình phân lớp 5 mức độ hài lòng, cho phép giảng viên can
                    thiệp ngay khi học viên có dấu hiệu chán nản.
                  </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Dữ liệu MOOC-CubeX
                    </h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">✔</span>
                        <span>
                          4,216 khóa học đa ngành (Khoa học máy tính chiếm ưu
                          thế).
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">✔</span>
                        <span>
                          230,000+ video bài giảng và 358,000+ bài tập thực
                          hành.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">✔</span>
                        <span>
                          Dữ liệu tương tác phong phú: Xem video, nộp bài, bình
                          luận, và đồ thị khái niệm.
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">
                      Ý nghĩa Kinh doanh
                    </h3>
                    <p className="text-blue-800 leading-relaxed">
                      Giảm tỷ lệ <strong>Churn Rate</strong> thông qua dự báo
                      sớm. Tối ưu hóa chi phí vận hành bằng cách tập trung nguồn
                      lực chăm sóc vào nhóm học viên có rủi ro không hài lòng
                      cao.
                    </p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
                    Hiệu suất Mô hình & Chỉ số
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    Kết quả thực nghiệm tập trung vào khả năng phân loại trên
                    tập dữ liệu mất cân bằng, nơi nhãn mức độ 2 (Hài lòng) chiếm
                    ưu thế áp đảo <strong>85.9%</strong>.
                  </p>

                  {/* Metrics (loaded from /public/artifacts/metrics.json) */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Bảng chỉ số (QWK, Accuracy, F1_Macro, MSE)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Nguồn:{" "}
                          <code className="font-mono">
                            /public/artifacts/metrics.json
                          </code>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Dataset
                          </label>
                          <select
                            value={selectedDataset}
                            onChange={(e) => setSelectedDataset(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            {datasetOptions.length ? (
                              datasetOptions.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))
                            ) : (
                              <option value="">Chưa có dữ liệu</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Model
                          </label>
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            {modelOptions.length ? (
                              modelOptions.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))
                            ) : (
                              <option value="">Chưa có dữ liệu</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {metricsError && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {metricsError}
                        <div className="text-red-600 mt-1">
                          Hãy chắc chắn bạn đã thêm file{" "}
                          <code className="font-mono">metrics.json</code> vào{" "}
                          <code className="font-mono">public/artifacts/</code>.
                        </div>
                      </div>
                    )}

                    {!metricsError && !metrics && (
                      <div className="mt-4 text-sm text-gray-500">
                        Đang tải metrics.json…
                      </div>
                    )}

                    {!metricsError && metrics && (
                      <>
                        {(() => {
                          const selected = metrics?.[selectedDataset]?.[
                            selectedModel
                          ] as Record<PeriodKey, MetricCell> | undefined;
                          const p4 = selected?.P4;
                          return (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">
                                    P4 · QWK
                                  </div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.QWK.toFixed(4) : "–"}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">
                                    P4 · Accuracy
                                  </div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.Accuracy.toFixed(4) : "–"}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">
                                    P4 · F1_Macro
                                  </div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.F1_Macro.toFixed(4) : "–"}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">
                                    P4 · MSE
                                  </div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.MSE.toFixed(4) : "–"}
                                  </div>
                                </div>
                              </div>

                              <div className="overflow-x-auto mt-6">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                      <th className="py-3 pr-4">Period</th>
                                      <th className="py-3 pr-4">QWK</th>
                                      <th className="py-3 pr-4">Accuracy</th>
                                      <th className="py-3 pr-4">F1_Macro</th>
                                      <th className="py-3 pr-4">MSE</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-gray-800">
                                    {(
                                      ["P1", "P2", "P3", "P4"] as PeriodKey[]
                                    ).map((p) => {
                                      const cell = selected?.[p];
                                      return (
                                        <tr
                                          key={p}
                                          className="border-b last:border-b-0"
                                        >
                                          <td className="py-3 pr-4 font-semibold">
                                            {p}
                                          </td>
                                          <td className="py-3 pr-4 font-mono">
                                            {cell ? cell.QWK.toFixed(4) : "–"}
                                          </td>
                                          <td className="py-3 pr-4 font-mono">
                                            {cell
                                              ? cell.Accuracy.toFixed(4)
                                              : "–"}
                                          </td>
                                          <td className="py-3 pr-4 font-mono">
                                            {cell
                                              ? cell.F1_Macro.toFixed(4)
                                              : "–"}
                                          </td>
                                          <td className="py-3 pr-4 font-mono">
                                            {cell ? cell.MSE.toFixed(4) : "–"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </section>

                <section className="bg-gray-900 p-10 rounded-2xl text-white">
                  <h3 className="text-2xl font-bold mb-6">
                    Phân tích Đặc trưng (Feature Importance)
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Các yếu tố quyết định sự hài lòng của học viên:
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="w-32 text-sm font-semibold">
                        Earned Score
                      </span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden ml-4">
                        <div className="w-[90%] h-full bg-blue-500"></div>
                      </div>
                      <span className="ml-4 text-blue-400 font-bold">
                        Cao nhất
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-sm font-semibold">
                        Video Session
                      </span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden ml-4">
                        <div className="w-[75%] h-full bg-indigo-500"></div>
                      </div>
                      <span className="ml-4 text-indigo-400 font-bold">
                        Quan trọng
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-sm font-semibold">
                        Sentiment
                      </span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden ml-4">
                        <div className="w-[60%] h-full bg-purple-500"></div>
                      </div>
                      <span className="ml-4 text-purple-400 font-bold">
                        Trung bình
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "methods" && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-purple-600 rounded-full mr-4"></span>
                    Quy trình Gán nhãn & Xử lý
                  </h2>
                  <div className="bg-white border border-purple-100 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">
                      Công thức Satisfaction Score (L-S-C-T)
                    </h3>
                    <div className="p-6 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 font-mono text-center text-lg md:text-2xl">
                      Score = 0.60*L + 0.15*S + 0.15*C + 0.10*T
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <p className="font-bold">L</p>
                        <p className="text-xs text-gray-500">
                          Learning (Học tập)
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">S</p>
                        <p className="text-xs text-gray-500">
                          Sentiment (Cảm xúc)
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">C</p>
                        <p className="text-xs text-gray-500">
                          Course Resource (tài nguyên khóa học)
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">T</p>
                        <p className="text-xs text-gray-500">
                          Time (Thời gian)
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Kiến trúc Dự báo Sớm (Early Prediction)
                  </h3>
                  <div className="relative border-l-4 border-blue-200 ml-4 pl-10 space-y-12">
                    <div className="relative">
                      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
                      <h4 className="font-bold text-gray-900">
                        Phase 1 (0-25%)
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Dự báo sơ khởi dựa trên những tương tác đầu tiên.
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
                      <h4 className="font-bold text-gray-900">
                        Phase 2 (0-50%)
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Giai đoạn can thiệp vàng để cải thiện tỷ lệ hài lòng.
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-gray-300 rounded-full border-4 border-white"></div>
                      <h4 className="font-bold text-gray-900">Phase 3 & 4</h4>
                      <p className="text-gray-500 text-sm">
                        Củng cố mô hình và đánh giá kết quả trọn đời khóa học.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Hạ tầng Công nghệ (Tech Stack)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">
                      React 19 / Tailwind.css
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">
                      PySpark
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">
                      Next.js 16
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">
                      ML/DL models
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "data_quality" && (
              <div className="animate-fadeIn">
                <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 overflow-hidden">
                  <div className="p-8 md:p-10">
                    {/* Hard Dimension */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-cyan-300">
                        Chất lượng bộ dữ liệu
                      </h2>
                      <div className="text-xs md:text-sm text-slate-300">
                        Tổng hợp theo batch gần nhất
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                      <MetricCard
                        title="Completeness - dataset"
                        value={`${hard.completeness.value.toFixed(2)}%`}
                        delta={`${hard.completeness.delta.toFixed(1)}%`}
                        deltaDirection={hard.completeness.dir}
                        deltaColor={hard.completeness.color}
                        icon={
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 20V10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M18 20V4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M6 20v-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        }
                      />
                      <MetricCard
                        title="Consistency - dataset"
                        value={`${hard.consistency.value.toFixed(2)}%`}
                        delta={`${hard.consistency.delta.toFixed(1)}%`}
                        deltaDirection={hard.consistency.dir}
                        deltaColor={hard.consistency.color}
                        icon={
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M8 17l-3-3 3-3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M16 7l3 3-3 3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 14h14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M19 10H5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        }
                      />
                      <MetricCard
                        title="ACC - DQ"
                        value={`${hard.timeliness.value.toFixed(0)}%`}
                        delta={`${hard.timeliness.delta.toFixed(1)}%`}
                        deltaDirection={hard.timeliness.dir}
                        deltaColor={hard.timeliness.color}
                        icon={
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 7v6l4 2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        }
                      />
                      <MetricCard
                        title="ACC - DQ with SMOTE"
                        value={`${hard.overall.value.toFixed(2)}%`}
                        delta={`${hard.overall.delta.toFixed(1)}%`}
                        deltaDirection={hard.overall.dir}
                        deltaColor={hard.overall.color}
                      />
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-950/50 border border-slate-800 p-6">
                      <div className="flex items-center gap-2 text-slate-200 font-bold">
                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                          i
                        </span>
                        Nhận xét chung:
                      </div>
                      <div className="mt-3 text-slate-200 leading-relaxed">
                        <p className="mb-2">
                          <strong>Consistency</strong>: đạt chuẩn rất cao (100%)
                          → pipeline Gold đã kiểm soát tốt quy tắc, schema,
                          khóa, và logic thời gian.
                        </p>
                        <p>
                          <strong>Completeness</strong>: tốt nhưng chưa đạt
                          chuẩn ML-ready do một số feature quan trọng bị thiếu
                          cực lớn (các chỉ số hiệu suất làm bài).
                        </p>
                      </div>
                    </div>

                    {/* Soft Dimension */}
                    <div className="mt-12 flex items-center justify-between gap-4 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-cyan-300">
                        Soft Dimension
                      </h2>
                      <div className="text-xs md:text-sm text-slate-300">
                        Độ ổn định theo K-Fold
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                      {/* Reliability card */}
                      <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6">
                        <div className="text-sm font-semibold text-slate-200">
                          Reliability
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-slate-400 font-semibold">
                              Accuracy
                            </div>
                            <div className="mt-2 text-3xl font-extrabold">
                              {reliability.accuracy}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 font-semibold">
                              F1 macro
                            </div>
                            <div className="mt-2 text-3xl font-extrabold">
                              {reliability.f1_macro}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 text-sm text-slate-200 space-y-2">
                          <div>
                            Độ lệch phương sai Accuracy:{" "}
                            <span className="font-mono text-slate-100">
                              {reliability.varAcc.train.toFixed(2)} (train)
                            </span>
                            ,{" "}
                            <span className="font-mono text-slate-100">
                              {reliability.varAcc.test.toFixed(2)} (test)
                            </span>
                          </div>
                          <div>
                            Độ lệch phương sai F1:{" "}
                            <span className="font-mono text-slate-100">
                              {reliability.varF1.train.toFixed(2)} (train)
                            </span>
                            ,{" "}
                            <span className="font-mono text-slate-100">
                              {reliability.varF1.test.toFixed(2)} (test)
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 space-y-2 text-sm">
                          <div className="text-slate-200 font-semibold">
                            Nhận xét:
                          </div>
                          <ul className="list-disc pl-5 text-slate-200 space-y-2">
                            <li>{reliability.notes[0]}</li>
                            <li className="text-red-300 font-semibold">
                              {reliability.notes[1]}
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Chart card */}
                      <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6 lg:col-span-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-200">
                              Train vs Validation Metrics per Fold
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              So sánh Accuracy & F1 theo từng fold để phát hiện
                              overfit / độ lệch ổn định.
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 h-[320px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={foldData}
                              margin={{ top: 8, right: 20, bottom: 8, left: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(148,163,184,0.25)"
                              />
                              <XAxis
                                dataKey="fold"
                                stroke="rgba(226,232,240,0.8)"
                              />
                              <YAxis
                                stroke="rgba(226,232,240,0.8)"
                                domain={[30, 95]}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(15, 23, 42, 0.95)",
                                  border: "1px solid rgba(148, 163, 184, 0.25)",
                                  borderRadius: "12px",
                                  color: "white",
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="accTrain"
                                name="Accuracy (Train)"
                                stroke="#60a5fa"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="accValid"
                                name="Accuracy (Valid)"
                                stroke="#93c5fd"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="f1Train"
                                name="F1 Score (Train)"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="f1Valid"
                                name="F1 Score (Valid)"
                                stroke="#fbbf24"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Feature Importance (Selectable) */}
                    <div className="mt-12">
                      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                          <div className="text-2xl md:text-3xl font-extrabold text-cyan-300">
                            Feature Importance
                          </div>
                          <div className="text-xs md:text-sm text-slate-300 mt-1">
                            Chọn cấu hình đặc trưng để xem 4 biểu đồ (XGBoost,
                            CatBoost, Random Forest, TabNet).
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Bộ đặc trưng
                            </label>
                            <select
                              value={selectedFI}
                              onChange={(e) =>
                                setSelectedFI(e.target.value as FIView)
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
                            >
                              {fiOptions.map((opt) => (
                                <option
                                  key={opt}
                                  value={opt}
                                  className="text-black"
                                >
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 1 “hình” = 4 biểu đồ */}
                      <div className="mt-6">
                        <FeatureImportanceSection
                          title={selectedFI}
                          data={featureImportance[selectedFI]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
            Dự án EduPredict © 2025
          </p>
          <p className="text-gray-500 mt-2">
            Xây dựng trên nền tảng MOOC-CubeX & Khoa học Dữ liệu Tiên tiến
          </p>
        </div>
      </footer>
    </div>
  );
}
