import { motion } from 'framer-motion'
import { PuzzlePiece as PuzzlePieceType } from '@/lib/types'
import { PIECE_SIZE } from '@/lib/puzzle-utils'
import { useSnapCooldown } from '@/hooks/use-snap-cooldown'
import { generateJigsawPath } from './puzzle/JigsawPath'
import { PuzzleSvg } from './puzzle/PuzzleSvg'

interface PuzzlePieceProps {
  piece: PuzzlePieceType
  onDragStart: (id: string) => void
  onDrag: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  onDoubleClick?: (id: string) => void
  gridSize: number
  imageUrl: string
  disabled?: boolean
}

export function PuzzlePiece({ piece, onDragStart, onDrag, onDragEnd, onDoubleClick, gridSize, imageUrl, disabled = false }: PuzzlePieceProps) {
  const tabDepth = PIECE_SIZE * 0.15
  const pathD = generateJigsawPath(piece)
  const isInCooldown = useSnapCooldown(piece.lastDisconnectedTime)
  const svgSize = PIECE_SIZE + tabDepth * 2
  const viewBoxOffset = tabDepth

  return (
    <motion.div
      drag={!disabled}
      dragMomentum={false}
      onDragStart={() => onDragStart(piece.id)}
      onDrag={(_, info) => onDrag(piece.id, info.point.x, info.point.y)}
      onDragEnd={() => onDragEnd(piece.id)}
      onDoubleClick={() => onDoubleClick?.(piece.id)}
      style={{
        x: piece.currentPosition.x,
        y: piece.currentPosition.y,
        zIndex: piece.zIndex,
        position: 'absolute',
        width: svgSize,
        height: svgSize,
        cursor: disabled ? 'default' : 'grab'
      }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 1.05, cursor: 'grabbing' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <PuzzleSvg piece={piece} pathD={pathD} gridSize={gridSize} imageUrl={imageUrl} svgSize={svgSize} viewBoxOffset={viewBoxOffset} isInCooldown={isInCooldown} />
    </motion.div>
  )
}
