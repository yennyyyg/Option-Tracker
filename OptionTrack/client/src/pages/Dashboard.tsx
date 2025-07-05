import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { getPortfolioSummary, type PortfolioSummary } from "@/api/portfolio"
import { getConnectedAccounts } from "@/api/plaid"
import { getExpiringOptions, type ExpiringOption } from "@/api/positions"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

interface ConnectedAccount {
  id: string;
  institutionName: string;
  institutionId: string;
  accountCount: number;
  lastSyncAt: string | null;
  createdAt: string;
}

export function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [expiringOptions, setExpiringOptions] = useState<ExpiringOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<7 | 14 | 30>(7)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Loading dashboard data...')
        setLoading(true)

        const [summaryData, accountsData, expiringData] = await Promise.all([
          getPortfolioSummary(),
          getConnectedAccounts(),
          getExpiringOptions(selectedTimeframe)
        ])

        console.log('Dashboard data loaded:', {
          summary: summaryData.summary,
          accounts: accountsData.data,
          expiring: expiringData.expiringOptions
        })

        setSummary(summaryData.summary)
        setConnectedAccounts(accountsData.data || [])
        setExpiringOptions(expiringData.expiringOptions)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedTimeframe, toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!summary) return null

  const progressPercentage = (summary.monthlyOptionsIncome / summary.monthlyIncomeTarget) * 100

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Track your options trading performance and manage risk
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 bg-background border border-border rounded-lg text-sm">
            <option>All Accounts</option>
            {connectedAccounts.map((account) => (
              <option key={account.id}>{account.institutionName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Connected Accounts Info */}
      {connectedAccounts.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {connectedAccounts.map((account) => (
                <Badge key={account.id} variant="outline" className="text-sm">
                  {account.institutionName} ({account.accountCount} account{account.accountCount !== 1 ? 's' : ''})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <div className={cn(
              "flex items-center text-xs",
              summary.dailyPnL >= 0 ? "text-success" : "text-destructive"
            )}>
              {summary.dailyPnL >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {formatCurrency(Math.abs(summary.dailyPnL))} ({formatPercent(summary.dailyPnLPercent)})
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Buying Power</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.availableBuyingPower)}</div>
            <p className="text-xs text-muted-foreground">
              Ready for new positions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium to Collect</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(summary.premiumToCollect)}</div>
            <p className="text-xs text-muted-foreground">
              From open positions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{summary.assignmentRisk}</div>
            <p className="text-xs text-muted-foreground">
              Contracts at risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Income Progress */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Monthly Options Income
            <Badge variant="outline" className="text-xs">
              {formatPercent(progressPercentage - 100)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Current: {formatCurrency(summary.monthlyOptionsIncome)}</span>
            <span>Target: {formatCurrency(summary.monthlyIncomeTarget)}</span>
          </div>
          <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progressPercentage >= 100
              ? `🎉 Target exceeded by ${formatCurrency(summary.monthlyOptionsIncome - summary.monthlyIncomeTarget)}`
              : `${formatCurrency(summary.monthlyIncomeTarget - summary.monthlyOptionsIncome)} remaining to reach target`
            }
          </p>
        </CardContent>
      </Card>

      {/* Options Expiration Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Options Expiration Timeline
            </CardTitle>
            <Tabs value={selectedTimeframe.toString()} onValueChange={(value) => setSelectedTimeframe(Number(value) as 7 | 14 | 30)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="7">7 Days</TabsTrigger>
                <TabsTrigger value="14">14 Days</TabsTrigger>
                <TabsTrigger value="30">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiringOptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No options expiring in the next {selectedTimeframe} days
              </p>
            ) : (
              expiringOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{option.symbol}</span>
                      <span className="text-sm text-muted-foreground">{option.strategy}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">${option.strike} Strike</span>
                      <span className="text-xs text-muted-foreground">{option.expiration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(option.premiumCollected)}</div>
                      <div className="text-xs text-muted-foreground">Premium</div>
                    </div>
                    <Badge
                      variant={
                        option.assignmentProbability > 0.5
                          ? "destructive"
                          : option.assignmentProbability > 0.25
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {Math.round(option.assignmentProbability * 100)}% Risk
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{option.daysToExpiration}d</div>
                      <div className="text-xs text-muted-foreground">to exp</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">AAPL Covered Call Expired Worthless</p>
                <p className="text-xs text-muted-foreground">Collected $450 premium • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">TSLA Put Assignment</p>
                <p className="text-xs text-muted-foreground">Assigned 100 shares at $240 • 1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">MSFT Iron Condor Rolled</p>
                <p className="text-xs text-muted-foreground">Rolled to next week for $125 credit • 2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}