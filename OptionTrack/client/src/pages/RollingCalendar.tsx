import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, RotateCcw, TrendingUp, Trash2 } from "lucide-react"
import { AddRollingOpportunityDialog } from "@/components/AddRollingOpportunityDialog"
import { 
  getRollingOpportunities, 
  getRollingOpportunitiesSummary, 
  deleteRollingOpportunity,
  RollingOpportunity,
  RollingOpportunitySummary 
} from "@/api/rolling"
import { useToast } from "@/hooks/useToast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function RollingCalendar() {
  const [opportunities, setOpportunities] = useState<RollingOpportunity[]>([])
  const [summary, setSummary] = useState<RollingOpportunitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [opportunitiesResponse, summaryResponse] = await Promise.all([
        getRollingOpportunities({ status: 'pending' }),
        getRollingOpportunitiesSummary()
      ])
      
      setOpportunities(opportunitiesResponse.data || [])
      setSummary(summaryResponse.data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOpportunity = async (id: string) => {
    try {
      setDeleteLoading(id)
      await deleteRollingOpportunity(id)
      toast({
        title: 'Success',
        description: 'Rolling opportunity deleted successfully',
      })
      await fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStrategyLabel = (strategy: string) => {
    const labels: { [key: string]: string } = {
      'covered_call': 'Covered Call',
      'cash_secured_put': 'Cash Secured Put',
      'protective_put': 'Protective Put',
      'naked_put': 'Naked Put',
      'naked_call': 'Naked Call'
    }
    return labels[strategy] || strategy
  }

  const groupOpportunitiesByWeek = (opportunities: RollingOpportunity[]) => {
    const now = new Date()
    const thisWeek: RollingOpportunity[] = []
    const nextWeek: RollingOpportunity[] = []
    const monthEnd: RollingOpportunity[] = []

    opportunities.forEach(opp => {
      const expDate = new Date(opp.currentExpiration)
      const daysDiff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff <= 7) {
        thisWeek.push(opp)
      } else if (daysDiff <= 14) {
        nextWeek.push(opp)
      } else {
        monthEnd.push(opp)
      }
    })

    return { thisWeek, nextWeek, monthEnd }
  }

  const { thisWeek, nextWeek, monthEnd } = groupOpportunitiesByWeek(opportunities)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rolling Calendar</h1>
            <p className="text-muted-foreground">
              Track expiration dates and rolling opportunities
            </p>
          </div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rolling Calendar</h1>
          <p className="text-muted-foreground">
            Track expiration dates and rolling opportunities
          </p>
        </div>
        <AddRollingOpportunityDialog onOpportunityAdded={fetchData} />
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Total Opportunities</p>
                  <p className="text-2xl font-bold">{summary.totalOpportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Pending</p>
                  <p className="text-2xl font-bold">{summary.pendingOpportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Expiring This Week</p>
                  <p className="text-2xl font-bold">{summary.expiringThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">Potential Credit</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.potentialCredit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rolling Opportunities */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RotateCcw className="h-5 w-5 mr-2" />
            Rolling Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rolling opportunities found. Create your first opportunity to get started.
              </div>
            ) : (
              opportunities.map((opportunity) => (
                <div key={opportunity._id} className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">
                        {opportunity.symbol} ${opportunity.currentStrike} {getStrategyLabel(opportunity.strategy)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {formatDate(opportunity.currentExpiration)} • Roll to {formatDate(opportunity.suggestedExpiration)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {opportunity.contracts} contract{opportunity.contracts > 1 ? 's' : ''} • {opportunity.daysToExpiration} days to expiration
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant="outline" 
                      className={opportunity.creditReceived > 0 ? "text-success border-success" : "text-destructive border-destructive"}
                    >
                      {opportunity.creditReceived > 0 ? '+' : ''}{formatCurrency(opportunity.creditReceived)} Credit
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={deleteLoading === opportunity._id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Rolling Opportunity</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this rolling opportunity for {opportunity.symbol}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteOpportunity(opportunity._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm">Roll Position</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiration Calendar */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Expirations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border border-border/50">
              <div className="font-medium mb-2">This Week ({thisWeek.length})</div>
              <div className="space-y-2">
                {thisWeek.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No expirations</div>
                ) : (
                  thisWeek.map((opp) => (
                    <div key={opp._id} className="text-sm">
                      {opp.symbol} ${opp.currentStrike} {getStrategyLabel(opp.strategy)} - {formatDate(opp.currentExpiration)}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <div className="font-medium mb-2">Next Week ({nextWeek.length})</div>
              <div className="space-y-2">
                {nextWeek.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No expirations</div>
                ) : (
                  nextWeek.map((opp) => (
                    <div key={opp._id} className="text-sm">
                      {opp.symbol} ${opp.currentStrike} {getStrategyLabel(opp.strategy)} - {formatDate(opp.currentExpiration)}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <div className="font-medium mb-2">Month End ({monthEnd.length})</div>
              <div className="space-y-2">
                {monthEnd.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No expirations</div>
                ) : (
                  monthEnd.map((opp) => (
                    <div key={opp._id} className="text-sm">
                      {opp.symbol} ${opp.currentStrike} {getStrategyLabel(opp.strategy)} - {formatDate(opp.currentExpiration)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}