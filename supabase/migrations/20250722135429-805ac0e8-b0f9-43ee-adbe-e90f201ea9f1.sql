-- Fix function search path mutable issue
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;