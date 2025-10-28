import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PriceAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  stockName: string
  currentPrice: number
}

export function PriceAlertDialog({
  open,
  onOpenChange,
  symbol,
  stockName,
  currentPrice,
}: PriceAlertDialogProps) {
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!email || !targetPrice) {
      setError('Email and target price are required')
      return
    }

    const targetPriceNum = parseFloat(targetPrice)
    if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
      setError('Please enter a valid target price')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          stock_name: stockName,
          target_price: targetPriceNum,
          condition,
          email,
          notes,
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          // Reset form
          setEmail('')
          setTargetPrice('')
          setNotes('')
          setSuccess(false)
        }, 2000)
      } else {
        setError(data.error || 'Failed to create alert')
      }
    } catch (err) {
      setError('Failed to create alert. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Price Alert</DialogTitle>
          <DialogDescription>
            Get notified via email when {symbol} reaches your target price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-price">Current Price</Label>
              <Input
                id="current-price"
                value={`$${currentPrice.toFixed(2)}`}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-price">Target Price *</Label>
              <Input
                id="target-price"
                type="number"
                step="0.01"
                placeholder="Enter target price"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="condition">Condition *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={condition === 'above' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setCondition('above')}
                >
                  Price Goes Above
                </Button>
                <Button
                  type="button"
                  variant={condition === 'below' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setCondition('below')}
                >
                  Price Drops Below
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this alert..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                Alert created successfully! You'll receive an email when the price {condition === 'above' ? 'goes above' : 'drops below'} ${targetPrice}.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
