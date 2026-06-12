import { supabase } from './supabase';
import { Exam, FeedbackItem, StudentReport, TokenUsage } from '../types';

interface ExamRow {
  id: string;
  name: string;
  grade_level: string;
  answer_key: string;
  rubric: string;
  created_at: string;
}

interface ReportRow {
  id: string;
  exam_id: string;
  student_name: string;
  score: number;
  page_count: number;
  feedback: FeedbackItem[];
  token_usage: TokenUsage | null;
  created_at: string;
}

export function mapExam(row: ExamRow): Exam {
  return {
    id: row.id,
    name: row.name,
    gradeLevel: row.grade_level,
    answerKey: row.answer_key,
    rubric: row.rubric,
    createdAt: new Date(row.created_at).getTime()
  };
}

export function mapReport(row: ReportRow): StudentReport {
  return {
    id: row.id,
    examId: row.exam_id,
    studentName: row.student_name,
    score: Number(row.score),
    pageCount: row.page_count,
    feedback: row.feedback ?? [],
    tokenUsage: row.token_usage ?? null,
    createdAt: new Date(row.created_at).getTime()
  };
}

export async function fetchExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ExamRow[]).map(mapExam);
}

export async function fetchReports(): Promise<StudentReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ReportRow[]).map(mapReport);
}

export async function createExam(
  exam: Omit<Exam, 'id' | 'createdAt'>
): Promise<Exam> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  const { data, error } = await supabase
    .from('exams')
    .insert({
      user_id: user.id,
      name: exam.name,
      grade_level: exam.gradeLevel,
      answer_key: exam.answerKey,
      rubric: exam.rubric
    })
    .select()
    .single();

  if (error) throw error;
  return mapExam(data as ExamRow);
}

export async function updateExam(
  id: string,
  exam: Omit<Exam, 'id' | 'createdAt'>
): Promise<Exam> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in.');

  const { data, error } = await supabase
    .from('exams')
    .update({
      name: exam.name,
      grade_level: exam.gradeLevel,
      answer_key: exam.answerKey,
      rubric: exam.rubric
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapExam(data as ExamRow);
}
