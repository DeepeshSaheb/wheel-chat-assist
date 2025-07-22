import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DomainQuestion {
  id: string;
  question: string;
  category: string | null;
  is_active: boolean;
}

export const useDomainQuestions = () => {
  const [questions, setQuestions] = useState<DomainQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('domain_questions')
          .select('id, question, category, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('Error fetching domain questions:', fetchError);
          setError('Failed to load questions');
          return;
        }

        setQuestions(data || []);
      } catch (error) {
        console.error('Error fetching domain questions:', error);
        setError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return { questions, isLoading, error };
};