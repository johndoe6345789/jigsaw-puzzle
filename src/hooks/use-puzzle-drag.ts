import { useCallback, useRef, useState } from 'react'
import { PuzzlePiece } from '@/lib/types'
import { shouldSnap, mergeGroups, moveGroup, checkCompletion, snapPieceToPosition, repelOverlappingPieces } from '@/lib/puzzle-utils'
import { toast } from 'sonner'

export function usePuzzleDrag(
  setPieces: (updater: (pieces: PuzzlePiece[]) => PuzzlePiece[]) => void,
  setIsComplete: (value: boolean) => void,
  containerWidth: number
) {
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null)
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map())
  const lastDragPosition = useRef<{ x: number; y: number } | null>(null)

  const handleDragStart = useCallback((id: string) => {
    setDraggedPieceId(id)
    
    setPieces((currentPieces) => {
      if (!currentPieces) return []
      const piece = currentPieces.find(p => p.id === id)
      if (!piece) return currentPieces
      
      dragStartPositions.current.clear()
      piece.connectedGroup.forEach(groupId => {
        const groupPiece = currentPieces.find(p => p.id === groupId)
        if (groupPiece) {
          dragStartPositions.current.set(groupId, { ...groupPiece.currentPosition })
        }
      })
      
      const maxZ = Math.max(...currentPieces.map(p => p.zIndex), 0)
      return currentPieces.map(p => 
        piece.connectedGroup.includes(p.id) ? { ...p, zIndex: maxZ + 1 } : p
      )
    })
    
    lastDragPosition.current = null
  }, [setPieces])

  const handleDrag = useCallback((id: string, x: number, y: number) => {
    const currentPos = lastDragPosition.current
    if (!currentPos) {
      lastDragPosition.current = { x, y }
      return
    }

    const deltaX = x - currentPos.x
    const deltaY = y - currentPos.y
    lastDragPosition.current = { x, y }

    setPieces((currentPieces) => {
      if (!currentPieces) return []
      return moveGroup(currentPieces, id, deltaX, deltaY)
    })
  }, [setPieces])

  return { draggedPieceId, handleDragStart, handleDrag, lastDragPosition }
}
