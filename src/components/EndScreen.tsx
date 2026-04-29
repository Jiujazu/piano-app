import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface EndScreenProps {
  rating: number;       // 1–3 stars
  hits: number;
  misses: number;
  isNewRecord: boolean;
  onReplay: () => void;
  onBack: () => void;
}

const RATING_TEXT: Record<number, string> = {
  1: 'Geschafft! 🎵',
  2: 'Sehr gut! 🌟',
  3: 'Perfekt! 🏆',
};

export function EndScreen({ rating, hits, misses, isNewRecord, onReplay, onBack }: EndScreenProps) {
  useEffect(() => {
    const duration = rating >= 3 ? 4000 : rating >= 2 ? 2500 : 1500;
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
  }, [rating]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, transparent 70%)',
    }}>
      <div style={{
        fontSize: 64,
        fontWeight: 900,
        animation: 'comboPopIn 0.5s ease-out',
      }}>
        {RATING_TEXT[rating] ?? RATING_TEXT[1]}
      </div>

      {/* Three-star rating */}
      <div style={{ display: 'flex', gap: 12, fontSize: 72 }}>
        {[1, 2, 3].map(i => (
          <span
            key={i}
            style={{
              opacity: i <= rating ? 1 : 0.2,
              filter: i <= rating ? 'drop-shadow(0 0 12px rgba(255,217,61,0.8))' : 'grayscale(1)',
              animation: i <= rating ? `starPop 0.5s ease-out ${i * 0.25}s both` : undefined,
              display: 'inline-block',
            }}
          >
            ⭐
          </span>
        ))}
      </div>

      {isNewRecord && (
        <div style={{
          fontSize: 24,
          fontWeight: 900,
          color: '#ffd93d',
          textShadow: '0 0 14px rgba(255,217,61,0.6)',
          animation: 'comboPopIn 0.6s ease-out 0.4s both',
        }}>
          🎉 Neuer Rekord!
        </div>
      )}

      <div style={{ fontSize: 18, opacity: 0.7 }}>
        {hits} Treffer{misses > 0 ? ` · ${misses} verpasst` : ''}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <button
          onClick={onReplay}
          style={{
            background: 'linear-gradient(135deg, #00cc00, #00cccc)',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 22,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '14px 32px',
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
            fontSize: 22,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '14px 32px',
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
