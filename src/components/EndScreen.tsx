import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface EndScreenProps {
  stars: number;
  onReplay: () => void;
  onBack: () => void;
}

export function EndScreen({ stars, onReplay, onBack }: EndScreenProps) {
  useEffect(() => {
    // Fire confetti!
    const duration = 3000;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.7 },
        colors: ['#FF0000', '#FF8C00', '#FFD700', '#00CC00', '#00CCCC', '#0066FF', '#8B00FF'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.7 },
        colors: ['#FF0000', '#FF8C00', '#FFD700', '#00CC00', '#00CCCC', '#0066FF', '#8B00FF'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }
    frame();
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, transparent 70%)',
    }}>
      <div style={{
        fontSize: 72,
        fontWeight: 900,
        animation: 'comboPopIn 0.5s ease-out',
      }}>
        🎉 Bravo! 🎉
      </div>
      <div style={{
        fontSize: 36,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span>⭐ {stars} Sterne gesammelt!</span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <button
          onClick={onReplay}
          style={{
            background: 'linear-gradient(135deg, #00cc00, #00cccc)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 24,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '16px 40px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,204,0,0.3)',
          }}
        >
          🔄 Nochmal!
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'linear-gradient(135deg, #0066ff, #8b00ff)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 24,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '16px 40px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,102,255,0.3)',
          }}
        >
          🎵 Andere Songs
        </button>
      </div>
    </div>
  );
}
