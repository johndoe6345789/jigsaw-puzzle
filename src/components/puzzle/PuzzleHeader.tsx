interface PuzzleHeaderProps {
  title: string
  description: string
}

export function PuzzleHeader({ title, description }: PuzzleHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">
        {title}
      </h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
