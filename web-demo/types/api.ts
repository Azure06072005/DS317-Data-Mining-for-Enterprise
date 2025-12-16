import { CourseInfo } from './prediction';

// Course API Response Types
export interface CourseStatsResponse {
  totalCourses: number;
  totalStudents: number;
  avgVideosPerCourse: number;
  avgExercisesPerCourse: number;
  coursesWithPrerequisites: number;
  coursesWithoutPrerequisites: number;
  topCoursesByStudents: CourseInfo[];
  topCoursesByVideos: CourseInfo[];
}

export interface CoursesListResponse {
  data: CourseInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Prediction/Student Data Types
export interface PredictionRecord {
  // Performance metrics for 4 periods
  accuracy_p1: number;
  accuracy_p2: number;
  accuracy_p3: number;
  accuracy_p4: number;
  
  avg_earned_ratio_p1: number;
  avg_earned_ratio_p2: number;
  avg_earned_ratio_p3: number;
  avg_earned_ratio_p4: number;
  
  avg_earned_score_p1: number;
  avg_earned_score_p2: number;
  avg_earned_score_p3: number;
  avg_earned_score_p4: number;
  
  // Other metrics
  avg_problem_score_p1: number;
  avg_problem_score_p2: number;
  avg_problem_score_p3: number;
  avg_problem_score_p4: number;
  
  correct_submissions_p1: number;
  correct_submissions_p2: number;
  correct_submissions_p3: number;
  correct_submissions_p4: number;
  
  // Video interaction metrics
  course_watch_ratio_p1: number;
  course_watch_ratio_p2: number;
  course_watch_ratio_p3: number;
  course_watch_ratio_p4: number;
  
  // Engagement metrics
  coverage_ratio_p1: number;
  coverage_ratio_p2: number;
  coverage_ratio_p3: number;
  coverage_ratio_p4: number;
  
  days_until_first_watch_p1: number;
  days_until_first_watch_p2: number;
  days_until_first_watch_p3: number;
  days_until_first_watch_p4: number;
  
  // Additional features
  earned_per_attempt_p1: number;
  earned_per_attempt_p2: number;
  earned_per_attempt_p3: number;
  earned_per_attempt_p4: number;
  
  exercises_touched_p1: number;
  exercises_touched_p2: number;
  exercises_touched_p3: number;
  exercises_touched_p4: number;
  
  // Node2vec embeddings
  combined_emb_0: number;
  combined_emb_1: number;
  combined_emb_2: number;
  combined_emb_3: number;
  combined_emb_4: number;
  combined_emb_5: number;
  combined_emb_6: number;
  combined_emb_7: number;
  combined_emb_8: number;
  combined_emb_9: number;
  combined_emb_10: number;
  combined_emb_11: number;
  combined_emb_12: number;
  combined_emb_13: number;
  combined_emb_14: number;
  combined_emb_15: number;
  
  // Target variable
  satisfaction_label: number; // 1.0 or 2.0
}

export interface PredictionStatsResponse {
  total: number;
  satisfied: number; // satisfaction_label = 2.0
  dissatisfied: number; // satisfaction_label = 1.0
  satisfactionRate: number; // percentage
  labelDistribution: {
    label: number;
    count: number;
    percentage: number;
  }[];
}

export interface PredictionsListResponse {
  data: PredictionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  _note?: string; // Optional note for API limitations
}

// CSV Row Types (raw data from CSV files)
export interface CourseCSVRow {
  course_id: string;
  total_students_enrolled: string | number;
  total_videos: string | number;
  total_exercises: string | number;
  num_fields: string | number;
  is_prerequisites: string | number;
}
