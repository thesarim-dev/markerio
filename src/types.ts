export type GradingType =
  | 'standard'
  | 'moe_english_reading'
  | 'moe_english_writing'
  | 'moe_english_vocabulary'
  | 'moe_english_mixed';

export interface Exam {
  id: string;
  name: string;
  gradeLevel: string;
  gradingType: GradingType;
  answerKey: string;
  rubric: string;
  createdAt: number;
}

export interface FeedbackItem {
  question: string;
  points: string;
  studentAnswer?: string;
  correctAnswer?: string;
  content: string;
  deduction: string;
  reasoning: string;
}

export interface TokenUsage {
  prompt: number;
  output: number;
  total: number;
}

export interface StudentReport {
  id: string;
  examId: string;
  studentName: string;
  score: number;
  pageCount: number;
  feedback: FeedbackItem[];
  tokenUsage?: TokenUsage | null;
  createdAt: number;
}

export type ViewState =
{name: 'dashboard';} |
{name: 'create_exam';} |
{name: 'edit_exam';examId: string;} |
{name: 'exam_detail';examId: string;} |
{name: 'capture';examId?: string;} |
{name: 'report';reportId: string;} |
{name: 'reports_list';};
