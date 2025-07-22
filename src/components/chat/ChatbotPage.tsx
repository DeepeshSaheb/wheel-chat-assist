import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send, Bot, User, ArrowLeft, Paperclip, ThumbsDown, X, History, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDomainQuestions } from '@/hooks/useDomainQuestions';
import * as z from 'zod';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
}

const feedbackSchema = z.object({
  feedback: z.string().min(10, "Please provide at least 10 characters of feedback"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

interface ChatbotPageProps {
  onBack: () => void;
}


export const ChatbotPage: React.FC<ChatbotPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { questions: domainQuestions } = useDomainQuestions();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Evolve, your AI assistant. How can I help you today? You can ask me anything, upload a file, or choose from the common questions below.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedMessageForFeedback, setSelectedMessageForFeedback] = useState<{ question: string; response: string } | null>(null);
  const [showPredefinedQuestions, setShowPredefinedQuestions] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const feedbackForm = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to upload files.",
          variant: "destructive",
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chatbot-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('chatbot-files')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (message: string, file?: File) => {
    // Hide predefined questions immediately when any message is sent
    setShowPredefinedQuestions(false);
    
    if (!message.trim() && !file) return;

    let fileUrl = null;
    let fileName = null;

    if (file) {
      fileUrl = await uploadFile(file);
      if (!fileUrl) return; // Upload failed
      fileName = file.name;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message || `Uploaded file: ${fileName}`,
      isUser: true,
      timestamp: new Date(),
      fileUrl,
      fileName
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const chatbotMessage = message || `I've uploaded a file named ${fileName}. Can you help me with it?`;
      
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
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again later or contact our support team for immediate assistance.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage, selectedFile || undefined);
  };

  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFeedbackSubmit = async (data: FeedbackForm) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedMessageForFeedback) return;

      const { error } = await supabase
        .from('user_queries')
        .insert({
          user_id: user.id,
          original_question: selectedMessageForFeedback.question,
          chatbot_response: selectedMessageForFeedback.response,
          user_feedback: data.feedback,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback. Our team will review it.",
      });

      setFeedbackDialogOpen(false);
      feedbackForm.reset();
      setSelectedMessageForFeedback(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openFeedbackDialog = (question: string, response: string) => {
    setSelectedMessageForFeedback({ question, response });
    setFeedbackDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold truncate">Evolve</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/chat-history')}
            className="flex items-center gap-1 sm:gap-2"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Chat History</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/queries')}
            className="flex items-center gap-1 sm:gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Query History</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {message.isUser ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                </div>
                <div className={`rounded-lg p-2 sm:p-3 ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.text}</p>
                  {message.fileUrl && message.fileName && (
                    <div className="mt-2 p-2 bg-background/10 rounded flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-xs sm:text-sm truncate">{message.fileName}</span>
                    </div>
                  )}
                  {!message.isUser && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const userMessage = messages.find((m, index) => 
                            index > 0 && messages[index - 1]?.id === message.id
                          );
                          const question = userMessage?.text || "Previous question";
                          openFeedbackDialog(question, message.text);
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
              <div className="flex gap-2 sm:gap-3 max-w-[80%]">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="bg-muted rounded-lg p-2 sm:p-3">
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
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{selectedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeSelectedFile}
                className="flex-shrink-0"
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
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 text-sm sm:text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
          </DialogHeader>
          <Form {...feedbackForm}>
            <form onSubmit={feedbackForm.handleSubmit(handleFeedbackSubmit)} className="space-y-4">
              <FormField
                control={feedbackForm.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What went wrong with this response?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe what was incorrect or unhelpful about the response..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFeedbackDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Feedback
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};