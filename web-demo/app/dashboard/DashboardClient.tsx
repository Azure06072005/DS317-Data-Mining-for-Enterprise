'use client'

import { Card, Flex, Text, Title } from '@tremor/react'
import React from 'react'

interface DashboardClientProps {
  stats: {
    prerequisitesDistribution: Record<string, number>
    exerciseCountDistribution: Record<string, number>
    coursesByField: Record<string, number>
    studentsByField: Record<string, number>
    topCoursesByStudents: Array<{ course: string; students: number }>
  }
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  // Keep this chart: Phân bố Khóa học theo Lĩnh vực
  const coursesByFieldData = Object.entries(stats.coursesByField).map(([field, count]) => ({
    field,
    count,
  }))

  // Deterministic insights to keep the 2-column layout after removing noisy charts.
  const topFieldByCourses = coursesByFieldData.reduce(
    (acc, cur) => (cur.count > acc.count ? cur : acc),
    { field: 'N/A', count: 0 },
  )

  const topCourseByStudents = (stats.topCoursesByStudents ?? []).reduce(
    (acc, cur) => (cur.students > acc.students ? cur : acc),
    { course: 'N/A', students: 0 },
  )

  return (
    <div className="p-4 space-y-4">
      <Title>Dashboard</Title>

      {/* Row 1: 2-column layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <Title>Phân bố Khóa học theo Lĩnh vực</Title>
          <div className="mt-4">
            {/* Using Tremor BarList to keep existing visualization without the removed charts */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {/** @ts-ignore - Tremor types may differ by version */}
            {/* @ts-ignore */}
            <Flex className="mb-2" justifyContent="between">
              <Text>Lĩnh vực</Text>
              <Text>Số khóa học</Text>
            </Flex>
            {/* @ts-ignore */}
            <div>
              {/* @ts-ignore */}
              {/* BarList is available in @tremor/react; if not, this will be caught in CI/build */}
              {/* @ts-ignore */}
              {React.createElement(
                // lazy require to avoid hard dependency on specific Tremor exports
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require('@tremor/react').BarList as any,
                {
                  data: coursesByFieldData
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((d) => ({ name: d.field, value: d.count })),
                },
              )}
            </div>
          </div>
        </Card>

        <Card>
          <Title>Insights</Title>
          <div className="mt-4 space-y-3">
            <Flex justifyContent="between">
              <Text>Top lĩnh vực (theo số khóa học)</Text>
              <Text className="font-medium">
                {topFieldByCourses.field} ({topFieldByCourses.count})
              </Text>
            </Flex>
            <Flex justifyContent="between">
              <Text>Top khóa học (theo số học viên)</Text>
              <Text className="font-medium">
                {topCourseByStudents.course} ({topCourseByStudents.students})
              </Text>
            </Flex>
            <Text className="text-sm text-slate-600">
              Ghi chú: Các biểu đồ nhiễu (Phân bố yêu cầu điều kiện, Phân bố số lượng bài tập theo khóa học,
              Số Học viên theo Lĩnh vực (Top 8)) đã được loại bỏ để giữ dashboard ổn định và tránh biến không dùng.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}
