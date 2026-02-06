export interface Position {
  x: number
  y: number
}

export interface EdgeType {
  top: 'tab' | 'blank' | 'flat'
  right: 'tab' | 'blank' | 'flat'
  bottom: 'tab' | 'blank' | 'flat'
  left: 'tab' | 'blank' | 'flat'
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
  edges: EdgeType
  lastDisconnectedTime?: number
}

export interface PuzzleState {
  pieces: PuzzlePiece[]
  gridSize: number
  pieceSize: number
  isComplete: boolean
}
