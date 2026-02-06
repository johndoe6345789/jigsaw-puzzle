# Planning Guide

An interactive jigsaw puzzle application where users can drag puzzle pieces and snap them together to complete a picture.

**Experience Qualities**: 
1. **Tactile** - Dragging and snapping pieces should feel physically satisfying with smooth animations and magnetic feedback
2. **Playful** - The interface should be fun and engaging with delightful interactions that make puzzle-solving enjoyable
3. **Focused** - Clean, uncluttered workspace that keeps attention on the puzzle itself

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused interactive tool with drag-and-drop functionality, collision detection, and state management for piece positions, but doesn't require complex routing or backend integration.

## Essential Features

### Puzzle Piece Dragging
- **Functionality**: Click and drag individual puzzle pieces around the canvas
- **Purpose**: Core interaction for manipulating puzzle pieces to solve the puzzle
- **Trigger**: Mouse down on a puzzle piece
- **Progression**: Mouse down on piece → piece lifts (z-index increase) → piece follows cursor → mouse up → piece drops
- **Success criteria**: Pieces move smoothly with cursor, no lag, piece stays under cursor during drag

### Snap-to-Connect
- **Functionality**: When pieces are dragged close to their correct neighboring pieces with matching tab/blank edges, they snap together automatically
- **Purpose**: Provides satisfying feedback and helps users connect pieces accurately, ensuring only valid connections are made
- **Trigger**: Dragging a piece within snap threshold distance of a compatible adjacent piece with complementary edges
- **Progression**: Piece approaches neighbor → adjacency check → edge compatibility check (tab matches blank) → distance check → snap animation → pieces lock together → move as unit
- **Success criteria**: Only correctly adjacent pieces with matching edges snap together, no flat edges connect, snapping feels magnetic and satisfying, connected pieces move together as one unit

### Puzzle Generation
- **Functionality**: Generate a puzzle from an image by dividing it into grid pieces with unique interlocking tab and blank connectors
- **Purpose**: Create the actual puzzle pieces with proper interlocking shapes where each edge has either a tab, blank, or flat edge (borders only)
- **Trigger**: App initialization
- **Progression**: Load image → divide into grid → assign complementary tab/blank edges ensuring tabs match with blanks → randomize positions → render pieces with proper jigsaw shapes
- **Success criteria**: Each piece has unique edge configuration with tabs and blanks, pieces properly tessellate when connected, no two adjacent flat edges, edge pieces have flat borders

### Group Movement
- **Functionality**: When pieces are connected, dragging one piece moves the entire connected group
- **Purpose**: Allows building sub-sections of the puzzle before connecting them
- **Trigger**: Dragging any piece that's part of a connected group
- **Progression**: Select piece → detect connected pieces → move entire group together → snap check for whole group
- **Success criteria**: All connected pieces move in unison, maintain relative positions

### AI Solve
- **Functionality**: AI automatically solves the puzzle piece by piece with visual feedback
- **Purpose**: Demonstrates AI capability and provides entertainment value when user needs help
- **Trigger**: Clicking the "AI Solve" button
- **Progression**: Button click → AI analyzes puzzle state → generates solving strategy → moves pieces one at a time with delays → shows progress → completion or user stops
- **Success criteria**: AI successfully connects adjacent pieces in a logical order, visual progress feedback, ability to stop mid-solve

## Edge Case Handling

- **Overlapping pieces**: Clicking on overlapping pieces selects the topmost piece
- **Rapid dragging**: Throttle snap detection to prevent performance issues with fast movements
- **Already connected**: Prevent re-snapping of already connected pieces
- **Edge pieces**: Handle pieces at puzzle boundaries that have flat edges on borders only
- **Completed puzzle**: Detect when all pieces are connected and show completion state
- **AI solve interruption**: Allow user to stop AI solving at any time and resume manual play
- **Invalid piece IDs**: Handle cases where AI suggests invalid piece connections gracefully
- **Invalid snapping**: Prevent pieces from snapping if edges don't match (tab to tab, blank to blank, or any edge to flat)
- **Non-adjacent pieces**: Only pieces that are grid neighbors can snap together, even if physically close

