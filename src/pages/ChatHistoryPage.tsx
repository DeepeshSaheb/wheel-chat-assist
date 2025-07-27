import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}
const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchChatSessions();
  }, []);
  const fetchChatSessions = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your chat history.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Fetch sessions with message count and last message (only sessions with user messages)
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages(content, created_at, is_user)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error loading chat history",
          description: "Failed to load your chat sessions. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Process the data to add message count and last message (only include sessions with user messages)
      const processedSessions = data?.filter(session => {
        // Only include sessions that have at least one user message
        const userMessages = session.chat_messages?.filter(msg => msg.is_user) || [];
        return userMessages.length > 0;
      }).map(session => ({
        ...session,
        message_count: session.chat_messages?.length || 0,
        last_message: session.chat_messages?.[session.chat_messages.length - 1]?.content || 'No messages yet'
      })) || [];
      setSessions(processedSessions);
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
  const createNewChat = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a new chat.",
          variant: "destructive"
        });
        return;
      }
      const {
        data,
        error
      } = await supabase.from('chat_sessions').insert([{
        user_id: user.id,
        title: `Chat ${format(new Date(), 'MMM d, h:mm a')}`
      }]).select().single();
      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Error creating chat",
          description: "Failed to create a new chat session.",
          variant: "destructive"
        });
        return;
      }
      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };
  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
      if (error) {
        console.error('Error deleting session:', error);
        toast({
          title: "Error deleting chat",
          description: "Failed to delete the chat session.",
          variant: "destructive"
        });
        return;
      }
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Chat deleted",
        description: "The chat session has been deleted successfully."
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon" onClick={createNewChat}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Chat History</h1>
            <div className="w-10"></div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your chat history...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={createNewChat}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground truncate">Chat History</h1>
          <div className="w-10"></div>
        </div>

        {sessions.length === 0 ? <Card>
            <CardContent className="text-center py-16">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No chat sessions yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first conversation with our chatbot.
              </p>
              <Button onClick={createNewChat}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </CardContent>
          </Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
            {sessions.map(session => <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow min-w-0 w-full" onClick={() => navigate(`/chat/${session.id}`)}>
                <CardHeader className="pb-2 min-w-0">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <CardTitle className="text-lg text-foreground truncate min-w-0 flex-1">
                      {session.title}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={e => deleteSession(session.id, e)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{format(new Date(session.updated_at), 'PPP')}</span>
                    <Badge variant="outline" className="flex-shrink-0">
                      {session.message_count} messages
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 min-w-0">
                  <p className="text-sm text-muted-foreground break-words overflow-hidden overflow-ellipsis">
                    {session.last_message && session.last_message.length > 80 
                      ? `${session.last_message.substring(0, 80)}...` 
                      : session.last_message}
                  </p>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default ChatHistoryPage;