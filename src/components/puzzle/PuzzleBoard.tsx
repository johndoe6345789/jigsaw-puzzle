import { forwardRef } from 'react'
import { Card } from '@/components/ui/card'
import { PuzzlePiece } from '@/components/PuzzlePiece'
import { PuzzlePiece as PuzzlePieceType } from '@/lib/types'

interface PuzzleBoardProps {
  pieces: PuzzlePieceType[]
  gridSize: number
  imageUrl: string
  isSolving: boolean
  onDragStart: (id: string) => void
  onDrag: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onDoubleClick: (id: string) => void
}

export const PuzzleBoard = forwardRef<HTMLDivElement, PuzzleBoardProps>(
  ({ pieces, gridSize, imageUrl, isSolving, onDragStart, onDrag, onDragEnd, onDoubleClick }, ref) => (
    <Card className="p-8 mb-6 bg-card shadow-lg">
      <div 
        ref={ref}
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
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            onDoubleClick={onDoubleClick}
            gridSize={gridSize}
            imageUrl={imageUrl}
            disabled={isSolving}
          />
        ))}
      </div>
    </Card>
  )
)
