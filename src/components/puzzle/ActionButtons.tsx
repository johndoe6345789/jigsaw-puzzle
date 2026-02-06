import { Button } from '@/components/ui/button'
import { ArrowsClockwise, ArrowCounterClockwise, Sparkle } from '@phosphor-icons/react'

interface ActionButtonsProps {
  isSolving: boolean
  onShuffle: () => void
  onReset: () => void
  onAISolve: () => void
  onStopSolve: () => void
}

export function ActionButtons({ isSolving, onShuffle, onReset, onAISolve, onStopSolve }: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {isSolving ? (
        <Button onClick={onStopSolve} variant="destructive" className="gap-2">
          <Sparkle size={18} weight="fill" />
          Stop AI
        </Button>
      ) : (
        <Button onClick={onAISolve} variant="default" className="gap-2 bg-accent hover:bg-accent/90">
          <Sparkle size={18} weight="fill" />
          AI Solve
        </Button>
      )}
      <Button onClick={onShuffle} variant="outline" className="gap-2" disabled={isSolving}>
        <ArrowsClockwise size={18} />
        Shuffle
      </Button>
      <Button onClick={onReset} variant="outline" className="gap-2" disabled={isSolving}>
        <ArrowCounterClockwise size={18} />
        Reset
      </Button>
    </div>
  )
}