## Design Direction

The design should evoke a sense of calm focus and tactile satisfaction, like working on a physical puzzle on a wooden table. The interface should feel warm, natural, and inviting while maintaining a clean workspace that doesn't compete with the puzzle itself.

## Color Selection

A warm, natural palette inspired by crafted wooden puzzle boards and cozy indoor activities.

- **Primary Color**: Rich Walnut Brown (oklch(0.45 0.06 60)) - Communicates warmth and natural materials, grounding the interface
- **Secondary Colors**: 
  - Soft Cream (oklch(0.95 0.02 80)) - Canvas background, provides gentle contrast without harshness
  - Warm Sage (oklch(0.65 0.05 140)) - Subtle accents for UI controls
- **Accent Color**: Burnt Sienna (oklch(0.55 0.15 45)) - Attention-grabbing for completion celebrations and active states
- **Foreground/Background Pairings**:
  - Primary on Cream (oklch(0.45 0.06 60) on oklch(0.95 0.02 80)) - Ratio 7.2:1 ✓
  - Accent on Cream (oklch(0.55 0.15 45) on oklch(0.95 0.02 80)) - Ratio 5.1:1 ✓
  - Foreground on Background (oklch(0.25 0.01 60) on oklch(0.95 0.02 80)) - Ratio 12.5:1 ✓

## Font Selection

Typography should feel friendly and approachable yet clear, with a slight organic quality that complements the puzzle experience without being overly playful.

- **Typographic Hierarchy**: 
  - H1 (App Title): Space Grotesk Bold/32px/tight tracking for distinctive character
  - UI Controls: Space Grotesk Medium/14px/normal tracking for clarity
  - Completion Message: Space Grotesk Bold/24px/relaxed tracking for celebration

## Animations

Animations should emphasize the physical, tactile nature of puzzle pieces with smooth organic movement and satisfying snapping.

- **Piece Lift**: Subtle scale up (1.05x) and shadow increase when grabbed, 150ms ease-out
- **Snap Animation**: Quick spring animation (200ms) when pieces connect with slight overshoot for satisfaction
- **Group Movement**: Smooth dragging with subtle momentum on release, 300ms ease-out
- **Completion**: Celebratory scale pulse and confetti effect when puzzle completes

## Component Selection

- **Components**: 
  - Card for puzzle workspace with subtle shadow and rounded corners
  - Button for controls (shuffle, reset, AI solve) with hover states using Warm Sage
  - Dialog for completion celebration with backdrop blur
  - Progress indicator showing percentage complete
  - Secondary progress indicator for AI solving status
  
- **Customizations**: 
  - Custom SVG puzzle pieces with proper interlocking paths using quadratic bezier curves
  - Unique tab and blank connectors generated per piece with complementary edges
  - Custom drag-and-drop system using Framer Motion for smooth physics
  - Custom snap detection using distance calculations and edge compatibility checks
  - AI solve button with sparkle icon and accent color styling
  
- **States**: 
  - Puzzle pieces: idle (default shadow), grabbed (lifted with larger shadow), snapped (locked position), locked (during AI solve)
  - Buttons: default (Warm Sage), hover (darker sage), active (pressed inset), disabled (during AI solve)
  - AI Solve button: idle (accent color), active (solving with progress), stop (destructive variant)
  - Completion dialog: hidden, visible with backdrop
  
- **Icon Selection**: 
  - Shuffle (ArrowsClockwise) for randomizing pieces
  - ArrowCounterClockwise for reset
  - CheckCircle for completion indicator
  - Sparkle for AI solve feature
  
- **Spacing**: 
  - Puzzle workspace: p-8 for breathing room around pieces
  - Controls: gap-4 between buttons, mt-6 from workspace
  - Piece snap threshold: 30px detection radius
  
- **Mobile**: 
  - Touch-friendly piece sizes (minimum 80px)
  - Simplified controls with larger tap targets (min 44px)
  - Fewer pieces on mobile (3x3 vs 4x4 grid)
  - Stack controls vertically on narrow screens
