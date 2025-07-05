import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Target, Calendar, Trash2 } from "lucide-react"
import { AddTradeDialog } from "@/components/AddTradeDialog"
import { 
  getPremiumSummary, 
  getPremiumHistory, 
  getStrategyBreakdown, 
  deletePremiumTrade,
  PremiumSummary,
  PremiumTrade,
  StrategyBreakdown
} from "@/api/premium"
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

export function PremiumTracker() {
  const [summary, setSummary] = useState<PremiumSummary | null>(null)
  const [trades, setTrades] = useState<PremiumTrade[]>([])
  const [strategyBreakdown, setStrategyBreakdown] = useState<StrategyBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPremiumData()
  }, [])

  const fetchPremiumData = async () => {
    console.log('Loading premium data...')
    setIsLoading(true)
    try {
      const [summaryResponse, historyResponse, breakdownResponse] = await Promise.all([
        getPremiumSummary(),
        getPremiumHistory({ limit: 50 }),
        getStrategyBreakdown()
      ])

      console.log('All API responses received')
      console.log('Summary response success:', summaryResponse.data?.success)
      console.log('History response success:', historyResponse.data?.success)
      console.log('Breakdown response success:', breakdownResponse.data?.success)

      if (summaryResponse.data?.success) {
        console.log('Setting summary data:', summaryResponse.data.data)
        setSummary(summaryResponse.data.data)
      } else {
        console.log('Summary response not successful:', summaryResponse.data)
      }

      if (historyResponse.data?.success) {
        console.log('Setting trades data:', historyResponse.data.data)
        setTrades(historyResponse.data.data)
      } else {
        console.log('History response not successful:', historyResponse.data)
      }

      if (breakdownResponse.data?.success) {
        console.log('Setting breakdown data:', breakdownResponse.data.data)
        setStrategyBreakdown(breakdownResponse.data.data)
      } else {
        console.log('Breakdown response not successful:', breakdownResponse.data)
      }

    } catch (error: any) {
      console.error('Error fetching premium data:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load premium data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log('Premium data loading complete')
      console.log('Final state - Summary:', summary)
      console.log('Final state - Trades:', trades)
      console.log('Final state - Breakdown:', strategyBreakdown)
    }
  }

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      await deletePremiumTrade(tradeId)
      toast({
        title: "Success",
        description: "Trade deleted successfully",
      })
      fetchPremiumData() // Refresh the data
    } catch (error: any) {
      console.error('Error deleting trade:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete trade",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    console.log('Rendering loading state')
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Premium Tracker</h1>
            <p className="text-muted-foreground">Loading premium data...</p>
          </div>
        </div>
      </div>
    )
  }

  console.log('Rendering main content')
  console.log('Current summary state:', summary)
  console.log('Current trades state:', trades)
  console.log('Current breakdown state:', strategyBreakdown)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Premium Tracker</h1>
          <p className="text-muted-foreground">
            Track your options premium collection and performance
          </p>
        </div>
        <AddTradeDialog onTradeAdded={fetchPremiumData} />
      </div>

      {/* Premium Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${summary?.thisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              Premium collected
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${summary?.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              Monthly total
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Quarter</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${summary?.thisQuarter || 0}</div>
            <p className="text-xs text-muted-foreground">
              Quarterly performance
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${summary?.yearToDate || 0}</div>
            <p className="text-xs text-muted-foreground">
              Annual progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Breakdown */}
      {strategyBreakdown && strategyBreakdown.length > 0 ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Strategy Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategyBreakdown.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{strategy.strategy}</Badge>
                    <span className="text-sm text-muted-foreground">{strategy.count} trades</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${strategy.totalPremium}</div>
                    <div className="text-sm text-muted-foreground">{strategy.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Strategy Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No strategy data available. Add some trades to see breakdown.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Premium History</CardTitle>
        </CardHeader>
        <CardContent>
          {trades && trades.length > 0 ? (
            <div className="space-y-4">
              {trades.map((trade) => (
                <div key={trade._id} className="flex items-center justify-between p-4 rounded-lg bg-accent/20">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">
                        {trade.symbol} ${trade.strike} {trade.strategy.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(trade.openDate).toLocaleDateString()} - {new Date(trade.closeDate).toLocaleDateString()}
                        • {trade.daysHeld} days • {trade.outcome}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-success">${trade.premium}</div>
                      <div className="text-sm text-muted-foreground">{trade.annualizedReturn}% annual</div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this trade? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTrade(trade._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No premium trades found. Create your first trade to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}