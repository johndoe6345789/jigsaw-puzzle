import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { PuzzlePiece as PuzzlePieceType } from '@/lib/types'
import { PIECE_SIZE, SNAP_COOLDOWN_MS } from '@/lib/puzzle-utils'

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

function generateJigsawPath(piece: PuzzlePieceType): string {
  const size = PIECE_SIZE
  const tabDepth = size * 0.15
  const tabWidth = size * 0.35
  const neckWidth = size * 0.25
  
  let path = ''
  
  path += `M 0,0 `
  
  if (piece.edges.top === 'tab') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L ${neckStart},0 `
    path += `Q ${neckStart},-${tabDepth * 0.3} ${start},-${tabDepth * 0.5} `
    path += `Q ${mid - tabWidth * 0.2},-${tabDepth} ${mid},-${tabDepth} `
    path += `Q ${mid + tabWidth * 0.2},-${tabDepth} ${end},-${tabDepth * 0.5} `
    path += `Q ${neckEnd},-${tabDepth * 0.3} ${neckEnd},0 `
  } else if (piece.edges.top === 'blank') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L ${neckStart},0 `
    path += `Q ${neckStart},${tabDepth * 0.3} ${start},${tabDepth * 0.5} `
    path += `Q ${mid - tabWidth * 0.2},${tabDepth} ${mid},${tabDepth} `
    path += `Q ${mid + tabWidth * 0.2},${tabDepth} ${end},${tabDepth * 0.5} `
    path += `Q ${neckEnd},${tabDepth * 0.3} ${neckEnd},0 `
  }
  
  path += `L ${size},0 `
  
  if (piece.edges.right === 'tab') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L ${size},${neckStart} `
    path += `Q ${size + tabDepth * 0.3},${neckStart} ${size + tabDepth * 0.5},${start} `
    path += `Q ${size + tabDepth},${mid - tabWidth * 0.2} ${size + tabDepth},${mid} `
    path += `Q ${size + tabDepth},${mid + tabWidth * 0.2} ${size + tabDepth * 0.5},${end} `
    path += `Q ${size + tabDepth * 0.3},${neckEnd} ${size},${neckEnd} `
  } else if (piece.edges.right === 'blank') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L ${size},${neckStart} `
    path += `Q ${size - tabDepth * 0.3},${neckStart} ${size - tabDepth * 0.5},${start} `
    path += `Q ${size - tabDepth},${mid - tabWidth * 0.2} ${size - tabDepth},${mid} `
    path += `Q ${size - tabDepth},${mid + tabWidth * 0.2} ${size - tabDepth * 0.5},${end} `
    path += `Q ${size - tabDepth * 0.3},${neckEnd} ${size},${neckEnd} `
  }
  
  path += `L ${size},${size} `
  
  if (piece.edges.bottom === 'tab') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L ${neckEnd},${size} `
    path += `Q ${neckEnd},${size + tabDepth * 0.3} ${end},${size + tabDepth * 0.5} `
    path += `Q ${mid + tabWidth * 0.2},${size + tabDepth} ${mid},${size + tabDepth} `
    path += `Q ${mid - tabWidth * 0.2},${size + tabDepth} ${start},${size + tabDepth * 0.5} `
    path += `Q ${neckStart},${size + tabDepth * 0.3} ${neckStart},${size} `
  } else if (piece.edges.bottom === 'blank') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L ${neckEnd},${size} `
    path += `Q ${neckEnd},${size - tabDepth * 0.3} ${end},${size - tabDepth * 0.5} `
    path += `Q ${mid + tabWidth * 0.2},${size - tabDepth} ${mid},${size - tabDepth} `
    path += `Q ${mid - tabWidth * 0.2},${size - tabDepth} ${start},${size - tabDepth * 0.5} `
    path += `Q ${neckStart},${size - tabDepth * 0.3} ${neckStart},${size} `
  }
  
  path += `L 0,${size} `
  
  if (piece.edges.left === 'tab') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L 0,${neckEnd} `
    path += `Q -${tabDepth * 0.3},${neckEnd} -${tabDepth * 0.5},${end} `
    path += `Q -${tabDepth},${mid + tabWidth * 0.2} -${tabDepth},${mid} `
    path += `Q -${tabDepth},${mid - tabWidth * 0.2} -${tabDepth * 0.5},${start} `
    path += `Q -${tabDepth * 0.3},${neckStart} 0,${neckStart} `
  } else if (piece.edges.left === 'blank') {
    const start = (size - tabWidth) / 2
    const mid = size / 2
    const end = start + tabWidth
    const neckStart = (size - neckWidth) / 2
    const neckEnd = neckStart + neckWidth
    
    path += `L 0,${neckEnd} `
    path += `Q ${tabDepth * 0.3},${neckEnd} ${tabDepth * 0.5},${end} `
    path += `Q ${tabDepth},${mid + tabWidth * 0.2} ${tabDepth},${mid} `
    path += `Q ${tabDepth},${mid - tabWidth * 0.2} ${tabDepth * 0.5},${start} `
    path += `Q ${tabDepth * 0.3},${neckStart} 0,${neckStart} `
  }
  
  path += `Z`
  
  return path
}

export function PuzzlePiece({ piece, onDragStart, onDrag, onDragEnd, onDoubleClick, gridSize, imageUrl, disabled = false }: PuzzlePieceProps) {
  const tabDepth = PIECE_SIZE * 0.15
  const pathD = generateJigsawPath(piece)
  
  const [isInCooldown, setIsInCooldown] = useState(false)
  
  useEffect(() => {
    if (piece.lastDisconnectedTime) {
      const now = Date.now()
      const timeSinceDisconnect = now - piece.lastDisconnectedTime
      
      if (timeSinceDisconnect < SNAP_COOLDOWN_MS) {
        setIsInCooldown(true)
        const remainingTime = SNAP_COOLDOWN_MS - timeSinceDisconnect
        
        const timer = setTimeout(() => {
          setIsInCooldown(false)
        }, remainingTime)
        
        return () => clearTimeout(timer)
      } else {
        setIsInCooldown(false)
      }
    } else {
      setIsInCooldown(false)
    }
  }, [piece.lastDisconnectedTime])
  
  const backgroundPositionX = -piece.col * PIECE_SIZE
  const backgroundPositionY = -piece.row * PIECE_SIZE
  
  const svgSize = PIECE_SIZE + tabDepth * 2
  const viewBoxOffset = tabDepth

  return (
    <motion.div
      drag={!disabled}
      dragMomentum={false}
      onDragStart={() => onDragStart(piece.id)}
      onDrag={(_, info) => {
        onDrag(piece.id, info.point.x, info.point.y)
      }}
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
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`-${viewBoxOffset} -${viewBoxOffset} ${svgSize} ${svgSize}`}
        style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.15))' }}
      >
        <defs>
          <pattern
            id={`image-${piece.id}`}
            x={backgroundPositionX - viewBoxOffset}
            y={backgroundPositionY - viewBoxOffset}
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
          stroke={isInCooldown ? "oklch(0.55 0.15 45)" : "rgba(0,0,0,0.2)"}
          strokeWidth={isInCooldown ? "2.5" : "1"}
          clipPath={`url(#clip-${piece.id})`}
        />
      </svg>
    </motion.div>
  )
}
