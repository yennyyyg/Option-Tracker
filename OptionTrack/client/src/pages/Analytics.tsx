import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3, Target } from "lucide-react"

export function Analytics() {
  console.log('Analytics: Component initializing...')

  const [timeRange, setTimeRange] = useState('24h')

  // Mock trading analytics data
  const tradingMetrics = {
    winRate: 87.5,
    avgReturn: 28.4,
    sharpeRatio: 1.85,
    maxDrawdown: -5.2
  }

  const strategyPerformance = [
    {
      name: 'Covered Calls',
      sharpe: 2.1,
      maxDrawdown: -3.2,
      riskLevel: 'Low Risk',
      returns: 32.1,
      winRate: 92
    },
    {
      name: 'Iron Condors',
      sharpe: 1.8,
      maxDrawdown: -4.1,
      riskLevel: 'Moderate',
      returns: 26.8,
      winRate: 85
    },
    {
      name: 'Cash-Secured Puts',
      sharpe: 1.6,
      maxDrawdown: -8.5,
      riskLevel: 'Higher Risk',
      returns: 24.3,
      winRate: 78
    }
  ]

  const marketConditions = [
    {
      condition: 'Bull Market',
      winRate: 91,
      avgReturn: 34.2,
      bestStrategy: 'Covered Calls'
    },
    {
      condition: 'Sideways Market',
      winRate: 89,
      avgReturn: 28.7,
      bestStrategy: 'Iron Condors'
    },
    {
      condition: 'Bear Market',
      winRate: 78,
      avgReturn: 18.3,
      bestStrategy: 'Cash-Secured Puts'
    }
  ]

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'default'
      case 'Moderate':
        return 'secondary'
      case 'Higher Risk':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  useEffect(() => {
    console.log('Analytics: Component mounted - displaying trading analytics only')
  }, [])

  console.log('Analytics: Rendering component with timeRange:', timeRange)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Analyze performance and optimize your trading strategies
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tradingMetrics.winRate}%</div>
            <p className="text-xs text-muted-foreground">Profitable trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tradingMetrics.avgReturn}%</div>
            <p className="text-xs text-muted-foreground">Annualized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tradingMetrics.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{tradingMetrics.maxDrawdown}%</div>
            <p className="text-xs text-muted-foreground">Peak to trough</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="returns" className="space-y-4">
            <TabsList>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              <TabsTrigger value="winrate">Win Rate</TabsTrigger>
              <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="returns" className="space-y-4">
              {strategyPerformance.map((strategy) => (
                <div key={strategy.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{strategy.name}</div>
                    <Badge variant={getRiskBadgeVariant(strategy.riskLevel)}>
                      {strategy.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-green-600">+{strategy.returns}%</div>
                      <div className="text-sm text-muted-foreground">Annual Return</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="winrate" className="space-y-4">
              {strategyPerformance.map((strategy) => (
                <div key={strategy.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{strategy.name}</div>
                    <Badge variant={getRiskBadgeVariant(strategy.riskLevel)}>
                      {strategy.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <Progress value={strategy.winRate} className="h-2" />
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{strategy.winRate}%</div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              {strategyPerformance.map((strategy) => (
                <div key={strategy.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{strategy.name}</div>
                    <Badge variant={getRiskBadgeVariant(strategy.riskLevel)}>
                      {strategy.riskLevel}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="font-medium">Sharpe: {strategy.sharpe}</span> |
                      <span className="font-medium"> Max DD: {strategy.maxDrawdown}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{strategy.riskLevel}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance by Market Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Market Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {marketConditions.map((condition) => (
              <div key={condition.condition} className="p-4 border rounded-lg space-y-3">
                <div className="font-medium text-lg">{condition.condition}</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate:</span>
                    <span className="font-medium text-green-600">{condition.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Return:</span>
                    <span className="font-medium text-green-600">{condition.avgReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Best Strategy:</span>
                    <span className="font-medium text-blue-600">{condition.bestStrategy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}