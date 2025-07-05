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
import { createAssignment } from "@/api/assignments"
import { useToast } from "@/hooks/useToast"

interface AddAssignmentDialogProps {
  onAssignmentAdded: () => void
}

export function AddAssignmentDialog({ onAssignmentAdded }: AddAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    symbol: "",
    strategy: "",
    strike: "",
    assignmentDate: "",
    contracts: "",
    premiumKept: "",
    stockPrice: "",
    totalPnL: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createAssignment({
        symbol: formData.symbol,
        strategy: formData.strategy,
        strike: parseFloat(formData.strike),
        assignmentDate: formData.assignmentDate,
        contracts: parseInt(formData.contracts),
        premiumKept: parseFloat(formData.premiumKept),
        stockPrice: parseFloat(formData.stockPrice),
        totalPnL: parseFloat(formData.totalPnL)
      })

      toast({
        title: "Success",
        description: "Assignment added successfully",
      })

      setFormData({
        symbol: "",
        strategy: "",
        strike: "",
        assignmentDate: "",
        contracts: "",
        premiumKept: "",
        stockPrice: "",
        totalPnL: ""
      })
      
      setOpen(false)
      onAssignmentAdded()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add assignment",
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
          Add Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Assignment</DialogTitle>
          <DialogDescription>
            Record a new options assignment with all relevant details.
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
              <Label htmlFor="assignmentDate">Assignment Date</Label>
              <Input
                id="assignmentDate"
                type="date"
                value={formData.assignmentDate}
                onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premiumKept">Premium Kept</Label>
              <Input
                id="premiumKept"
                type="number"
                step="0.01"
                value={formData.premiumKept}
                onChange={(e) => setFormData({ ...formData, premiumKept: e.target.value })}
                placeholder="250.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockPrice">Stock Price</Label>
              <Input
                id="stockPrice"
                type="number"
                step="0.01"
                value={formData.stockPrice}
                onChange={(e) => setFormData({ ...formData, stockPrice: e.target.value })}
                placeholder="155.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPnL">Total P&L</Label>
              <Input
                id="totalPnL"
                type="number"
                step="0.01"
                value={formData.totalPnL}
                onChange={(e) => setFormData({ ...formData, totalPnL: e.target.value })}
                placeholder="500.00"
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
              {loading ? "Adding..." : "Add Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}