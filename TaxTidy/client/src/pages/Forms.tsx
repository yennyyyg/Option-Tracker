import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Plus, FileText } from 'lucide-react';
import { getTaxForms, updateTaxForm, addCustomTaxForm, TaxForm } from '@/api/forms';
import { useToast } from '@/hooks/useToast';
import { FormChecklist } from '@/components/forms/FormChecklist';
import { AddFormDialog } from '@/components/forms/AddFormDialog';

export function Forms() {
  const [forms, setForms] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        console.log('Fetching tax forms...');
        const response = await getTaxForms();
        setForms((response as any).forms);
        console.log('Tax forms loaded successfully');
      } catch (error) {
        console.error('Error fetching forms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tax forms',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [toast]);

  const handleToggleForm = async (formId: string, completed: boolean, notes?: string) => {
    try {
      console.log('Updating form:', formId, completed);
      await updateTaxForm(formId, { completed, notes });
      setForms(forms.map(form =>
        form._id === formId ? { ...form, completed, notes } : form
      ));
      toast({
        title: 'Success',
        description: `Form ${completed ? 'completed' : 'marked as incomplete'}`
      });
    } catch (error) {
      console.error('Error updating form:', error);
      toast({
        title: 'Error',
        description: 'Failed to update form',
        variant: 'destructive'
      });
    }
  };

  const handleAddForm = async (formData: { name: string; description: string; category: string }) => {
    try {
      console.log('Adding custom form:', formData);
      const response = await addCustomTaxForm(formData);
      setForms([...forms, (response as any).form]);
      setShowAddForm(false);
      toast({
        title: 'Success',
        description: 'Custom form added successfully'
      });
    } catch (error) {
      console.error('Error adding form:', error);
      toast({
        title: 'Error',
        description: 'Failed to add custom form',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedForms = forms.filter(form => form.completed).length;
  const totalForms = forms.length;
  const completionPercentage = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;

  const formsByCategory = forms.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as Record<string, TaxForm[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tax Forms Checklist
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your required tax documents and forms
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Form
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="backdrop-blur-sm bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-400">
                {completedForms} of {totalForms}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                Forms completed
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-800 dark:text-green-400">
                {completionPercentage}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                Complete
              </div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Forms by Category */}
      <div className="space-y-6">
        {Object.entries(formsByCategory).map(([category, categoryForms]) => (
          <Card key={category} className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {category}
                </div>
                <Badge variant="secondary">
                  {categoryForms.filter(f => f.completed).length} / {categoryForms.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                {category === 'Income' && 'Documents related to your income sources'}
                {category === 'Deductions' && 'Receipts and documents for tax deductions'}
                {category === 'Reference' && 'Supporting documents and previous returns'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormChecklist
                forms={categoryForms}
                onToggleForm={handleToggleForm}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <AddFormDialog
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onAddForm={handleAddForm}
      />
    </div>
  );
}