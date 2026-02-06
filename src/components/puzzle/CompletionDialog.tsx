import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle } from '@phosphor-icons/react'

interface CompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlayAgain: () => void
}

export function CompletionDialog({ open, onOpenChange, onPlayAgain }: CompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} weight="fill" className="text-accent" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Puzzle Complete! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Congratulations! You've successfully completed the puzzle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button onClick={onPlayAgain} className="flex-1">
            Play Again
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
