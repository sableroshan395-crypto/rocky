/**
 * Study, Personal Habits, Goals & Idea Lab Types
 */

export interface SubjectModule {
  id: string;
  subjectName: string; // e.g. "Financial Accounting", "Corporate Law"
  semester: string; // e.g. "Semester 4"
  professor?: string;
  syllabusCoveredPercent: number; // 0 - 100
  notesUrl?: string;
  importantTopics: string[];
  status: 'in_progress' | 'completed' | 'revision_needed';
  createdAt: string;
  updatedAt: string;
}

export interface AcademicExam {
  id: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string; // HH:mm
  venue?: string;
  totalMarks?: number;
  passingMarks?: number;
  preparationStatus: 'not_started' | 'studying' | 'revision' | 'ready';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyHabit {
  id: string;
  title: string;
  category: 'study' | 'fitness' | 'finance' | 'discipline' | 'business';
  streakDays: number;
  targetDaysPerWeek: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  completedToday?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type IdeaStage = 'inbox' | 'researching' | 'validating' | 'building' | 'launched' | 'archived';

export interface VentureIdea {
  id: string;
  title: string;
  category: 'business' | 'saas' | 'automation' | 'content' | 'ecommerce' | 'other';
  stage: IdeaStage;
  problemStatement?: string;
  proposedSolution?: string;
  estimatedInvestmentPaise: number;
  estimatedRevenuePotentialPaise: number;
  priorityScore: number; // 1-10
  tags: string[];
  convertedProjectId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
