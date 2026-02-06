import { Progress } from '@/components/ui/progress'

interface ProgressDisplayProps {
  completionPercentage: number
  solvingProgress: number
  isSolving: boolean
}

export function ProgressDisplay({ completionPercentage, solvingProgress, isSolving }: ProgressDisplayProps) {
  return (
    <div className="w-full sm:w-64">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-foreground">Progress</span>
        <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      {isSolving && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">AI Solving</span>
          <span className="text-xs text-accent font-medium">{Math.round(solvingProgress)}%</span>
        </div>
      )}
    </div>
  )
}
