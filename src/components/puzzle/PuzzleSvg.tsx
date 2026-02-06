import { PuzzlePiece } from '@/lib/types'
import { PIECE_SIZE } from '@/lib/puzzle-utils'

interface PuzzleSvgProps {
  piece: PuzzlePiece
  pathD: string
  gridSize: number
  imageUrl: string
  svgSize: number
  viewBoxOffset: number
  isInCooldown: boolean
}

export function PuzzleSvg({ piece, pathD, gridSize, imageUrl, svgSize, viewBoxOffset, isInCooldown }: PuzzleSvgProps) {
  const backgroundPositionX = -piece.col * PIECE_SIZE
  const backgroundPositionY = -piece.row * PIECE_SIZE

  return (
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
          <image href={imageUrl} width={gridSize * PIECE_SIZE} height={gridSize * PIECE_SIZE} />
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
  )
}
