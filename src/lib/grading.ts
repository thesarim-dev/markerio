import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';
import { StudentReport } from '../types';

export interface CapturedPage {
  id: string;
  blob: Blob;
  previewUrl: string;
}

async function invokeGradeExam(
  examId: string,
  storagePaths: string[]
): Promise<{ report: StudentReport; error?: string }> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token?.trim();
  if (!accessToken) {
    throw new Error('Session expired. Please sign in again.');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/grade-exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey
    },
    body: JSON.stringify({ examId, storagePaths })
  });

  let payload: { report?: StudentReport; error?: string; detail?: string } = {};
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Grading failed (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      payload.error || payload.detail || `Grading failed (${response.status})`
    );
  }

  return payload as { report: StudentReport };
}

export async function uploadAndGradeExam(
  examId: string,
  pages: CapturedPage[]
): Promise<StudentReport> {
  const {
    data: { user }
  } = await supabase.auth.getUser();
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
    const { report } = await invokeGradeExam(examId, storagePaths);
    if (!report) throw new Error('No report returned from grading');
    return report;
  } catch (err) {
    await supabase.storage.from('exam-captures').remove(storagePaths);
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(
        'Network error calling grading service. Check VITE_SUPABASE_URL in Vercel env vars and redeploy.'
      );
    }
    throw err;
  }
}
