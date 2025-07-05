import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, MessageSquare, Eye, Mail } from 'lucide-react';
import { getAdvisors, inviteAdvisor, getDocumentComments, addDocumentComment, Advisor, AdvisorComment } from '@/api/advisors';
import { useToast } from '@/hooks/useToast';
import { AdvisorList } from '@/components/advisors/AdvisorList';
import { InviteAdvisorDialog } from '@/components/advisors/InviteAdvisorDialog';
import { CommentsList } from '@/components/advisors/CommentsList';

export function Advisors() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [comments, setComments] = useState<AdvisorComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching advisors and comments...');
        const [advisorsResponse, commentsResponse] = await Promise.all([
          getAdvisors(),
          getDocumentComments('all') // Get all comments for demo
        ]);

        setAdvisors((advisorsResponse as any).advisors);
        setComments((commentsResponse as any).comments);
        console.log('Advisors and comments loaded successfully');
      } catch (error) {
        console.error('Error fetching advisor data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load advisor data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleInviteAdvisor = async (inviteData: { email: string; permissions: 'view' | 'comment'; message?: string }) => {
    try {
      console.log('Inviting advisor:', inviteData);
      await inviteAdvisor(inviteData);
      
      // Add the new advisor to the list with pending status
      const newAdvisor: Advisor = {
        _id: Date.now().toString(),
        email: inviteData.email,
        name: inviteData.email.split('@')[0],
        permissions: inviteData.permissions,
        invitedDate: new Date().toISOString(),
        status: 'pending'
      };
      
      setAdvisors([...advisors, newAdvisor]);
      setShowInviteDialog(false);
      
      toast({
        title: 'Success',
        description: 'Advisor invitation sent successfully'
      });
    } catch (error) {
      console.error('Error inviting advisor:', error);
      toast({
        title: 'Error',
        description: 'Failed to send advisor invitation',
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = async (documentId: string, comment: string) => {
    try {
      console.log('Adding comment:', documentId, comment);
      const response = await addDocumentComment({ documentId, comment });
      setComments([...comments, (response as any).comment]);
      
      toast({
        title: 'Success',
        description: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
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

  const activeAdvisors = advisors.filter(advisor => advisor.status === 'accepted');
  const pendingAdvisors = advisors.filter(advisor => advisor.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tax Advisor Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Collaborate with your tax advisors and CPAs
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Advisor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Active Advisors
                </p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  {activeAdvisors.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Pending Invites
                </p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                  {pendingAdvisors.length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Comments
                </p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                  {comments.length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advisors List */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Advisors
            </CardTitle>
            <CardDescription>
              Manage your tax advisor collaborations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvisorList advisors={advisors} />
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Comments
            </CardTitle>
            <CardDescription>
              Latest feedback from your advisors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommentsList 
              comments={comments} 
              onAddComment={handleAddComment}
            />
          </CardContent>
        </Card>
      </div>

      <InviteAdvisorDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInviteAdvisor={handleInviteAdvisor}
      />
    </div>
  );
}