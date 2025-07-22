import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send, Bot, User, ArrowLeft, Paperclip, ThumbsDown, X, History } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

const PREDEFINED_QUESTIONS = [
  "What are the different scooter models available?",
  "How long does the battery last?",
  "How do I charge my scooter?",
  "What's the maximum speed and range?",
  "How do I troubleshoot if my scooter won't start?",
  "What's covered under warranty?",
  "How do I check my order status?",
  "What safety gear do you recommend?"
];

export const ChatbotPage: React.FC<ChatbotPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your electric scooter support assistant. How can I help you today? You can ask me anything, upload a file, or choose from the common questions below.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedMessageForFeedback, setSelectedMessageForFeedback] = useState<{ question: string; response: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const feedbackForm = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
    },
  });

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-card/80 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Scooter Support Chat</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/chat-history', '_blank')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Chat History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/queries', '_blank')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Query History
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                
                <Card className={`max-w-[80%] ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    {message.fileUrl && (
                      <div className="mt-2">
                        <a 
                          href={message.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs underline hover:no-underline"
                        >
                          📎 {message.fileName}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs opacity-70 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!message.isUser && (
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
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {message.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Predefined Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t bg-card/50">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Common Questions:</h3>
          <div className="grid grid-cols-1 gap-2">
            {PREDEFINED_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-3 text-sm"
                onClick={() => handlePredefinedQuestion(question)}
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t bg-card/80 backdrop-blur-sm">
        {/* Selected File Display */}
        {selectedFile && (
          <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
            <span className="text-sm">📎 {selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeSelectedFile}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex flex-1 gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question..."
              disabled={isLoading}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-3"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" disabled={isLoading || (!inputMessage.trim() && !selectedFile)}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
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