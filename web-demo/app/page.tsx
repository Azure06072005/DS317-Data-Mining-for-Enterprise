"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'methods'>('overview');

  // metrics.json should be placed at: /public/artifacts/metrics.json
  const [metrics, setMetrics] = useState<MetricsJson | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const datasetOptions = useMemo(() => Object.keys(metrics ?? {}), [metrics]);
  const [selectedDataset, setSelectedDataset] = useState<string>("Node2Vec");
  const modelOptions = useMemo(
    () => Object.keys((metrics?.[selectedDataset] ?? {}) as Record<string, unknown>),
    [metrics, selectedDataset]
  );
  const [selectedModel, setSelectedModel] = useState<string>("Ensemble");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMetricsError(null);
        const res = await fetch("/artifacts/metrics.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Không tải được metrics.json (HTTP ${res.status})`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Logos */}
          <div className="flex items-center justify-center gap-10 mb-12 flex-wrap">
            <Image src="/xuetangx-trn-sq.png" alt="XuetangX" width={100} height={50} className="object-contain brightness-0 invert" />
            <Image src="/GMA-new-logo.png" alt="Global MOOC Alliance" width={100} height={50} className="object-contain brightness-0 invert" />
            <Image src="/Logo_UIT_updated.svg.png" alt="UIT" width={100} height={50} className="object-contain brightness-0 invert" />
            <Image src="/Tsinghua_University_Logo.svg.png" alt="Tsinghua" width={100} height={50} className="object-contain brightness-0 invert" />
          </div>

          <div className="text-center space-y-8 py-10">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              EduPredict: Hệ thống Dự báo Sớm Hài lòng
            </h1>
            <p className="text-2xl text-blue-100 max-w-4xl mx-auto font-light">
              Khai thác dữ liệu hành vi MOOC-CubeX để dự đoán trải nghiệm học viên thông qua mô hình học máy tiên tiến.
            </p>
            <div className="pt-8 border-t border-blue-400/30 inline-block w-full max-w-2xl">
              <p className="text-xl font-medium text-blue-50">Khai thác dữ liệu doanh nghiệp (DS317)</p>
              <p className="text-blue-200">Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM</p>
            </div>
          </div>
        </div>

        {/* Wave Effect */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">3.3M+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Học viên</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">296M+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Bản ghi hành vi</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">110</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Đặc trưng huấn luyện</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">4 Phase</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Dự báo sớm</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex flex-wrap border-b border-gray-100 bg-gray-50/50">
            {['overview', 'results', 'methods'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-8 py-6 text-lg font-bold transition-all uppercase tracking-wide ${
                  activeTab === tab ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                {tab === 'overview' ? 'Chi tiết đề tài' : tab === 'results' ? 'Kết quả phân tích' : 'Phương pháp & Kỹ thuật'}
              </button>
            ))}
          </div>

          <div className="p-10 md:p-16">
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
                    Mục tiêu Dự án
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Dự án giải quyết vấn đề cốt lõi trong MOOCs: <strong>Sự thiếu hụt phản hồi tức thời</strong>. Bằng cách sử dụng dữ liệu hành vi gián tiếp, EduPredict xây dựng mô hình phân lớp 5 mức độ hài lòng, cho phép giảng viên can thiệp ngay khi học viên có dấu hiệu chán nản.
                  </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Dữ liệu MOOC-CubeX</h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">✔</span>
                        <span>4,216 khóa học đa ngành (Khoa học máy tính chiếm ưu thế).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">✔</span>
                        <span>230,000+ video bài giảng và 358,000+ bài tập thực hành.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">✔</span>
                        <span>Dữ liệu tương tác phong phú: Xem video, nộp bài, bình luận, và đồ thị khái niệm.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Ý nghĩa Kinh doanh</h3>
                    <p className="text-blue-800 leading-relaxed">
                      Giảm tỷ lệ <strong>Churn Rate</strong> thông qua dự báo sớm. Tối ưu hóa chi phí vận hành bằng cách tập trung nguồn lực chăm sóc vào nhóm học viên có rủi ro không hài lòng cao.
                    </p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
                    Hiệu suất Mô hình & Chỉ số
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    Kết quả thực nghiệm tập trung vào khả năng phân loại trên tập dữ liệu mất cân bằng, nơi nhãn mức độ 2 (Hài lòng) chiếm ưu thế áp đảo <strong>85.9%</strong>.
                  </p>

                  {/* Metrics (loaded from /public/artifacts/metrics.json) */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Bảng chỉ số (QWK, Accuracy, F1_Macro, MSE)</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Nguồn: <code className="font-mono">/public/artifacts/metrics.json</code>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Dataset</label>
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
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
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
                          Hãy chắc chắn bạn đã thêm file <code className="font-mono">metrics.json</code> vào <code className="font-mono">public/artifacts/</code>.
                        </div>
                      </div>
                    )}

                    {!metricsError && !metrics && (
                      <div className="mt-4 text-sm text-gray-500">Đang tải metrics.json…</div>
                    )}

                    {!metricsError && metrics && (
                      <>
                        {(() => {
                          const selected = metrics?.[selectedDataset]?.[selectedModel] as Record<PeriodKey, MetricCell> | undefined;
                          const p4 = selected?.P4;
                          return (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">P4 · QWK</div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.QWK.toFixed(4) : "–"}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">P4 · Accuracy</div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.Accuracy.toFixed(4) : "–"}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">P4 · F1_Macro</div>
                                  <div className="text-2xl font-extrabold text-gray-900 mt-1">
                                    {p4 ? p4.F1_Macro.toFixed(4) : "–"}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                  <div className="text-xs text-gray-500 font-semibold">P4 · MSE</div>
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
                                    {(["P1", "P2", "P3", "P4"] as PeriodKey[]).map((p) => {
                                      const cell = selected?.[p];
                                      return (
                                        <tr key={p} className="border-b last:border-b-0">
                                          <td className="py-3 pr-4 font-semibold">{p}</td>
                                          <td className="py-3 pr-4 font-mono">{cell ? cell.QWK.toFixed(4) : "–"}</td>
                                          <td className="py-3 pr-4 font-mono">{cell ? cell.Accuracy.toFixed(4) : "–"}</td>
                                          <td className="py-3 pr-4 font-mono">{cell ? cell.F1_Macro.toFixed(4) : "–"}</td>
                                          <td className="py-3 pr-4 font-mono">{cell ? cell.MSE.toFixed(4) : "–"}</td>
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
                  <h3 className="text-2xl font-bold mb-6">Phân tích Đặc trưng (Feature Importance)</h3>
                  <p className="text-gray-400 mb-6">Các yếu tố quyết định sự hài lòng của học viên:</p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="w-32 text-sm font-semibold">Earned Score</span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden ml-4">
                        <div className="w-[90%] h-full bg-blue-500"></div>
                      </div>
                      <span className="ml-4 text-blue-400 font-bold">Cao nhất</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-sm font-semibold">Video Session</span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden ml-4">
                        <div className="w-[75%] h-full bg-indigo-500"></div>
                      </div>
                      <span className="ml-4 text-indigo-400 font-bold">Quan trọng</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-sm font-semibold">Sentiment</span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden ml-4">
                        <div className="w-[60%] h-full bg-purple-500"></div>
                      </div>
                      <span className="ml-4 text-purple-400 font-bold">Trung bình</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'methods' && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-purple-600 rounded-full mr-4"></span>
                    Quy trình Gán nhãn & Xử lý
                  </h2>
                  <div className="bg-white border border-purple-100 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">Công thức Satisfaction Score (L-S-C-T)</h3>
                    <div className="p-6 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 font-mono text-center text-lg md:text-2xl">
                      Score = 0.60*L + 0.15*S + 0.15*C + 0.10*T
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center"><p className="font-bold">L</p><p className="text-xs text-gray-500">Learning (Học tập)</p></div>
                      <div className="text-center"><p className="font-bold">S</p><p className="text-xs text-gray-500">Sentiment (Cảm xúc)</p></div>
                      <div className="text-center"><p className="font-bold">C</p><p className="text-xs text-gray-500">Course (Ngữ cảnh)</p></div>
                      <div className="text-center"><p className="font-bold">T</p><p className="text-xs text-gray-500">Time (Thời gian)</p></div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Kiến trúc Dự báo Sớm (Early Prediction)</h3>
                  <div className="relative border-l-4 border-blue-200 ml-4 pl-10 space-y-12">
                    <div className="relative">
                      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
                      <h4 className="font-bold text-gray-900">Phase 1 (0-25%)</h4>
                      <p className="text-gray-500 text-sm">Dự báo sơ khởi dựa trên những tương tác đầu tiên.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
                      <h4 className="font-bold text-gray-900">Phase 2 (0-50%)</h4>
                      <p className="text-gray-500 text-sm">Giai đoạn can thiệp vàng để cải thiện tỷ lệ hài lòng.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-gray-300 rounded-full border-4 border-white"></div>
                      <h4 className="font-bold text-gray-900">Phase 3 & 4</h4>
                      <p className="text-gray-500 text-sm">Củng cố mô hình và đánh giá kết quả trọn đời khóa học.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Hạ tầng Công nghệ (Tech Stack)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">Next.js 16 / React 19</div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">PySpark / Kafka</div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">Flask / Spark MLlib</div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-700">XGBoost / Random Forest</div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Dự án EduPredict © 2025</p>
          <p className="text-gray-500 mt-2">Xây dựng trên nền tảng MOOC-CubeX & Khoa học Dữ liệu Tiên tiến</p>
        </div>
      </footer>
    </div>
  );
}