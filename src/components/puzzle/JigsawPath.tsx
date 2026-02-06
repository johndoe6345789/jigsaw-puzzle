import { PuzzlePiece } from '@/lib/types'
import { PIECE_SIZE } from '@/lib/puzzle-utils'

export function generateJigsawPath(piece: PuzzlePiece): string {
  const s = PIECE_SIZE
  const d = s * 0.15
  const w = s * 0.35
  const n = s * 0.25

  return `M 0,0 ${edge(piece.edges.top, s, d, w, n, 'h', false)} L ${s},0 ${edge(piece.edges.right, s, d, w, n, 'v', false)} L ${s},${s} ${edge(piece.edges.bottom, s, d, w, n, 'h', true)} L 0,${s} ${edge(piece.edges.left, s, d, w, n, 'v', true)} Z`
}

function edge(type: 'tab' | 'blank' | 'flat', s: number, d: number, w: number, n: number, dir: 'h' | 'v', rev: boolean): string {
  if (type === 'flat') return ''
  const m = type === 'tab' ? -1 : 1
  const st = (s - w) / 2
  const md = s / 2
  const ed = st + w
  const ns = (s - n) / 2
  const ne = ns + n
  
  if (dir === 'h') {
    const y = rev ? s : 0
    return `L ${rev ? ne : ns},${y} Q ${rev ? ne : ns},${y + m * d * 0.3} ${rev ? ed : st},${y + m * d * 0.5} Q ${md - w * 0.2},${y + m * d} ${md},${y + m * d} Q ${md + w * 0.2},${y + m * d} ${rev ? st : ed},${y + m * d * 0.5} Q ${rev ? ns : ne},${y + m * d * 0.3} ${rev ? ns : ne},${y} `
  } else {
    const x = rev ? 0 : s
    return `L ${x},${rev ? ne : ns} Q ${x + m * d * 0.3},${rev ? ne : ns} ${x + m * d * 0.5},${rev ? ed : st} Q ${x + m * d},${md - w * 0.2} ${x + m * d},${md} Q ${x + m * d},${md + w * 0.2} ${x + m * d * 0.5},${rev ? st : ed} Q ${x + m * d * 0.3},${rev ? ns : ne} ${x},${rev ? ns : ne} `
  }
}
