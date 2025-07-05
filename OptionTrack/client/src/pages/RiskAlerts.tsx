import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { Bell, AlertTriangle, TrendingDown, Calendar, DollarSign, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { getRiskAlerts, deleteRiskAlert, RiskAlert } from "@/api/riskAlerts"
import { AddRiskAlertDialog } from "@/components/AddRiskAlertDialog"

export function RiskAlerts() {
  console.log('RiskAlerts: Component initializing...')
  
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAlerts = async () => {
    try {
      console.log('RiskAlerts: Starting to fetch alerts...')
      setLoading(true)
      const response = await getRiskAlerts({ isActive: true })
      console.log('RiskAlerts: API response received:', response)
      console.log('RiskAlerts: Response data:', response.data)
      setAlerts(response.data.data || [])
      console.log('RiskAlerts: Alerts set to state:', response.data.data || [])
    } catch (error: any) {
      console.error('RiskAlerts: Error fetching risk alerts:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch risk alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      console.log('RiskAlerts: Loading set to false')
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      console.log('RiskAlerts: Starting to delete alert:', alertId)
      setDeletingId(alertId)
      const response = await deleteRiskAlert(alertId)
      console.log('RiskAlerts: Delete response:', response)

      toast({
        title: "Success",
        description: "Risk alert deleted successfully",
      })

      // Remove the deleted alert from the list
      setAlerts(alerts.filter(alert => alert._id !== alertId))
      console.log('RiskAlerts: Alert removed from state, remaining alerts:', alerts.filter(alert => alert._id !== alertId))
    } catch (error: any) {
      console.error('RiskAlerts: Error deleting risk alert:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete risk alert",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      console.log('RiskAlerts: Delete operation completed')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case 'warning':
        return <TrendingDown className="h-5 w-5 text-warning" />
      default:
        return <Calendar className="h-5 w-5 text-primary" />
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive' as const
      case 'warning':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  const getSeverityBorderClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/20 bg-destructive/5'
      case 'warning':
        return 'border-warning/20 bg-warning/5'
      default:
        return 'border-primary/20 bg-primary/5'
    }
  }

  const formatAlertType = (alertType: string) => {
    return alertType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  useEffect(() => {
    console.log('RiskAlerts: Component mounted, calling fetchAlerts')
    fetchAlerts()
  }, [])

  useEffect(() => {
    // Check if CSS classes are being applied correctly
    console.log('RiskAlerts: Checking CSS classes...')
    const elements = document.querySelectorAll('.glass-card')
    console.log('RiskAlerts: Found glass-card elements:', elements.length)
    elements.forEach((el, index) => {
      console.log(`RiskAlerts: glass-card ${index} computed styles:`, window.getComputedStyle(el))
    })
  }, [])

  console.log('RiskAlerts: Rendering component with alerts:', alerts, 'loading:', loading)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Alerts</h1>
          <p className="text-muted-foreground">
            Monitor risks and manage alert preferences
          </p>
        </div>
        <AddRiskAlertDialog onAlertCreated={() => {
          console.log('RiskAlerts: onAlertCreated callback triggered')
          fetchAlerts()
        }} />
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-warning" />
            Active Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading alerts...</div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts. Create your first alert to start monitoring risks.
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getSeverityBorderClass(alert.severity)}`}
                >
                  <div className="flex items-center space-x-4">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatAlertType(alert.alertType)}
                        </Badge>
                        {alert.symbol && (
                          <Badge variant="outline" className="text-xs">
                            {alert.symbol}
                          </Badge>
                        )}
                        {alert.strike && (
                          <Badge variant="outline" className="text-xs">
                            ${alert.strike}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityVariant(alert.severity)}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingId === alert._id}
                          onClick={() => console.log('RiskAlerts: Delete button clicked for alert:', alert._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Risk Alert</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this risk alert? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              console.log('RiskAlerts: Delete confirmation clicked for alert:', alert._id)
                              handleDeleteAlert(alert._id)
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === alert._id ? "Deleting..." : "Delete"}
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

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Assignment Risk Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Notify when options have high assignment probability
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Expiration Reminders</div>
                <div className="text-sm text-muted-foreground">
                  Alerts for upcoming option expirations
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Profit Target Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Notify when positions reach target profit levels
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Loss Limit Warnings</div>
                <div className="text-sm text-muted-foreground">
                  Alerts when positions exceed loss thresholds
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Margin Usage Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Warnings for high margin utilization
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Volatility Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Notify on significant IV changes
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">In-App Notifications</div>
              <div className="text-sm text-muted-foreground">
                Show notifications within the application
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Email Alerts</div>
              <div className="text-sm text-muted-foreground">
                Send alerts to your email address
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">SMS Notifications</div>
              <div className="text-sm text-muted-foreground">
                Text message alerts for critical events
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}