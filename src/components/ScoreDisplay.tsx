interface ScoreDisplayProps {
  hits: number;
  combo: number;
}

export function ScoreDisplay({ hits, combo }: ScoreDisplayProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: 22,
      fontWeight: 900,
      fontFamily: 'Nunito, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🎵</span>
        <span>{hits}</span>
      </div>
      {combo >= 2 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: '#ffd93d',
          textShadow: '0 0 10px rgba(255,217,61,0.6)',
        }}>
          <span>🔥</span>
          <span>{combo}</span>
        </div>
      )}
    </div>
  );
}
