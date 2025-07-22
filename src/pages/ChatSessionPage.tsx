import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send, Bot, User, ArrowLeft, Paperclip, ThumbsDown, X, History, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDomainQuestions } from '@/hooks/useDomainQuestions';
import * as z from 'zod';

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const feedbackSchema = z.object({
  feedback: z.string().min(10, "Please provide at least 10 characters of feedback"),
});

const titleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;
type TitleForm = z.infer<typeof titleSchema>;


const ChatSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { questions: domainQuestions } = useDomainQuestions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [isTitleEditOpen, setIsTitleEditOpen] = useState(false);
  const [showPredefinedQuestions, setShowPredefinedQuestions] = useState(true);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const feedbackForm = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { feedback: '' }
  });

  const titleForm = useForm<TitleForm>({
    resolver: zodResolver(titleSchema),
    defaultValues: { title: '' }
  });

  useEffect(() => {
    if (sessionId) {
      loadChatSession();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view the chat session.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Load session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !sessionData) {
        console.error('Error loading session:', sessionError);
        toast({
          title: "Session not found",
          description: "The chat session could not be found.",
          variant: "destructive",
        });
        navigate('/chat-history');
        return;
      }

      setSession(sessionData);
      titleForm.setValue('title', sessionData.title);

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        toast({
          title: "Error loading messages",
          description: "Failed to load chat messages.",
          variant: "destructive",
        });
        return;
      }

      setMessages(messagesData || []);

      // If this is a new session with no messages, add welcome message and show predefined questions
      if (!messagesData || messagesData.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Hi! I'm Evolve, your AI assistant. How can I help you today? You can ask me anything, upload a file, or choose from the common questions below.",
          is_user: false,
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
        setShowPredefinedQuestions(true);
      } else {
        // If there are existing messages, hide predefined questions
        setShowPredefinedQuestions(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveMessage = async (content: string, isUser: boolean, fileUrl?: string, fileName?: string) => {
    if (!sessionId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            content,
            is_user: isUser,
            file_url: fileUrl,
            file_name: fileName
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return null;
      }

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; fileName: string } | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chatbot-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('chatbot-files')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, fileName: file.name };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const sendMessage = async (message?: string, file?: File) => {
    // Hide predefined questions immediately when any message is sent
    setShowPredefinedQuestions(false);
    
    const messageText = message || newMessage.trim();
    if (!messageText && !file) return;

    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (file) {
      const uploadResult = await uploadFile(file);
      if (uploadResult) {
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      is_user: true,
      created_at: new Date().toISOString(),
      file_url: fileUrl,
      file_name: fileName
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    // Save user message to database
    await saveMessage(messageText, true, fileUrl, fileName);

    try {
      const chatbotMessage = messageText || `I've uploaded a file named ${fileName}. Can you help me with it?`;
      
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message: chatbotMessage,
          hasFile: !!file,
          fileName: fileName
        }
      });

      if (error) {
        throw error;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        is_user: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to database
      await saveMessage(data.response, false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again later or contact our support team for immediate assistance.",
        is_user: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage.content, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const updateSessionTitle = async (values: TitleForm) => {
    if (!sessionId || !session) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: values.title })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating title:', error);
        toast({
          title: "Error updating title",
          description: "Failed to update the chat title.",
          variant: "destructive",
        });
        return;
      }

      setSession({ ...session, title: values.title });
      setIsTitleEditOpen(false);
      toast({
        title: "Title updated",
        description: "Chat title has been updated successfully.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading chat session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <Button onClick={() => navigate('/chat-history')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-2 sm:p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-base sm:text-lg font-semibold truncate">{session.title}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTitleEditOpen(true)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/chat-history')}
            className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">All Chats</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.is_user ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.is_user ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.is_user ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {message.is_user ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                </div>
                <div className={`rounded-lg p-2 sm:p-3 ${
                  message.is_user 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                  {message.file_url && message.file_name && (
                    <div className="mt-2 p-2 bg-background/10 rounded flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm">{message.file_name}</span>
                    </div>
                  )}
                  {!message.is_user && message.id !== 'welcome' && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMessageId(message.id);
                          setIsFeedbackOpen(true);
                        }}
                        className="text-muted-foreground hover:text-foreground h-auto p-1"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Predefined Questions - Only show for new chats */}
      {showPredefinedQuestions && (
        <div className="border-t bg-card p-2 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
              {domainQuestions.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPredefinedQuestions(false);
                    sendMessage(item.question);
                  }}
                  disabled={isLoading}
                  className="text-xs sm:text-sm"
                >
                  {item.question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-card p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {selectedFile && (
            <div className="mb-2 sm:mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">{selectedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-1 sm:gap-2">
            <div className="flex-1 flex gap-1 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 text-sm sm:text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || (!newMessage.trim() && !selectedFile)}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Edit Title Dialog */}
      <Dialog open={isTitleEditOpen} onOpenChange={setIsTitleEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chat Title</DialogTitle>
          </DialogHeader>
          <Form {...titleForm}>
            <form onSubmit={titleForm.handleSubmit(updateSessionTitle)} className="space-y-4">
              <FormField
                control={titleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chat Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a title for this chat" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsTitleEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Title</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatSessionPage;