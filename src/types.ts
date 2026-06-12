export interface Exam {
  id: string;
  name: string;
  gradeLevel: string;
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

export interface StudentReport {
  id: string;
  examId: string;
  studentName: string;
  score: number;
  pageCount: number;
  feedback: FeedbackItem[];
  createdAt: number;
}

export type ViewState =
{name: 'dashboard';} |
{name: 'create_exam';} |
{name: 'exam_detail';examId: string;} |
{name: 'capture';examId?: string;} |
{name: 'report';reportId: string;} |
{name: 'reports_list';};
