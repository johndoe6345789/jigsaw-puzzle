import { useState, useCallback, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { PuzzlePiece } from './components/PuzzlePiece'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Toaster } from '@/components/ui/sonner'
import { ArrowsClockwise, ArrowCounterClockwise, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { PuzzlePiece as PuzzlePieceType } from '@/lib/types'
import { 
  initializePuzzle, 
  shouldSnap, 
  mergeGroups, 
  moveGroup, 
  checkCompletion,
  snapPieceToPosition,
  disconnectPiece,
  PIECE_SIZE
} from '@/lib/puzzle-utils'
import { toast } from 'sonner'

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
  
  const [pieces, setPieces] = useKV<PuzzlePieceType[]>('puzzle-pieces', [])
  const [isComplete, setIsComplete] = useKV<boolean>('puzzle-complete', false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null)
  const [isSolving, setIsSolving] = useState(false)
  const [solvingProgress, setSolvingProgress] = useState(0)
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map())
  const lastDragPosition = useRef<{ x: number; y: number } | null>(null)
  const solveAbortRef = useRef(false)

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

  const handleShuffle = useCallback(() => {
    setPieces((currentPieces) => {
      if (!currentPieces || currentPieces.length === 0) return []
      
      return currentPieces.map(piece => ({
        ...piece,
        currentPosition: {
          x: Math.random() * (containerWidth - PIECE_SIZE - 100) + 50,
          y: Math.random() * 400 + 100
        },
        isConnected: false,
        connectedGroup: [piece.id],
        zIndex: 1
      }))
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

  const handleDragEnd = useCallback((id: string) => {
    setPieces((currentPieces) => {
      if (!currentPieces) return []
      let updatedPieces = [...currentPieces]
      const draggedPiece = updatedPieces.find(p => p.id === id)
      
      if (!draggedPiece) return currentPieces

      for (const piece of updatedPieces) {
        if (piece.id === id || draggedPiece.connectedGroup.includes(piece.id)) continue
        if (piece.connectedGroup.includes(id)) continue

        if (shouldSnap(draggedPiece, piece)) {
          const deltaX = piece.currentPosition.x - draggedPiece.currentPosition.x + 
                        (draggedPiece.correctPosition.x - piece.correctPosition.x)
          const deltaY = piece.currentPosition.y - draggedPiece.currentPosition.y + 
                        (draggedPiece.correctPosition.y - piece.correctPosition.y)

          updatedPieces = moveGroup(updatedPieces, id, deltaX, deltaY)

          const snappedDraggedPiece = updatedPieces.find(p => p.id === id)
          if (snappedDraggedPiece) {
            updatedPieces = updatedPieces.map(p => {
              if (p.id === id) {
                return snapPieceToPosition(p, {
                  x: piece.currentPosition.x + (p.correctPosition.x - piece.correctPosition.x),
                  y: piece.currentPosition.y + (p.correctPosition.y - piece.correctPosition.y)
                })
              }
              if (snappedDraggedPiece.connectedGroup.includes(p.id)) {
                return snapPieceToPosition(p, {
                  x: piece.currentPosition.x + (p.correctPosition.x - piece.correctPosition.x),
                  y: piece.currentPosition.y + (p.correctPosition.y - piece.correctPosition.y)
                })
              }
              return p
            })
          }

          updatedPieces = mergeGroups(updatedPieces, id, piece.id)
          toast.success('Pieces connected!', { duration: 1000 })
          break
        }
      }

      if (checkCompletion(updatedPieces)) {
        setIsComplete(true)
        setShowCompletionDialog(true)
      }

      return updatedPieces
    })

    setDraggedPieceId(null)
    lastDragPosition.current = null
  }, [setPieces, setIsComplete])

  const handleAISolve = useCallback(async () => {
    if (!pieces || pieces.length === 0) return
    
    setIsSolving(true)
    setSolvingProgress(0)
    solveAbortRef.current = false
    
    try {
      const gridSizeVal = gridSize
      const piecesLength = pieces.length
      const maxSteps = Math.min(piecesLength, 20)
      
      const promptText = `You are an AI puzzle solver. Given a jigsaw puzzle with ${piecesLength} pieces in a ${gridSizeVal}x${gridSizeVal} grid, create a strategic solving plan.

Current puzzle state:
- Total pieces: ${piecesLength}
- Grid size: ${gridSizeVal}x${gridSizeVal}
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
            setShowCompletionDialog(true)
            return updatedPieces
          }
          
          return updatedPieces
        })
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

  const handleDoubleClick = useCallback((id: string) => {
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

  const completionPercentage = pieces && pieces.length > 0 
    ? Math.round((pieces.filter(p => p.isConnected).length / pieces.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">
            Jigsaw Puzzle
          </h1>
          <p className="text-muted-foreground">
            Drag pieces together to complete the puzzle
          </p>
        </div>

        <Card className="p-8 mb-6 bg-card shadow-lg">
          <div 
            ref={containerRef}
            className="relative w-full bg-muted/30 rounded-lg overflow-hidden"
            style={{ 
              height: '700px',
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 19px, oklch(0.85 0.02 80) 19px, oklch(0.85 0.02 80) 20px),
                repeating-linear-gradient(90deg, transparent, transparent 19px, oklch(0.85 0.02 80) 19px, oklch(0.85 0.02 80) 20px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {pieces?.map(piece => (
              <PuzzlePiece
                key={piece.id}
                piece={piece}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onDoubleClick={handleDoubleClick}
                gridSize={gridSize}
                imageUrl={DEFAULT_IMAGE}
                disabled={isSolving}
              />
            ))}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
          
          <div className="flex gap-3">
            {isSolving ? (
              <Button
                onClick={handleStopSolve}
                variant="destructive"
                className="gap-2"
              >
                <Sparkle size={18} weight="fill" />
                Stop AI
              </Button>
            ) : (
              <Button
                onClick={handleAISolve}
                variant="default"
                className="gap-2 bg-accent hover:bg-accent/90"
              >
                <Sparkle size={18} weight="fill" />
                AI Solve
              </Button>
            )}
            <Button
              onClick={handleShuffle}
              variant="outline"
              className="gap-2"
              disabled={isSolving}
            >
              <ArrowsClockwise size={18} />
              Shuffle
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="gap-2"
              disabled={isSolving}
            >
              <ArrowCounterClockwise size={18} />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} weight="fill" className="text-accent" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Puzzle Complete! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Congratulations! You've successfully completed the puzzle.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                setShowCompletionDialog(false)
                handleShuffle()
              }}
              className="flex-1"
            >
              Play Again
            </Button>
            <Button
              onClick={() => setShowCompletionDialog(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App