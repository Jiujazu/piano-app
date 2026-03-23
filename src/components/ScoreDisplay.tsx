interface ScoreDisplayProps {
  stars: number;
}

export function ScoreDisplay({ stars }: ScoreDisplayProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 28,
      fontWeight: 900,
    }}>
      <span>⭐</span>
      <span>{stars}</span>
    </div>
  );
}
