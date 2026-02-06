import { useCallback, useRef, useState } from 'react'
import { PuzzlePiece } from '@/lib/types'
import { toast } from 'sonner'
import { processSolveStep } from '@/lib/ai-solver-step'

export function useAISolver(
  pieces: PuzzlePiece[],
  gridSize: number,
  setPieces: (updater: (pieces: PuzzlePiece[]) => PuzzlePiece[]) => void,
  setIsComplete: (value: boolean) => void
) {
  const [isSolving, setIsSolving] = useState(false)
  const [solvingProgress, setSolvingProgress] = useState(0)
  const solveAbortRef = useRef(false)

  const handleAISolve = useCallback(async () => {
    if (!pieces || pieces.length === 0) return
    
    setIsSolving(true)
    setSolvingProgress(0)
    solveAbortRef.current = false
    
    try {
      const maxSteps = Math.min(pieces.length, 20)
      
      const promptText = `You are an AI puzzle solver. Given a jigsaw puzzle with ${pieces.length} pieces in a ${gridSize}x${gridSize} grid, create a strategic solving plan.

Current puzzle state:
- Total pieces: ${pieces.length}
- Grid size: ${gridSize}x${gridSize}
- Some pieces may already be connected in groups

Generate a step-by-step solving strategy. Return a JSON object with a single property "steps" containing an array of move instructions. Each step should connect unconnected pieces or groups together, prioritizing:
1. Corner pieces first
2. Edge pieces next
3. Then interior pieces
4. Try to build from already connected groups

Format:
{
  "steps": [
    {"pieceId": "row-col", "reasoning": "brief reason for this move"},
    ...more steps
  ]
}

Generate exactly ${maxSteps} strategic steps.`

      const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const strategy = JSON.parse(result)
      
      if (!strategy.steps || !Array.isArray(strategy.steps)) {
        throw new Error('Invalid strategy format')
      }

      toast.success('AI analyzing puzzle...', { duration: 2000 })
      
      for (let i = 0; i < strategy.steps.length; i++) {
        if (solveAbortRef.current) {
          toast.info('AI solve stopped')
          break
        }

        const step = strategy.steps[i]
        setSolvingProgress(((i + 1) / strategy.steps.length) * 100)
        
        await new Promise(resolve => setTimeout(resolve, 800))
        await processSolveStep(step, setPieces, setIsComplete)
      }
      
      if (!solveAbortRef.current) {
        toast.success('AI solving complete!', { duration: 2000 })
      }
    } catch (error) {
      console.error('AI solve error:', error)
      toast.error('AI solver encountered an error')
    } finally {
      setIsSolving(false)
      setSolvingProgress(0)
    }
  }, [pieces, gridSize, setPieces, setIsComplete])

  const handleStopSolve = useCallback(() => {
    solveAbortRef.current = true
    setIsSolving(false)
    setSolvingProgress(0)
  }, [])

  return { isSolving, solvingProgress, handleAISolve, handleStopSolve }
}
