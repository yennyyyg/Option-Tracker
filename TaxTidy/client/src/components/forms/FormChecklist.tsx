import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, StickyNote, Edit3 } from 'lucide-react';
import { TaxForm } from '@/api/forms';
import { cn } from '@/lib/utils';

interface FormChecklistProps {
  forms: TaxForm[];
  onToggleForm: (formId: string, completed: boolean, notes?: string) => void;
}

export function FormChecklist({ forms, onToggleForm }: FormChecklistProps) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleToggle = (form: TaxForm) => {
    onToggleForm(form._id, !form.completed, form.notes);
  };

  const handleEditNotes = (form: TaxForm) => {
    setEditingNotes(form._id);
    setNoteText(form.notes || '');
  };

  const handleSaveNotes = (form: TaxForm) => {
    onToggleForm(form._id, form.completed, noteText);
    setEditingNotes(null);
    setNoteText('');
  };

  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  return (
    <div className="space-y-3">
      {forms.map((form) => (
        <Card
          key={form._id}
          className={cn(
            'transition-all duration-200 hover:shadow-md',
            form.completed
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Checkbox
                  checked={form.completed}
                  onCheckedChange={() => handleToggle(form)}
                  className="h-5 w-5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      'font-medium',
                      form.completed
                        ? 'text-green-800 dark:text-green-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    )}>
                      {form.name}
                    </h4>
                    {form.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {form.completed && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditNotes(form)}
                    className="h-8 w-8 p-0"
                  >
                    {form.notes ? (
                      <StickyNote className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Edit3 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className={cn(
                  'text-sm mb-2',
                  form.completed
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-600 dark:text-gray-300'
                )}>
                  {form.description}
                </p>

                {editingNotes === form._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add notes about this form..."
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(form)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelNotes}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : form.notes && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      {form.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}