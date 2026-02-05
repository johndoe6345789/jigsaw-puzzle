import { PuzzlePiece, Position } from './types'

export const SNAP_THRESHOLD = 30
export const PIECE_SIZE = 100

export function getDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2))
}

export function areAdjacent(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  const rowDiff = Math.abs(piece1.row - piece2.row)
  const colDiff = Math.abs(piece1.col - piece2.col)
  
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

export function shouldSnap(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  if (!areAdjacent(piece1, piece2)) return false
  
  const distance = getDistance(piece1.currentPosition, piece2.currentPosition)
  const correctDistance = getDistance(piece1.correctPosition, piece2.correctPosition)
  
  return distance < SNAP_THRESHOLD && Math.abs(distance - correctDistance) < SNAP_THRESHOLD
}

export function initializePuzzle(gridSize: number, containerWidth: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = []
  const pieceSize = PIECE_SIZE
  const puzzleWidth = gridSize * pieceSize
  const startX = (containerWidth - puzzleWidth) / 2
  const startY = 50
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const correctX = startX + col * pieceSize
      const correctY = startY + row * pieceSize
      
      const randomX = Math.random() * (containerWidth - pieceSize - 100) + 50
      const randomY = Math.random() * 400 + 100
      
      pieces.push({
        id: `${row}-${col}`,
        row,
        col,
        correctPosition: { x: correctX, y: correctY },
        currentPosition: { x: randomX, y: randomY },
        isConnected: false,
        connectedGroup: [`${row}-${col}`],
        zIndex: 1
      })
    }
  }
  
  return pieces
}

export function mergeGroups(pieces: PuzzlePiece[], piece1Id: string, piece2Id: string): PuzzlePiece[] {
  const piece1 = pieces.find(p => p.id === piece1Id)
  const piece2 = pieces.find(p => p.id === piece2Id)
  
  if (!piece1 || !piece2) return pieces
  
  const newGroup = [...new Set([...piece1.connectedGroup, ...piece2.connectedGroup])]
  
  return pieces.map(p => {
    if (piece1.connectedGroup.includes(p.id) || piece2.connectedGroup.includes(p.id)) {
      return { ...p, connectedGroup: newGroup, isConnected: true }
    }
    return p
  })
}

export function moveGroup(pieces: PuzzlePiece[], draggedPieceId: string, deltaX: number, deltaY: number): PuzzlePiece[] {
  const draggedPiece = pieces.find(p => p.id === draggedPieceId)
  if (!draggedPiece) return pieces
  
  const groupIds = draggedPiece.connectedGroup
  
  return pieces.map(p => {
    if (groupIds.includes(p.id)) {
      return {
        ...p,
        currentPosition: {
          x: p.currentPosition.x + deltaX,
          y: p.currentPosition.y + deltaY
        }
      }
    }
    return p
  })
}

export function checkCompletion(pieces: PuzzlePiece[]): boolean {
  return pieces.every(piece => {
    const distance = getDistance(piece.currentPosition, piece.correctPosition)
    return distance < 5
  })
}

export function snapPieceToPosition(piece: PuzzlePiece, targetPosition: Position): PuzzlePiece {
  return {
    ...piece,
    currentPosition: { ...targetPosition }
  }
}
