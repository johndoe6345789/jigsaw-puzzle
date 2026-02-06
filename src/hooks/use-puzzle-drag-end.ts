import { useCallback } from 'react'
import { PuzzlePiece } from '@/lib/types'
import { shouldSnap, mergeGroups, snapPieceToPosition, repelOverlappingPieces, checkCompletion } from '@/lib/puzzle-utils'
import { toast } from 'sonner'

export function usePuzzleDragEnd(
  setPieces: (updater: (pieces: PuzzlePiece[]) => PuzzlePiece[]) => void,
  setIsComplete: (value: boolean) => void,
  containerWidth: number,
  setDraggedPieceId: (id: string | null) => void,
  lastDragPosition: React.MutableRefObject<{ x: number; y: number } | null>
) {
  return useCallback((id: string) => {
    setPieces((currentPieces) => {
      if (!currentPieces) return []
      let updatedPieces = [...currentPieces]
      const draggedPiece = updatedPieces.find(p => p.id === id)
      
      if (!draggedPiece) return currentPieces

      let snappedToSomething = false

      for (const piece of updatedPieces) {
        if (piece.id === id || draggedPiece.connectedGroup.includes(piece.id)) continue
        if (piece.connectedGroup.includes(id)) continue

        if (shouldSnap(draggedPiece, piece)) {
          const deltaX = piece.currentPosition.x - draggedPiece.currentPosition.x + 
                        (draggedPiece.correctPosition.x - piece.correctPosition.x)
          const deltaY = piece.currentPosition.y - draggedPiece.currentPosition.y + 
                        (draggedPiece.correctPosition.y - piece.correctPosition.y)

          updatedPieces = updatedPieces.map(p => {
            if (draggedPiece.connectedGroup.includes(p.id)) {
              return {
                ...p,
                currentPosition: {
                  x: p.currentPosition.x + deltaX,
                  y: p.currentPosition.y + deltaY
                }
              }
            }
            return p
          })

          const snappedDraggedPiece = updatedPieces.find(p => p.id === id)
          if (snappedDraggedPiece) {
            updatedPieces = updatedPieces.map(p => {
              if (p.id === id || snappedDraggedPiece.connectedGroup.includes(p.id)) {
                return snapPieceToPosition(p, {
                  x: piece.currentPosition.x + (p.correctPosition.x - piece.correctPosition.x),
                  y: piece.currentPosition.y + (p.correctPosition.y - piece.correctPosition.y)
                })
              }
              return p
            })
          }

          updatedPieces = mergeGroups(updatedPieces, id, piece.id)
          snappedToSomething = true
          toast.success('Pieces connected!', { duration: 1000 })
          break
        }
      }

      if (!snappedToSomething) {
        const movedGroupIds = draggedPiece.connectedGroup
        updatedPieces = repelOverlappingPieces(updatedPieces, movedGroupIds, containerWidth)
      }

      if (checkCompletion(updatedPieces)) {
        setIsComplete(true)
      }

      return updatedPieces
    })

    setDraggedPieceId(null)
    lastDragPosition.current = null
  }, [setPieces, setIsComplete, containerWidth, setDraggedPieceId, lastDragPosition])
}
