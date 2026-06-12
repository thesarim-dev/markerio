ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS token_usage jsonb;

COMMENT ON COLUMN public.reports.token_usage IS
  'Gemini usageMetadata: prompt, output, total token counts';
