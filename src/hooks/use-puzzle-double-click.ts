import { useCallback } from 'react'
import { PuzzlePiece } from '@/lib/types'
import { disconnectPiece } from '@/lib/puzzle-utils'
import { toast } from 'sonner'

export function usePuzzleDoubleClick(
  setPieces: (updater: (pieces: PuzzlePiece[]) => PuzzlePiece[]) => void
) {
  return useCallback((id: string) => {
    setPieces((currentPieces) => {
      if (!currentPieces) return []
      const piece = currentPieces.find(p => p.id === id)
      
      if (!piece || piece.connectedGroup.length === 1) {
        toast.info('This piece is not connected to any other pieces')
        return currentPieces
      }
      
      toast.success('Piece disconnected! Wait 2 seconds before reconnecting.', { duration: 2000 })
      return disconnectPiece(currentPieces, id)
    })
  }, [setPieces])
}
