// Prediction data - user-course-satisfaction mappings (DETERMINISTIC, NO RANDOM)

export interface UserCourseSatisfaction {
  userId: string;
  courseId: string;
  satisfactionLabel: number; // 1.0 (dissatisfied) or 2.0 (satisfied)
  satisfactionPercentage: number;
  group: "A" | "B" | "C" | "D" | "E";
}

export interface EnrichedUserCourseSatisfaction extends UserCourseSatisfaction {
  courseName: string;
  field: string;
  description: string;
}

/**
 * Deterministic hash -> [0,1)
 * (FNV-1a 32-bit)
 */
function hashToUnit(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // unsigned 32-bit then scale
  return (h >>> 0) / 2 ** 32;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Distribution constants (giữ giống logic cũ nhưng deterministic)
const SATISFIED_RATIO = 0.764; // label 2.0
const GROUP_A_RATIO_IN_SATISFIED = 0.34;
const GROUP_C_RATIO_IN_DISSATISFIED = 0.13;
const GROUP_D_RATIO_IN_DISSATISFIED = 0.36;

// Lấy courseIds từ courseData để luôn khớp với danh sách khóa học
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { coursesData } = require("./courseData");
const courseIds: string[] = (coursesData as any[]).map((c) => c.courseId);

/**
 * Deterministic selection of k courses for a user
 */
function pickCoursesForUser(userId: string, k: number): string[] {
  const n = courseIds.length;
  if (n === 0) return [];
  const start = Math.floor(hashToUnit(userId) * n);
  const result: string[] = [];
  for (let i = 0; i < k; i++) {
    result.push(courseIds[(start + i) % n]);
  }
  return result;
}

function assignSatisfaction(userId: string, courseId: string): UserCourseSatisfaction {
  const key = `${userId}::${courseId}`;

  const u = hashToUnit(key);
  const satisfactionLabel = u < SATISFIED_RATIO ? 2.0 : 1.0;

  let group: "A" | "B" | "C" | "D" | "E";
  let satisfactionPercentage: number;

  const u2 = hashToUnit(key + "::g");
  const u3 = hashToUnit(key + "::p");

  if (satisfactionLabel === 2.0) {
    // Satisfied => A/B
    if (u2 < GROUP_A_RATIO_IN_SATISFIED) {
      group = "A";
      satisfactionPercentage = 80 + Math.floor(u3 * 20); // 80-99
    } else {
      group = "B";
      satisfactionPercentage = 65 + Math.floor(u3 * 15); // 65-79
    }
  } else {
    // Dissatisfied => C/D/E
    if (u2 < GROUP_C_RATIO_IN_DISSATISFIED) {
      group = "C";
      satisfactionPercentage = 50 + Math.floor(u3 * 15); // 50-64
    } else if (u2 < GROUP_D_RATIO_IN_DISSATISFIED) {
      group = "D";
      satisfactionPercentage = 30 + Math.floor(u3 * 20); // 30-49
    } else {
      group = "E";
      satisfactionPercentage = Math.floor(u3 * 30); // 0-29
    }
  }

  satisfactionPercentage = clamp(satisfactionPercentage, 0, 100);

  return {
    userId,
    courseId,
    satisfactionLabel,
    satisfactionPercentage,
    group,
  };
}

function generateUserData(): UserCourseSatisfaction[] {
  const data: UserCourseSatisfaction[] = [];
  const userCount = 200; // tăng nhẹ để demo “đầy” hơn (vẫn deterministic)

  for (let i = 0; i < userCount; i++) {
    const userId = `U_${10000 + i}`;

    // Each user takes 2-5 courses (deterministic)
    const k = 2 + (Math.floor(hashToUnit(userId + "::k") * 4)); // 2..5
    const selected = pickCoursesForUser(userId, k);

    for (const courseId of selected) {
      data.push(assignSatisfaction(userId, courseId));
    }
  }
  return data;
}

export const userCourseSatisfactionData: UserCourseSatisfaction[] = generateUserData();

// Helper functions
export function getCoursesByCourseId(courseId: string): UserCourseSatisfaction[] {
  return userCourseSatisfactionData.filter((item) => item.courseId === courseId);
}

export function getUsersByCourseId(courseId: string): string[] {
  const users = getCoursesByCourseId(courseId).map((item) => item.userId);
  return [...new Set(users)].sort();
}

export function getUserCourses(userId: string): UserCourseSatisfaction[] {
  return userCourseSatisfactionData.filter((item) => item.userId === userId);
}

export function getEnrichedUserCourses(userId: string): EnrichedUserCourseSatisfaction[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { coursesData } = require("./courseData");

  const userCourses = getUserCourses(userId);
  return userCourses.map((uc) => {
    const courseInfo = (coursesData as any[]).find((c) => c.courseId === uc.courseId);
    return {
      ...uc,
      courseName: courseInfo?.courseName || uc.courseId,
      field: courseInfo?.field || "Unknown",
      description: courseInfo?.description || "",
    };
  });
}

export function getUserCourseSatisfaction(userId: string, courseId: string) {
  return userCourseSatisfactionData.find((item) => item.userId === userId && item.courseId === courseId);
}

export function getCourseStatistics(courseId: string) {
  const courseData = getCoursesByCourseId(courseId);
  if (courseData.length === 0) return null;

  const groupCounts = {
    A: courseData.filter((d) => d.group === "A").length,
    B: courseData.filter((d) => d.group === "B").length,
    C: courseData.filter((d) => d.group === "C").length,
    D: courseData.filter((d) => d.group === "D").length,
    E: courseData.filter((d) => d.group === "E").length,
  };

  const totalUsers = courseData.length;
  const avgSatisfaction = Math.round(courseData.reduce((sum, d) => sum + d.satisfactionPercentage, 0) / totalUsers);

  let overallGroup: "A" | "B" | "C" | "D" | "E";
  if (avgSatisfaction >= 80) overallGroup = "A";
  else if (avgSatisfaction >= 65) overallGroup = "B";
  else if (avgSatisfaction >= 50) overallGroup = "C";
  else if (avgSatisfaction >= 30) overallGroup = "D";
  else overallGroup = "E";

  return {
    totalUsers,
    avgSatisfaction,
    overallGroup,
    groupCounts,
    distribution: [
      { name: "Group A", value: groupCounts.A, percentage: Math.round((groupCounts.A / totalUsers) * 100) },
      { name: "Group B", value: groupCounts.B, percentage: Math.round((groupCounts.B / totalUsers) * 100) },
      { name: "Group C", value: groupCounts.C, percentage: Math.round((groupCounts.C / totalUsers) * 100) },
      { name: "Group D", value: groupCounts.D, percentage: Math.round((groupCounts.D / totalUsers) * 100) },
      { name: "Group E", value: groupCounts.E, percentage: Math.round((groupCounts.E / totalUsers) * 100) },
    ],
  };
}
