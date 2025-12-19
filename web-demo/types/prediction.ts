// TypeScript interfaces for prediction feature

export interface CourseInfo {
  courseId: string;
  courseName: string;
  description: string;
  field: string;
  additionalFields: string[];
  totalStudentsEnrolled: number;
  totalVideos: number;
  totalExercises: number;
  numFields: number;
  isPrerequisites: boolean;
}

export interface PerformanceMetrics {
  // Accuracy metrics for 4 periods (P1, P2, P3, P4)
  accuracy_p1: number;
  accuracy_p2: number;
  accuracy_p3: number;
  accuracy_p4: number;
  
  // Average earned ratio for 4 periods
  avg_earned_ratio_p1: number;
  avg_earned_ratio_p2: number;
  avg_earned_ratio_p3: number;
  avg_earned_ratio_p4: number;
  
  // Average earned score for 4 periods
  avg_earned_score_p1: number;
  avg_earned_score_p2: number;
  avg_earned_score_p3: number;
  avg_earned_score_p4: number;
}

export interface EngagementMetrics {
  numberOfSessions: number;
  totalTimeSpent: number;
  videoCompletionRate: number;
  exerciseCompletionRate: number;
}

export interface PredictionFormData {
  courseInfo: CourseInfo;
  performanceMetrics: PerformanceMetrics;
  engagementMetrics: EngagementMetrics;
}

export interface PredictionResult {
  satisfactionLevel: number; // 0-100
  confidence: number; // 0-100
  group: 'A' | 'B' | 'C' | 'D' | 'E';
  groupLabel: string;
  groupPercentage: number;
}

export const SATISFACTION_GROUPS = {
  A: { label: 'Rất hài lòng', percentage: 5.7, color: 'green' },
  B: { label: 'Hài lòng', percentage: 11.1, color: 'blue' },
  C: { label: 'Trung bình', percentage: 10.7, color: 'yellow' },
  D: { label: 'Không hài lòng', percentage: 18.8, color: 'orange' },
  E: { label: 'Rất không hài lòng', percentage: 53.7, color: 'red' },
} as const;
