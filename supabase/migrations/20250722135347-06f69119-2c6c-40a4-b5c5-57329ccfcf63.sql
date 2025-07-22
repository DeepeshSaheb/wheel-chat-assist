-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for storing user feedback and queries
CREATE TABLE public.user_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  original_question TEXT NOT NULL,
  chatbot_response TEXT NOT NULL,
  user_feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for user queries
CREATE POLICY "Users can view their own queries" 
ON public.user_queries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own queries" 
ON public.user_queries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('chatbot-files', 'chatbot-files', false);

-- Create policies for chatbot file uploads
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chatbot-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chatbot-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_queries_updated_at
BEFORE UPDATE ON public.user_queries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();