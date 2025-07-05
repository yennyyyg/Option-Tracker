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
import { Plus } from "lucide-react"
import { createRollingOpportunity } from "@/api/rolling"
import { useToast } from "@/hooks/useToast"

interface AddRollingOpportunityDialogProps {
  onOpportunityAdded: () => void
}

export function AddRollingOpportunityDialog({ onOpportunityAdded }: AddRollingOpportunityDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    symbol: "",
    currentStrike: "",
    currentExpiration: "",
    currentPremium: "",
    suggestedStrike: "",
    suggestedExpiration: "",
    suggestedPremium: "",
    creditReceived: "",
    daysToExpiration: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createRollingOpportunity({
        symbol: formData.symbol,
        currentStrike: parseFloat(formData.currentStrike),
        currentExpiration: formData.currentExpiration,
        currentPremium: parseFloat(formData.currentPremium),
        suggestedStrike: parseFloat(formData.suggestedStrike),
        suggestedExpiration: formData.suggestedExpiration,
        suggestedPremium: parseFloat(formData.suggestedPremium),
        creditReceived: parseFloat(formData.creditReceived),
        daysToExpiration: parseInt(formData.daysToExpiration)
      })

      toast({
        title: "Success",
        description: "Rolling opportunity added successfully",
      })

      setFormData({
        symbol: "",
        currentStrike: "",
        currentExpiration: "",
        currentPremium: "",
        suggestedStrike: "",
        suggestedExpiration: "",
        suggestedPremium: "",
        creditReceived: "",
        daysToExpiration: ""
      })
      
      setOpen(false)
      onOpportunityAdded()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add rolling opportunity",
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
          Add Rolling Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Rolling Opportunity</DialogTitle>
          <DialogDescription>
            Create a new rolling opportunity for an existing options position.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStrike">Current Strike</Label>
              <Input
                id="currentStrike"
                type="number"
                step="0.01"
                value={formData.currentStrike}
                onChange={(e) => setFormData({ ...formData, currentStrike: e.target.value })}
                placeholder="150.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suggestedStrike">Suggested Strike</Label>
              <Input
                id="suggestedStrike"
                type="number"
                step="0.01"
                value={formData.suggestedStrike}
                onChange={(e) => setFormData({ ...formData, suggestedStrike: e.target.value })}
                placeholder="155.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentExpiration">Current Expiration</Label>
              <Input
                id="currentExpiration"
                type="date"
                value={formData.currentExpiration}
                onChange={(e) => setFormData({ ...formData, currentExpiration: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suggestedExpiration">Suggested Expiration</Label>
              <Input
                id="suggestedExpiration"
                type="date"
                value={formData.suggestedExpiration}
                onChange={(e) => setFormData({ ...formData, suggestedExpiration: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPremium">Current Premium</Label>
              <Input
                id="currentPremium"
                type="number"
                step="0.01"
                value={formData.currentPremium}
                onChange={(e) => setFormData({ ...formData, currentPremium: e.target.value })}
                placeholder="250.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suggestedPremium">Suggested Premium</Label>
              <Input
                id="suggestedPremium"
                type="number"
                step="0.01"
                value={formData.suggestedPremium}
                onChange={(e) => setFormData({ ...formData, suggestedPremium: e.target.value })}
                placeholder="300.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditReceived">Credit Received</Label>
              <Input
                id="creditReceived"
                type="number"
                step="0.01"
                value={formData.creditReceived}
                onChange={(e) => setFormData({ ...formData, creditReceived: e.target.value })}
                placeholder="50.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysToExpiration">Days to Expiration</Label>
              <Input
                id="daysToExpiration"
                type="number"
                value={formData.daysToExpiration}
                onChange={(e) => setFormData({ ...formData, daysToExpiration: e.target.value })}
                placeholder="30"
                required
              />
            </div>
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
              {loading ? "Adding..." : "Add Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}