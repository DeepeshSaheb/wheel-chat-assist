import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
interface UserQuery {
  id: string;
  original_question: string;
  chatbot_response: string;
  user_feedback: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
const QueriesHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUserQueries();
  }, []);
  const fetchUserQueries = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your query history.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('user_queries').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching queries:', error);
        toast({
          title: "Error loading queries",
          description: "Failed to load your query history. Please try again.",
          variant: "destructive"
        });
        return;
      }
      setQueries(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'reviewed':
        return 'secondary';
      case 'pending':
      default:
        return 'outline';
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your queries...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Queries</h1>
            
          </div>
        </div>

        {queries.length === 0 ? <Card>
            <CardContent className="text-center py-16">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No queries yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't submitted any queries to the chatbot yet.
              </p>
              <Button onClick={() => navigate('/')}>
                Start a conversation
              </Button>
            </CardContent>
          </Card> : <div className="space-y-6">
            {queries.map(query => <Card key={query.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-foreground">
                        Query from {format(new Date(query.created_at), 'PPP')}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {format(new Date(query.created_at), 'p')}
                        <Badge variant={getStatusBadgeVariant(query.status)}>
                          {query.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Your Question:
                    </h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-foreground whitespace-pre-wrap">{query.original_question}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chatbot Response:
                    </h4>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <p className="text-foreground whitespace-pre-wrap">{query.chatbot_response}</p>
                    </div>
                  </div>

                  {query.user_feedback && <div>
                      <h4 className="font-semibold text-foreground mb-2">Your Feedback:</h4>
                      <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                        <p className="text-foreground whitespace-pre-wrap">{query.user_feedback}</p>
                      </div>
                    </div>}
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default QueriesHistoryPage;