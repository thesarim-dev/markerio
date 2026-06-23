ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS grading_type text NOT NULL DEFAULT 'standard';

COMMENT ON COLUMN public.exams.grading_type IS
  'standard | moe_english_reading | moe_english_writing | moe_english_vocabulary | moe_english_mixed';
