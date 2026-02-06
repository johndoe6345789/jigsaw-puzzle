import { PuzzlePiece, Position, EdgeType } from './types'

export const SNAP_THRESHOLD = 30
export const PIECE_SIZE = 100
export const SNAP_COOLDOWN_MS = 2000

export function getDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2))
}

export function areAdjacent(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  const rowDiff = piece1.row - piece2.row
  const colDiff = piece1.col - piece2.col
  
  return (Math.abs(rowDiff) === 1 && colDiff === 0) || (Math.abs(colDiff) === 1 && rowDiff === 0)
}

export function getAdjacentSide(piece1: PuzzlePiece, piece2: PuzzlePiece): { side1: keyof EdgeType, side2: keyof EdgeType } | null {
  const rowDiff = piece1.row - piece2.row
  const colDiff = piece1.col - piece2.col
  
  if (rowDiff === -1 && colDiff === 0) return { side1: 'bottom', side2: 'top' }
  if (rowDiff === 1 && colDiff === 0) return { side1: 'top', side2: 'bottom' }
  if (colDiff === -1 && rowDiff === 0) return { side1: 'right', side2: 'left' }
  if (colDiff === 1 && rowDiff === 0) return { side1: 'left', side2: 'right' }
  
  return null
}

export function edgesMatch(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  const sides = getAdjacentSide(piece1, piece2)
  if (!sides) return false
  
  const edge1 = piece1.edges[sides.side1]
  const edge2 = piece2.edges[sides.side2]
  
  if (edge1 === 'flat' || edge2 === 'flat') return false
  
  return (edge1 === 'tab' && edge2 === 'blank') || (edge1 === 'blank' && edge2 === 'tab')
}

export function shouldSnap(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  if (!areAdjacent(piece1, piece2)) return false
  
  const now = Date.now()
  if (piece1.lastDisconnectedTime && (now - piece1.lastDisconnectedTime) < SNAP_COOLDOWN_MS) {
    return false
  }
  
  const sides = getAdjacentSide(piece1, piece2)
  if (!sides) return false
  
  const edge1 = piece1.edges[sides.side1]
  const edge2 = piece2.edges[sides.side2]
  
  if (edge1 === 'flat' || edge2 === 'flat') return false
  
  if (!((edge1 === 'tab' && edge2 === 'blank') || (edge1 === 'blank' && edge2 === 'tab'))) {
    return false
  }
  
  const expectedOffset = {
    x: (piece2.col - piece1.col) * PIECE_SIZE,
    y: (piece2.row - piece1.row) * PIECE_SIZE
  }
  
  const actualOffset = {
    x: piece2.currentPosition.x - piece1.currentPosition.x,
    y: piece2.currentPosition.y - piece1.currentPosition.y
  }
  
  const offsetDiff = Math.sqrt(
    Math.pow(actualOffset.x - expectedOffset.x, 2) + 
    Math.pow(actualOffset.y - expectedOffset.y, 2)
  )
  
  return offsetDiff < SNAP_THRESHOLD
}

export function initializePuzzle(gridSize: number, containerWidth: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = []
  const pieceSize = PIECE_SIZE
  const puzzleWidth = gridSize * pieceSize
  const startX = (containerWidth - puzzleWidth) / 2
  const startY = 50
  
  const edgeMatrix: ('tab' | 'blank')[][] = []
  for (let i = 0; i < gridSize + 1; i++) {
    edgeMatrix[i] = []
    for (let j = 0; j < gridSize; j++) {
      edgeMatrix[i][j] = Math.random() > 0.5 ? 'tab' : 'blank'
    }
  }
  
  const verticalEdgeMatrix: ('tab' | 'blank')[][] = []
  for (let i = 0; i < gridSize; i++) {
    verticalEdgeMatrix[i] = []
    for (let j = 0; j < gridSize + 1; j++) {
      verticalEdgeMatrix[i][j] = Math.random() > 0.5 ? 'tab' : 'blank'
    }
  }
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const correctX = startX + col * pieceSize
      const correctY = startY + row * pieceSize
      
      const randomX = Math.random() * (containerWidth - pieceSize - 100) + 50
      const randomY = Math.random() * 400 + 100
      
      const topEdge = row === 0 ? 'flat' : (edgeMatrix[row][col] === 'tab' ? 'blank' : 'tab')
      const bottomEdge = row === gridSize - 1 ? 'flat' : edgeMatrix[row + 1][col]
      const leftEdge = col === 0 ? 'flat' : (verticalEdgeMatrix[row][col] === 'tab' ? 'blank' : 'tab')
      const rightEdge = col === gridSize - 1 ? 'flat' : verticalEdgeMatrix[row][col + 1]
      
      pieces.push({
        id: `${row}-${col}`,
        row,
        col,
        correctPosition: { x: correctX, y: correctY },
        currentPosition: { x: randomX, y: randomY },
        isConnected: false,
        connectedGroup: [`${row}-${col}`],
        zIndex: 1,
        edges: {
          top: topEdge,
          right: rightEdge,
          bottom: bottomEdge,
          left: leftEdge
        }
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

export function disconnectPiece(pieces: PuzzlePiece[], pieceId: string): PuzzlePiece[] {
  const piece = pieces.find(p => p.id === pieceId)
  if (!piece) return pieces
  
  const oldGroup = piece.connectedGroup
  
  if (oldGroup.length === 1) return pieces
  
  const newGroup = [pieceId]
  const remainingGroup = oldGroup.filter(id => id !== pieceId)
  const disconnectTime = Date.now()
  
  return pieces.map(p => {
    if (p.id === pieceId) {
      return {
        ...p,
        connectedGroup: newGroup,
        isConnected: false,
        lastDisconnectedTime: disconnectTime
      }
    }
    if (oldGroup.includes(p.id)) {
      return {
        ...p,
        connectedGroup: remainingGroup,
        isConnected: remainingGroup.length > 1
      }
    }
    return p
  })
}
