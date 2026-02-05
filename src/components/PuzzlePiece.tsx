import { motion } from 'framer-motion'
import { PuzzlePiece as PuzzlePieceType } from '@/lib/types'
import { PIECE_SIZE } from '@/lib/puzzle-utils'

interface PuzzlePieceProps {
  piece: PuzzlePieceType
  onDragStart: (id: string) => void
  onDrag: (id: string, x: number, y: number) => void
  onDragEnd: (id: string) => void
  gridSize: number
  imageUrl: string
}

export function PuzzlePiece({ piece, onDragStart, onDrag, onDragEnd, gridSize, imageUrl }: PuzzlePieceProps) {
  const hasTopTab = piece.row > 0 && piece.col % 2 === piece.row % 2
  const hasBottomTab = piece.row < gridSize - 1 && piece.col % 2 !== piece.row % 2
  const hasLeftTab = piece.col > 0 && (piece.col + piece.row) % 2 === 0
  const hasRightTab = piece.col < gridSize - 1 && (piece.col + piece.row) % 2 === 1

  const tabSize = PIECE_SIZE * 0.2

  let pathD = `M 0,0 `

  if (hasTopTab) {
    pathD += `L ${PIECE_SIZE * 0.3},0 
              Q ${PIECE_SIZE * 0.4},-${tabSize} ${PIECE_SIZE * 0.5},-${tabSize} 
              Q ${PIECE_SIZE * 0.6},-${tabSize} ${PIECE_SIZE * 0.7},0 `
  }
  pathD += `L ${PIECE_SIZE},0 `

  if (hasRightTab) {
    pathD += `L ${PIECE_SIZE},${PIECE_SIZE * 0.3} 
              Q ${PIECE_SIZE + tabSize},${PIECE_SIZE * 0.4} ${PIECE_SIZE + tabSize},${PIECE_SIZE * 0.5} 
              Q ${PIECE_SIZE + tabSize},${PIECE_SIZE * 0.6} ${PIECE_SIZE},${PIECE_SIZE * 0.7} `
  }
  pathD += `L ${PIECE_SIZE},${PIECE_SIZE} `

  if (hasBottomTab) {
    pathD += `L ${PIECE_SIZE * 0.7},${PIECE_SIZE} 
              Q ${PIECE_SIZE * 0.6},${PIECE_SIZE + tabSize} ${PIECE_SIZE * 0.5},${PIECE_SIZE + tabSize} 
              Q ${PIECE_SIZE * 0.4},${PIECE_SIZE + tabSize} ${PIECE_SIZE * 0.3},${PIECE_SIZE} `
  }
  pathD += `L 0,${PIECE_SIZE} `

  if (hasLeftTab) {
    pathD += `L 0,${PIECE_SIZE * 0.7} 
              Q -${tabSize},${PIECE_SIZE * 0.6} -${tabSize},${PIECE_SIZE * 0.5} 
              Q -${tabSize},${PIECE_SIZE * 0.4} 0,${PIECE_SIZE * 0.3} `
  }
  pathD += `Z`

  const backgroundPositionX = -piece.col * PIECE_SIZE
  const backgroundPositionY = -piece.row * PIECE_SIZE

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => onDragStart(piece.id)}
      onDrag={(_, info) => {
        onDrag(piece.id, info.point.x, info.point.y)
      }}
      onDragEnd={() => onDragEnd(piece.id)}
      style={{
        x: piece.currentPosition.x,
        y: piece.currentPosition.y,
        zIndex: piece.zIndex,
        position: 'absolute',
        width: PIECE_SIZE + tabSize * 2,
        height: PIECE_SIZE + tabSize * 2,
        cursor: 'grab'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 1.05, cursor: 'grabbing' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <svg
        width={PIECE_SIZE + tabSize * 2}
        height={PIECE_SIZE + tabSize * 2}
        viewBox={`-${tabSize} -${tabSize} ${PIECE_SIZE + tabSize * 2} ${PIECE_SIZE + tabSize * 2}`}
        style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.15))' }}
      >
        <defs>
          <pattern
            id={`image-${piece.id}`}
            x={backgroundPositionX - tabSize}
            y={backgroundPositionY - tabSize}
            width={gridSize * PIECE_SIZE}
            height={gridSize * PIECE_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <image
              href={imageUrl}
              width={gridSize * PIECE_SIZE}
              height={gridSize * PIECE_SIZE}
            />
          </pattern>
          <clipPath id={`clip-${piece.id}`}>
            <path d={pathD} />
          </clipPath>
        </defs>
        <path
          d={pathD}
          fill={`url(#image-${piece.id})`}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
          clipPath={`url(#clip-${piece.id})`}
        />
      </svg>
    </motion.div>
  )
}
