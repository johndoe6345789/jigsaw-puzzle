import { useCallback, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { PuzzlePiece } from '@/lib/types'
import { initializePuzzle, shufflePuzzle } from '@/lib/puzzle-utils'
import { toast } from 'sonner'

export function usePuzzleActions(gridSize: number, containerWidth: number) {
  const [pieces, setPieces] = useKV<PuzzlePiece[]>('puzzle-pieces', [])
  const [isComplete, setIsComplete] = useKV<boolean>('puzzle-complete', false)

  const handleShuffle = useCallback(() => {
    setPieces((currentPieces) => {
      if (!currentPieces || currentPieces.length === 0) return []
      return shufflePuzzle(currentPieces, containerWidth)
    })
    setIsComplete(false)
    toast.success('Puzzle shuffled!')
  }, [containerWidth, setPieces, setIsComplete])

  const handleReset = useCallback(() => {
    const initialPieces = initializePuzzle(gridSize, containerWidth)
    setPieces(initialPieces)
    setIsComplete(false)
    toast.success('Puzzle reset!')
  }, [gridSize, containerWidth, setPieces, setIsComplete])

  return {
    pieces,
    setPieces,
    isComplete,
    setIsComplete,
    handleShuffle,
    handleReset
  }
}
