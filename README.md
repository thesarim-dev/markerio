# Markerio

AI-powered exam grading for teachers. Capture photos of handwritten student exams, grade them with Gemini vision, and get per-question diagnostic feedback.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and add your Supabase URL + anon key
3. In [Supabase Dashboard → Edge Functions → Secrets](https://supabase.com/dashboard/project/prjilpgeupdobfpqqszc/functions/secrets), add:
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)
   - Optional: `GEMINI_MODEL` — defaults to `gemini-2.0-flash` (use `gemini-2.5-pro` for harder handwriting)
4. `npm run dev`

## How grading works

1. Create an **Exam Master** with an answer key (text) and optional rubric
2. **Capture** real photos of a student's exam (camera or file upload)
3. Tap **Process & Grade** — pages upload temporarily to Supabase Storage
4. The `grade-exam` edge function sends images to Gemini, saves the report, then **deletes the photos**
5. View the AI diagnostic report — only feedback is kept, not the images

## Deploy (Vercel)

Set environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set `GEMINI_API_KEY` in Supabase Edge Function secrets (not Vercel).
