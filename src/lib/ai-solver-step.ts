import { PuzzlePiece } from '@/lib/types'
import { mergeGroups, checkCompletion } from '@/lib/puzzle-utils'
import { toast } from 'sonner'

export async function processSolveStep(
  step: { pieceId: string; reasoning: string },
  setPieces: (updater: (pieces: PuzzlePiece[]) => PuzzlePiece[]) => void,
  setIsComplete: (value: boolean) => void
) {
  setPieces((currentPieces) => {
    if (!currentPieces) return []
    
    const targetPiece = currentPieces.find(p => p.id === step.pieceId)
    if (!targetPiece) return currentPieces
    
    let updatedPieces = [...currentPieces]
    
    for (const otherPiece of updatedPieces) {
      if (otherPiece.id === targetPiece.id) continue
      if (targetPiece.connectedGroup.includes(otherPiece.id)) continue
      if (otherPiece.connectedGroup.includes(targetPiece.id)) continue
      
      const rowDiff = Math.abs(targetPiece.row - otherPiece.row)
      const colDiff = Math.abs(targetPiece.col - otherPiece.col)
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        const targetX = otherPiece.currentPosition.x + (targetPiece.correctPosition.x - otherPiece.correctPosition.x)
        const targetY = otherPiece.currentPosition.y + (targetPiece.correctPosition.y - otherPiece.correctPosition.y)
        
        updatedPieces = updatedPieces.map(p => {
          if (targetPiece.connectedGroup.includes(p.id)) {
            const offsetX = p.correctPosition.x - targetPiece.correctPosition.x
            const offsetY = p.correctPosition.y - targetPiece.correctPosition.y
            return {
              ...p,
              currentPosition: {
                x: targetX + offsetX,
                y: targetY + offsetY
              }
            }
          }
          return p
        })
        
        updatedPieces = mergeGroups(updatedPieces, targetPiece.id, otherPiece.id)
        toast.success(`Connected ${step.pieceId}!`, { duration: 1000 })
        break
      }
    }
    
    if (checkCompletion(updatedPieces)) {
      setIsComplete(true)
      return updatedPieces
    }
    
    return updatedPieces
  })
}
