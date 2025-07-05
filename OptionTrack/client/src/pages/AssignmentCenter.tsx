import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react"
import { AddAssignmentDialog } from "@/components/AddAssignmentDialog"
import { getAssignments, getAssignmentSummary, deleteAssignment, Assignment, AssignmentSummary } from "@/api/assignments"
import { useToast } from "@/hooks/useToast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AssignmentCenter() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [summary, setSummary] = useState<AssignmentSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [assignmentsResponse, summaryResponse] = await Promise.all([
        getAssignments(),
        getAssignmentSummary()
      ])

      if (assignmentsResponse.data?.success) {
        setAssignments(assignmentsResponse.data.data)
      }

      if (summaryResponse.data?.success) {
        setSummary(summaryResponse.data.data)
      }
    } catch (error: any) {
      console.error('Error loading assignment data:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load assignment data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId)
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })
      loadData() // Refresh the data
    } catch (error: any) {
      console.error('Error deleting assignment:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      })
    }
  }

  const getAssignmentRiskBadge = (probability: number) => {
    if (probability >= 70) {
      return <Badge variant="destructive">{probability}% Risk</Badge>
    } else if (probability >= 40) {
      return <Badge variant="secondary">{probability}% Risk</Badge>
    } else {
      return <Badge variant="outline">{probability}% Risk</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignment Center</h1>
            <p className="text-muted-foreground">Loading assignment data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignment Center</h1>
          <p className="text-muted-foreground">
            Monitor assignment risk and manage assigned positions
          </p>
        </div>
        <AddAssignmentDialog onAssignmentAdded={loadData} />
      </div>

      {/* Assignment Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.monthlyAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total assignments
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.assignmentRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Of total options
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${summary?.avgProfit || 0}</div>
            <p className="text-xs text-muted-foreground">
              Per assignment
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{summary?.highRiskAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              High probability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Positions */}
      {assignments.filter(a => a.assignmentProbability >= 70 && a.status === 'active').length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
              High Assignment Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments
                .filter(assignment => assignment.assignmentProbability >= 70 && assignment.status === 'active')
                .map((assignment) => (
                  <div key={assignment._id} className="flex items-center justify-between p-4 rounded-lg border border-warning/20 bg-warning/5">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{assignment.symbol} ${assignment.strike} {assignment.strategy.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          Exp: {new Date(assignment.option.expiration).toLocaleDateString()} • {assignment.contracts} contract{assignment.contracts > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getAssignmentRiskBadge(assignment.assignmentProbability)}
                      <div className="text-right">
                        <div className="font-medium">${assignment.premiumKept}</div>
                        <div className="text-sm text-muted-foreground">Premium</div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this assignment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAssignment(assignment._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Assignments */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found. Create your first assignment to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between p-4 rounded-lg bg-accent/20">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {assignment.symbol} ${assignment.strike} {assignment.strategy.toUpperCase()}
                        {assignment.status !== 'active' && (
                          <span className="ml-2">
                            {getStatusBadge(assignment.status)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(assignment.assignmentDate).toLocaleDateString()} • {assignment.contracts} contract{assignment.contracts > 1 ? 's' : ''}
                        {assignment.notes && ` • ${assignment.notes}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {assignment.assignmentProbability > 0 && getAssignmentRiskBadge(assignment.assignmentProbability)}
                    <div className="text-right">
                      <div className={`font-medium ${assignment.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {assignment.totalPnL >= 0 ? '+' : ''}${assignment.totalPnL}
                      </div>
                      <div className="text-sm text-muted-foreground">Total P&L</div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this assignment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAssignment(assignment._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}