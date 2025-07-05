import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TrendingUp, TrendingDown, Search, Filter, Plus } from "lucide-react"
import { getPositions, getOptions, getBrokerageAccounts, getExpiringOptions } from "@/api/positions"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

interface Position {
  id: string
  symbol: string
  shares: number
  averageCost: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  dayChange: number
  source?: string
  institutionName?: string
}

interface Option {
  id: string
  symbol: string
  strategy: string
  strike: number
  expiration: string
  contracts: number
  premiumCollected: number
  currentValue: number
  delta?: number
  theta?: number
  gamma?: number
  vega?: number
  rho?: number
}

interface BrokerageAccount {
  id: string
  accountName: string
  brokerageName: string
  accountType: string
  totalValue: number
  availableCash: number
  buyingPower: number
}

interface ExpiringOption {
  id: string
  symbol: string
  strategy: string
  strike: number
  expiration: string
  contracts: number
  premiumCollected: number
  assignmentProbability: number
  daysToExpiration: number
}

export function Positions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [accounts, setAccounts] = useState<BrokerageAccount[]>([])
  const [expiringOptions, setExpiringOptions] = useState<ExpiringOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState<7 | 14 | 30>(30)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [selectedTimeframe])

  const loadData = async () => {
    try {
      console.log('Positions: Loading positions data...')
      setLoading(true)

      const [positionsData, optionsData, accountsData, expiringData] = await Promise.all([
        getPositions(),
        getOptions(),
        getBrokerageAccounts(),
        getExpiringOptions(selectedTimeframe)
      ])

      console.log('Positions: Raw data received:')
      console.log('Positions: positionsData:', positionsData)
      console.log('Positions: optionsData:', optionsData)
      console.log('Positions: accountsData:', accountsData)
      console.log('Positions: expiringData:', expiringData)

      console.log('Positions: Data counts:', {
        positions: positionsData.positions?.length || 0,
        options: optionsData.options?.length || 0,
        accounts: accountsData.accounts?.length || 0,
        expiring: expiringData.expiringOptions?.length || 0
      })

      // Log first few positions to see their symbols
      if (positionsData.positions && positionsData.positions.length > 0) {
        console.log('Positions: First 10 stock positions:')
        positionsData.positions.slice(0, 10).forEach((pos, index) => {
          console.log(`  ${index + 1}. ${pos.symbol} (source: ${pos.source})`)
        })
      }

      // Log first few options to see their symbols  
      if (optionsData.options && optionsData.options.length > 0) {
        console.log('Positions: First 10 options:')
        optionsData.options.slice(0, 10).forEach((opt, index) => {
          console.log(`  ${index + 1}. ${opt.symbol} ${opt.strategy} $${opt.strike} (source: ${opt.source})`)
        })
      }

      setPositions(positionsData.positions || [])
      setOptions(optionsData.options || [])
      setAccounts(accountsData.accounts || [])
      setExpiringOptions(expiringData.expiringOptions || [])
    } catch (error: any) {
      console.error('Positions: Error loading positions data:', error)
      toast({
        title: "Error",
        description: "Failed to load positions data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createSampleData = async () => {
    try {
      console.log('Positions: Creating sample data...')
      const response = await fetch('/api/portfolio/create-sample-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create sample data')
      }

      const result = await response.json()
      console.log('Positions: Sample data created:', result)

      toast({
        title: "Success",
        description: "Sample data created successfully",
      })

      // Reload data
      await loadData()
    } catch (error: any) {
      console.error('Positions: Error creating sample data:', error)
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const filteredPositions = positions.filter(position =>
    position.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredOptions = options.filter(option =>
    option.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
          <p className="text-muted-foreground">
            Manage your stock and options positions across all accounts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={createSampleData} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Sample Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">
              Stock positions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Options Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{options.length}</div>
            <p className="text-xs text-muted-foreground">
              Active options
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{expiringOptions.length}</div>
            <p className="text-xs text-muted-foreground">
              Next {selectedTimeframe} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.brokerageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">Stock Positions</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Stock Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPositions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No stock positions found</p>
                  <Button onClick={createSampleData} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sample Data
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Avg Cost</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Market Value</TableHead>
                      <TableHead>Unrealized P&L</TableHead>
                      <TableHead>Day Change</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPositions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-medium">{position.symbol}</TableCell>
                        <TableCell>{position.shares}</TableCell>
                        <TableCell>{formatCurrency(position.averageCost)}</TableCell>
                        <TableCell>{formatCurrency(position.currentPrice)}</TableCell>
                        <TableCell>{formatCurrency(position.marketValue)}</TableCell>
                        <TableCell className={cn(
                          position.unrealizedPnL >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {formatCurrency(position.unrealizedPnL)}
                        </TableCell>
                        <TableCell className={cn(
                          position.dayChange >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {position.dayChange >= 0 ? (
                            <TrendingUp className="inline h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="inline h-4 w-4 mr-1" />
                          )}
                          {formatCurrency(Math.abs(position.dayChange))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={position.source === 'plaid' ? 'default' : 'secondary'}>
                            {position.source === 'plaid' ? position.institutionName : 'Manual'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Options Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No options positions found</p>
                  <Button onClick={createSampleData} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sample Data
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Strike</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Contracts</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOptions.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{option.strategy}</Badge>
                        </TableCell>
                        <TableCell>${option.strike}</TableCell>
                        <TableCell>{new Date(option.expiration).toLocaleDateString()}</TableCell>
                        <TableCell>{option.contracts}</TableCell>
                        <TableCell className="text-success">
                          {formatCurrency(option.premiumCollected)}
                        </TableCell>
                        <TableCell>{formatCurrency(option.currentValue)}</TableCell>
                        <TableCell className={cn(
                          (option.premiumCollected - option.currentValue) >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {formatCurrency(option.premiumCollected - option.currentValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expiring Options</CardTitle>
                <Select value={selectedTimeframe.toString()} onValueChange={(value) => setSelectedTimeframe(Number(value) as 7 | 14 | 30)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {expiringOptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No options expiring in the next {selectedTimeframe} days</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiringOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{option.symbol}</div>
                          <div className="text-sm text-muted-foreground">{option.strategy}</div>
                        </div>
                        <div>
                          <div className="text-sm">${option.strike} Strike</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(option.expiration).toLocaleDateString()}
                          </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Brokerage Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No brokerage accounts found</p>
                  <Button onClick={createSampleData} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sample Data
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {accounts.map((account) => (
                    <Card key={account.id} className="border-muted">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{account.accountName}</h4>
                            <Badge variant="outline">{account.accountType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{account.brokerageName}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total Value:</span>
                              <span className="text-sm font-medium">{formatCurrency(account.totalValue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Available Cash:</span>
                              <span className="text-sm font-medium">{formatCurrency(account.availableCash)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Buying Power:</span>
                              <span className="text-sm font-medium">{formatCurrency(account.buyingPower)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}