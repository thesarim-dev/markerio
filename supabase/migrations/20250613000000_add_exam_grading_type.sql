ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS grading_type text NOT NULL DEFAULT 'standard';

COMMENT ON COLUMN public.exams.grading_type IS
  'standard | moe_english_module_c | moe_english_module_e | moe_english_module_g';
