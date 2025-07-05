import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Activity, TrendingUp, TrendingDown, Zap, Calculator, Loader2 } from "lucide-react"
import { toast } from "@/hooks/useToast"
import {
  calculateDelta,
  calculateGamma,
  calculateTheta,
  calculateVega,
  calculateRho,
  calculateAllGreeks,
  GreeksParameters,
  GreeksResponse
} from "@/api/greeks"

export function GreeksMonitor() {
  const [parameters, setParameters] = useState<GreeksParameters>({
    S: 100,        // Current stock price
    K: 100,        // Strike price
    T: 0.25,       // Time to expiration (3 months)
    r: 0.05,       // Risk-free rate (5%)
    sigma: 0.2,    // Volatility (20%)
    optionType: 'call'
  })

  const [results, setResults] = useState<GreeksResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [calculatingGreek, setCalculatingGreek] = useState<string | null>(null)

  const handleParameterChange = (field: keyof GreeksParameters, value: string | number) => {
    setParameters(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'optionType' ? parseFloat(value) || 0 : value
    }))
  }

  const calculateSingleGreek = async (greekType: string) => {
    setCalculatingGreek(greekType)
    try {
      let result: GreeksResponse

      switch (greekType) {
        case 'delta':
          result = await calculateDelta(parameters)
          break
        case 'gamma':
          result = await calculateGamma(parameters)
          break
        case 'theta':
          result = await calculateTheta(parameters)
          break
        case 'vega':
          result = await calculateVega(parameters)
          break
        case 'rho':
          result = await calculateRho(parameters)
          break
        default:
          throw new Error('Invalid Greek type')
      }

      setResults(prev => prev ? { ...prev, ...result } : result)
      toast({
        title: "Success",
        description: `${greekType.charAt(0).toUpperCase() + greekType.slice(1)} calculated successfully`,
      })
    } catch (error: any) {
      console.error(`Error calculating ${greekType}:`, error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCalculatingGreek(null)
    }
  }

  const calculateAll = async () => {
    setLoading(true)
    try {
      const result = await calculateAllGreeks(parameters)
      setResults(result)
      toast({
        title: "Success",
        description: "All Greeks calculated successfully",
      })
    } catch (error: any) {
      console.error('Error calculating all Greeks:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatGreekValue = (value: number | undefined, decimals: number = 4): string => {
    return value !== undefined ? value.toFixed(decimals) : 'N/A'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Greeks Monitor</h1>
          <p className="text-muted-foreground">
            Calculate and monitor option Greeks using Black-Scholes model
          </p>
        </div>
      </div>

      {/* Input Parameters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Option Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current-price">Current Stock Price (S)</Label>
              <Input
                id="current-price"
                type="number"
                step="0.01"
                value={parameters.S}
                onChange={(e) => handleParameterChange('S', e.target.value)}
                placeholder="100.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strike-price">Strike Price (K)</Label>
              <Input
                id="strike-price"
                type="number"
                step="0.01"
                value={parameters.K}
                onChange={(e) => handleParameterChange('K', e.target.value)}
                placeholder="100.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-to-expiry">Time to Expiry (T) - Years</Label>
              <Input
                id="time-to-expiry"
                type="number"
                step="0.01"
                value={parameters.T}
                onChange={(e) => handleParameterChange('T', e.target.value)}
                placeholder="0.25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-free-rate">Risk-Free Rate (r)</Label>
              <Input
                id="risk-free-rate"
                type="number"
                step="0.001"
                value={parameters.r}
                onChange={(e) => handleParameterChange('r', e.target.value)}
                placeholder="0.05"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volatility">Volatility (σ)</Label>
              <Input
                id="volatility"
                type="number"
                step="0.01"
                value={parameters.sigma}
                onChange={(e) => handleParameterChange('sigma', e.target.value)}
                placeholder="0.20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option-type">Option Type</Label>
              <Select
                value={parameters.optionType}
                onValueChange={(value: 'call' | 'put') => handleParameterChange('optionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="put">Put</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={calculateAll}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              Calculate All Greeks
            </Button>

            <Button
              variant="outline"
              onClick={() => calculateSingleGreek('delta')}
              disabled={calculatingGreek === 'delta'}
            >
              {calculatingGreek === 'delta' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calculate Delta
            </Button>

            <Button
              variant="outline"
              onClick={() => calculateSingleGreek('gamma')}
              disabled={calculatingGreek === 'gamma'}
            >
              {calculatingGreek === 'gamma' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calculate Gamma
            </Button>

            <Button
              variant="outline"
              onClick={() => calculateSingleGreek('theta')}
              disabled={calculatingGreek === 'theta'}
            >
              {calculatingGreek === 'theta' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calculate Theta
            </Button>

            <Button
              variant="outline"
              onClick={() => calculateSingleGreek('vega')}
              disabled={calculatingGreek === 'vega'}
            >
              {calculatingGreek === 'vega' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calculate Vega
            </Button>

            <Button
              variant="outline"
              onClick={() => calculateSingleGreek('rho')}
              disabled={calculatingGreek === 'rho'}
            >
              {calculatingGreek === 'rho' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calculate Rho
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Greeks Results */}
      {results && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatGreekValue(results.delta)}
              </div>
              <p className="text-xs text-muted-foreground">
                Price sensitivity
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gamma</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatGreekValue(results.gamma)}
              </div>
              <p className="text-xs text-muted-foreground">
                Delta acceleration
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Theta</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatGreekValue(results.theta)}
              </div>
              <p className="text-xs text-muted-foreground">
                Time decay (per day)
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vega</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatGreekValue(results.vega)}
              </div>
              <p className="text-xs text-muted-foreground">
                Volatility sensitivity
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rho</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatGreekValue(results.rho)}
              </div>
              <p className="text-xs text-muted-foreground">
                Interest rate sensitivity
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Greeks Summary (Static for now) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Portfolio Greeks Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Net Delta</span>
                <span>-0.25</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Slightly bearish bias
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Risk Exposure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Theta</span>
                <span className="text-success">+$85</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Strong time decay income
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Greeks Breakdown (Static for now) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Position Greeks Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-medium">AAPL Covered Call</div>
                  <div className="text-sm text-muted-foreground">$185 Strike • Jan 19</div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm font-medium">-0.35</div>
                  <div className="text-xs text-muted-foreground">Delta</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-success">+0.15</div>
                  <div className="text-xs text-muted-foreground">Theta</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">-0.02</div>
                  <div className="text-xs text-muted-foreground">Gamma</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">-0.08</div>
                  <div className="text-xs text-muted-foreground">Vega</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}