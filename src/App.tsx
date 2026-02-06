import { useState, useEffect, useRef } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { initializePuzzle } from '@/lib/puzzle-utils'
import { usePuzzleActions } from '@/hooks/use-puzzle-actions'
import { usePuzzleDrag } from '@/hooks/use-puzzle-drag'
import { usePuzzleDragEnd } from '@/hooks/use-puzzle-drag-end'
import { usePuzzleDoubleClick } from '@/hooks/use-puzzle-double-click'
import { useAISolver } from '@/hooks/use-ai-solver'
import { PuzzleHeader } from '@/components/puzzle/PuzzleHeader'
import { PuzzleBoard } from '@/components/puzzle/PuzzleBoard'
import { PuzzleControls } from '@/components/puzzle/PuzzleControls'
import { CompletionDialog } from '@/components/puzzle/CompletionDialog'

const DEFAULT_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:oklch(0.75 0.15 180);stop-opacity:1" />
        <stop offset="50%" style="stop-color:oklch(0.65 0.18 220);stop-opacity:1" />
        <stop offset="100%" style="stop-color:oklch(0.55 0.20 280);stop-opacity:1" />
      </linearGradient>
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#grad1)"/>
    <rect width="400" height="400" fill="url(#dots)"/>
    <circle cx="200" cy="140" r="60" fill="oklch(0.85 0.1 60)" opacity="0.8"/>
    <polygon points="200,220 150,300 250,300" fill="oklch(0.70 0.15 30)" opacity="0.8"/>
    <rect x="100" y="320" width="200" height="15" rx="7" fill="oklch(0.60 0.12 150)" opacity="0.8"/>
  </svg>
`)

function App() {
  const [gridSize] = useState(4)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  const { pieces, setPieces, isComplete, setIsComplete, handleShuffle, handleReset } = usePuzzleActions(gridSize, containerWidth)
  
  const { draggedPieceId, handleDragStart, handleDrag, lastDragPosition } = usePuzzleDrag(setPieces, setIsComplete, containerWidth)
  
  const handleDragEnd = usePuzzleDragEnd(setPieces, setIsComplete, containerWidth, (id) => {}, lastDragPosition)
  
  const handleDoubleClick = usePuzzleDoubleClick(setPieces)
  
  const { isSolving, solvingProgress, handleAISolve, handleStopSolve } = useAISolver(pieces || [], gridSize, setPieces, setIsComplete)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if ((!pieces || pieces.length === 0) && containerWidth > 0) {
      const initialPieces = initializePuzzle(gridSize, containerWidth)
      setPieces(initialPieces)
    }
  }, [containerWidth, gridSize, pieces, setPieces])

  useEffect(() => {
    if (isComplete) {
      setShowCompletionDialog(true)
    }
  }, [isComplete])

  const completionPercentage = pieces && pieces.length > 0 
    ? Math.round((pieces.filter(p => p.isConnected).length / pieces.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <PuzzleHeader title="Jigsaw Puzzle" description="Drag pieces together to complete the puzzle" />
        <PuzzleBoard
          ref={containerRef}
          pieces={pieces || []}
          gridSize={gridSize}
          imageUrl={DEFAULT_IMAGE}
          isSolving={isSolving}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleDoubleClick}
        />
        <PuzzleControls
          completionPercentage={completionPercentage}
          solvingProgress={solvingProgress}
          isSolving={isSolving}
          onShuffle={handleShuffle}
          onReset={handleReset}
          onAISolve={handleAISolve}
          onStopSolve={handleStopSolve}
        />
      </div>
      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onPlayAgain={() => {
          setShowCompletionDialog(false)
          handleShuffle()
        }}
      />
    </div>
  )
}

export default App