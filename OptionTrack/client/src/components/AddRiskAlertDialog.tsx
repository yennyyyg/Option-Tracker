import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createRiskAlert } from "@/api/riskAlerts"
import { useToast } from "@/hooks/useToast"

interface AddRiskAlertDialogProps {
  onAlertAdded: () => void
}

export function AddRiskAlertDialog({ onAlertAdded }: AddRiskAlertDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    alertType: "",
    symbol: "",
    condition: "",
    threshold: "",
    message: "",
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createRiskAlert({
        alertType: formData.alertType,
        symbol: formData.symbol,
        condition: formData.condition,
        threshold: parseFloat(formData.threshold),
        message: formData.message,
        isActive: formData.isActive
      })

      toast({
        title: "Success",
        description: "Risk alert added successfully",
      })

      setFormData({
        alertType: "",
        symbol: "",
        condition: "",
        threshold: "",
        message: "",
        isActive: true
      })

      setOpen(false)
      onAlertAdded()
    } catch (error: any) {
      console.error("Risk alert creation error:", error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to add risk alert",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Risk Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Risk Alert</DialogTitle>
          <DialogDescription>
            Create a new risk alert to monitor your positions and market conditions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="AAPL"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertType">Alert Type</Label>
              <Select
                value={formData.alertType}
                onValueChange={(value) => setFormData({ ...formData, alertType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price Alert</SelectItem>
                  <SelectItem value="volume">Volume Alert</SelectItem>
                  <SelectItem value="volatility">Volatility Alert</SelectItem>
                  <SelectItem value="assignment_risk">Assignment Risk</SelectItem>
                  <SelectItem value="expiration">Expiration Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                step="0.01"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                placeholder="150.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Alert Message</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Custom alert message"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}