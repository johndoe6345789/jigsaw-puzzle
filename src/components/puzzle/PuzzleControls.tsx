import { ProgressDisplay } from './ProgressDisplay'
import { ActionButtons } from './ActionButtons'

interface PuzzleControlsProps {
  completionPercentage: number
  solvingProgress: number
  isSolving: boolean
  onShuffle: () => void
  onReset: () => void
  onAISolve: () => void
  onStopSolve: () => void
}

export function PuzzleControls({ completionPercentage, solvingProgress, isSolving, onShuffle, onReset, onAISolve, onStopSolve }: PuzzleControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <ProgressDisplay completionPercentage={completionPercentage} solvingProgress={solvingProgress} isSolving={isSolving} />
      <ActionButtons isSolving={isSolving} onShuffle={onShuffle} onReset={onReset} onAISolve={onAISolve} onStopSolve={onStopSolve} />
    </div>
  )
}
