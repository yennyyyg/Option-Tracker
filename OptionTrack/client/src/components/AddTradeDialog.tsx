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
import { createPremiumTrade } from "@/api/premium"
import { useToast } from "@/hooks/useToast"

interface AddTradeDialogProps {
  onTradeAdded: () => void
}

export function AddTradeDialog({ onTradeAdded }: AddTradeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    symbol: "",
    strategy: "",
    strike: "",
    expiration: "",
    contracts: "",
    premiumCollected: "",
    status: "open"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createPremiumTrade({
        symbol: formData.symbol,
        strategy: formData.strategy,
        strike: parseFloat(formData.strike),
        expiration: formData.expiration,
        contracts: parseInt(formData.contracts),
        premiumCollected: parseFloat(formData.premiumCollected),
        status: formData.status
      })

      toast({
        title: "Success",
        description: "Trade added successfully",
      })

      setFormData({
        symbol: "",
        strategy: "",
        strike: "",
        expiration: "",
        contracts: "",
        premiumCollected: "",
        status: "open"
      })
      
      setOpen(false)
      onTradeAdded()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add trade",
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
          Add Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>
            Enter the details of your new options trade.
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
              <Label htmlFor="strategy">Strategy</Label>
              <Select
                value={formData.strategy}
                onValueChange={(value) => setFormData({ ...formData, strategy: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="covered-call">Covered Call</SelectItem>
                  <SelectItem value="cash-secured-put">Cash Secured Put</SelectItem>
                  <SelectItem value="iron-condor">Iron Condor</SelectItem>
                  <SelectItem value="credit-spread">Credit Spread</SelectItem>
                  <SelectItem value="protective-put">Protective Put</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strike">Strike Price</Label>
              <Input
                id="strike"
                type="number"
                step="0.01"
                value={formData.strike}
                onChange={(e) => setFormData({ ...formData, strike: e.target.value })}
                placeholder="150.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contracts">Contracts</Label>
              <Input
                id="contracts"
                type="number"
                value={formData.contracts}
                onChange={(e) => setFormData({ ...formData, contracts: e.target.value })}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date</Label>
              <Input
                id="expiration"
                type="date"
                value={formData.expiration}
                onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premium">Premium Collected</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                value={formData.premiumCollected}
                onChange={(e) => setFormData({ ...formData, premiumCollected: e.target.value })}
                placeholder="250.00"
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
              {loading ? "Adding..." : "Add Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}