import { supabase } from './supabase';
import { StudentReport } from '../types';

export interface CapturedPage {
  id: string;
  blob: Blob;
  previewUrl: string;
}

export async function uploadAndGradeExam(
  examId: string,
  pages: CapturedPage[]
): Promise<StudentReport> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to grade exams.');

  const sessionId = crypto.randomUUID();
  const storagePaths: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    const path = `${user.id}/${sessionId}/page-${i}.jpg`;
    const { error } = await supabase.storage
      .from('exam-captures')
      .upload(path, pages[i].blob, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      if (storagePaths.length > 0) {
        await supabase.storage.from('exam-captures').remove(storagePaths);
      }
      throw new Error(`Upload failed: ${error.message}`);
    }
    storagePaths.push(path);
  }

  try {
    const { data, error } = await supabase.functions.invoke('grade-exam', {
      body: { examId, storagePaths }
    });

    if (error) {
      throw new Error(error.message || 'Grading request failed');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    if (!data?.report) {
      throw new Error('No report returned from grading');
    }

    return data.report as StudentReport;
  } catch (err) {
    await supabase.storage.from('exam-captures').remove(storagePaths);
    throw err;
  }
}
