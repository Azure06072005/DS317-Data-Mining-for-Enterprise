// Prediction data - user-course-satisfaction mappings
// Based on node2vec_smote_sample.csv structure

export interface UserCourseSatisfaction {
  userId: string;
  courseId: string;
  satisfactionLabel: number; // 1.0 or 2.0 from CSV
  satisfactionPercentage: number;
  group: 'A' | 'B' | 'C' | 'D' | 'E';
}

// Generate synthetic user-course-satisfaction data
// Mapping satisfaction_label to groups:
// 2.0 -> Groups A, B (satisfied)
// 1.0 -> Groups C, D, E (dissatisfied)
const courseIds = [
  'C_680777', 'C_682515', 'C_696855', 'C_680958', 'C_680808',
  'C_685664', 'C_680993', 'C_676996', 'C_676969', 'C_682195',
  'C_682240', 'C_680823', 'C_676898', 'C_682360', 'C_682147'
];

// Generate sample data
const generateUserData = (): UserCourseSatisfaction[] => {
  const data: UserCourseSatisfaction[] = [];
  const userCount = 100; // Sample users
  
  for (let i = 0; i < userCount; i++) {
    const userId = `U_${10000 + i}`;
    // Each user takes 2-5 courses
    const coursesPerUser = Math.floor(Math.random() * 4) + 2;
    const selectedCourses = [...courseIds].sort(() => 0.5 - Math.random()).slice(0, coursesPerUser);
    
    selectedCourses.forEach(courseId => {
      // Distribution based on CSV: 764 label 2.0, 236 label 1.0
      const satisfactionLabel = Math.random() < 0.764 ? 2.0 : 1.0;
      
      let group: 'A' | 'B' | 'C' | 'D' | 'E';
      let satisfactionPercentage: number;
      
      if (satisfactionLabel === 2.0) {
        // Satisfied - Groups A or B
        if (Math.random() < 0.34) { // 5.7 / (5.7 + 11.1) ≈ 0.34
          group = 'A';
          satisfactionPercentage = 80 + Math.floor(Math.random() * 20); // 80-100
        } else {
          group = 'B';
          satisfactionPercentage = 65 + Math.floor(Math.random() * 15); // 65-80
        }
      } else {
        // Dissatisfied - Groups C, D, or E
        const rand = Math.random();
        if (rand < 0.13) { // 10.7 / (10.7 + 18.8 + 53.7) ≈ 0.13
          group = 'C';
          satisfactionPercentage = 50 + Math.floor(Math.random() * 15); // 50-65
        } else if (rand < 0.36) { // (10.7 + 18.8) / 83.2 ≈ 0.36
          group = 'D';
          satisfactionPercentage = 30 + Math.floor(Math.random() * 20); // 30-50
        } else {
          group = 'E';
          satisfactionPercentage = Math.floor(Math.random() * 30); // 0-30
        }
      }
      
      data.push({
        userId,
        courseId,
        satisfactionLabel,
        satisfactionPercentage,
        group
      });
    });
  }
  
  return data;
};

export const userCourseSatisfactionData = generateUserData();

// Helper functions
export function getCoursesByCourseId(courseId: string): UserCourseSatisfaction[] {
  return userCourseSatisfactionData.filter(item => item.courseId === courseId);
}

export function getUsersByCourseId(courseId: string): string[] {
  const users = getCoursesByCourseId(courseId).map(item => item.userId);
  return [...new Set(users)].sort();
}

export function getUserCourses(userId: string): UserCourseSatisfaction[] {
  return userCourseSatisfactionData.filter(item => item.userId === userId);
}

export function getUserCourseSatisfaction(userId: string, courseId: string): UserCourseSatisfaction | undefined {
  return userCourseSatisfactionData.find(
    item => item.userId === userId && item.courseId === courseId
  );
}

export function getCourseStatistics(courseId: string) {
  const courseData = getCoursesByCourseId(courseId);
  
  if (courseData.length === 0) {
    return null;
  }
  
  const groupCounts = {
    A: courseData.filter(d => d.group === 'A').length,
    B: courseData.filter(d => d.group === 'B').length,
    C: courseData.filter(d => d.group === 'C').length,
    D: courseData.filter(d => d.group === 'D').length,
    E: courseData.filter(d => d.group === 'E').length,
  };
  
  const totalUsers = courseData.length;
  const avgSatisfaction = Math.round(
    courseData.reduce((sum, d) => sum + d.satisfactionPercentage, 0) / totalUsers
  );
  
  // Determine overall group based on average
  let overallGroup: 'A' | 'B' | 'C' | 'D' | 'E';
  if (avgSatisfaction >= 80) overallGroup = 'A';
  else if (avgSatisfaction >= 65) overallGroup = 'B';
  else if (avgSatisfaction >= 50) overallGroup = 'C';
  else if (avgSatisfaction >= 30) overallGroup = 'D';
  else overallGroup = 'E';
  
  return {
    totalUsers,
    avgSatisfaction,
    overallGroup,
    groupCounts,
    distribution: [
      { name: 'Group A', value: groupCounts.A, percentage: Math.round((groupCounts.A / totalUsers) * 100) },
      { name: 'Group B', value: groupCounts.B, percentage: Math.round((groupCounts.B / totalUsers) * 100) },
      { name: 'Group C', value: groupCounts.C, percentage: Math.round((groupCounts.C / totalUsers) * 100) },
      { name: 'Group D', value: groupCounts.D, percentage: Math.round((groupCounts.D / totalUsers) * 100) },
      { name: 'Group E', value: groupCounts.E, percentage: Math.round((groupCounts.E / totalUsers) * 100) },
    ]
  };
}
