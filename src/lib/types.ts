export interface Position {
  x: number
  y: number
}

export interface PuzzlePiece {
  id: string
  row: number
  col: number
  currentPosition: Position
  correctPosition: Position
  isConnected: boolean
  connectedGroup: string[]
  zIndex: number
}

export interface PuzzleState {
  pieces: PuzzlePiece[]
  gridSize: number
  pieceSize: number
  isComplete: boolean
}
