import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DomainQuestion {
  id: string;
  question: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface QuestionFormData {
  question: string;
  category: string;
  is_active: boolean;
}

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<DomainQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DomainQuestion | null>(null);

  const form = useForm<QuestionFormData>({
    defaultValues: {
      question: "",
      category: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (!roleLoading && userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      return;
    }

    if (userRole === 'admin') {
      fetchQuestions();
    }
  }, [userRole, roleLoading, toast]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('domain_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestion = async (data: QuestionFormData) => {
    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('domain_questions')
          .update({
            question: data.question,
            category: data.category || null,
            is_active: data.is_active,
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        // Create new question
        const { error } = await supabase
          .from('domain_questions')
          .insert({
            question: data.question,
            category: data.category || null,
            is_active: data.is_active,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question created successfully",
        });
      }

      form.reset();
      setEditingQuestion(null);
      setIsDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: "Failed to save question",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = (question: DomainQuestion) => {
    setEditingQuestion(question);
    form.reset({
      question: question.question,
      category: question.category || "",
      is_active: question.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('domain_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (question: DomainQuestion) => {
    try {
      const { error } = await supabase
        .from('domain_questions')
        .update({ is_active: !question.is_active })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Question ${!question.is_active ? 'activated' : 'deactivated'}`,
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error toggling question status:', error);
      toast({
        title: "Error",
        description: "Failed to update question status",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingQuestion(null);
    form.reset({
      question: "",
      category: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage domain-specific questions</p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Domain Questions</h2>
            <span className="text-sm text-muted-foreground">
              {questions.length} total questions
            </span>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveQuestion)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="question"
                    rules={{ required: "Question is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the domain-specific question..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technical, Business, General" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this question available to users
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingQuestion(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingQuestion ? 'Update' : 'Create'} Question
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div>Loading questions...</div>
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first domain-specific question.
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Switch
                          checked={question.is_active}
                          onCheckedChange={() => handleToggleActive(question)}
                          className="scale-75"
                        />
                        <span className={`text-sm font-medium ${
                          question.is_active ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {question.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {question.category && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {question.category}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground mb-2">{question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(question.created_at).toLocaleDateString()}
                        {question.updated_at !== question.created_at && (
                          <span> • Updated: {new Date(question.updated_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this question? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};