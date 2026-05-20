export const UserRole = { USER: "USER", ADMIN: "ADMIN" } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Difficulty = { EASY: "EASY", MEDIUM: "MEDIUM", HARD: "HARD" } as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const ExamMode = {
  PRACTICE: "PRACTICE",
  TIMED: "TIMED",
  REVIEW: "REVIEW",
} as const;
export type ExamMode = (typeof ExamMode)[keyof typeof ExamMode];

export const AttemptStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];

export const ReportStatus = { OPEN: "OPEN", RESOLVED: "RESOLVED" } as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const LeaderboardPeriod = {
  WEEKLY: "WEEKLY",
  ALL_TIME: "ALL_TIME",
} as const;
export type LeaderboardPeriod =
  (typeof LeaderboardPeriod)[keyof typeof LeaderboardPeriod];
