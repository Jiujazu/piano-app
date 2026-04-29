import { useState, useEffect, useRef } from 'react';
import { NOTE_NAMES, NOTE_LABELS, NOTE_COLORS } from '../constants';
import type { NoteName } from '../types';

interface PianoProps {
  activeNotes: Set<NoteName>;
  hintNote?: NoteName | null;
  onNoteOn: (note: NoteName) => void;
  onNoteOff: (note: NoteName) => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
}

let sparkleId = 0;

export function Piano({ activeNotes, hintNote, onNoteOn, onNoteOff }: PianoProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const prevActiveRef = useRef<Set<NoteName>>(new Set());

  // Create sparkles only for newly pressed notes (diff against previous set)
  useEffect(() => {
    const prev = prevActiveRef.current;
    const newlyPressed: NoteName[] = [];
    activeNotes.forEach(note => {
      if (!prev.has(note)) newlyPressed.push(note);
    });
    prevActiveRef.current = new Set(activeNotes);

    if (newlyPressed.length === 0) return;

    const created: Sparkle[] = [];
    newlyPressed.forEach(note => {
      const colIndex = NOTE_NAMES.indexOf(note);
      if (colIndex === -1) return;
      const color = NOTE_COLORS[note];
      const keyWidth = 100 / NOTE_NAMES.length;
      const centerX = colIndex * keyWidth + keyWidth / 2;

      for (let i = 0; i < 3; i++) {
        created.push({
          id: ++sparkleId,
          x: centerX + (Math.random() - 0.5) * keyWidth * 0.6,
          y: Math.random() * 30,
          color,
        });
      }
    });

    setSparkles(prev => [...prev, ...created]);
    const ids = new Set(created.map(s => s.id));
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !ids.has(s.id)));
    }, 600);
  }, [activeNotes]);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Sparkle particles above keys */}
      {sparkles.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: -10 - s.y,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: s.color,
            boxShadow: `0 0 8px ${s.color}`,
            pointerEvents: 'none',
            animation: 'sparkle 0.6s ease-out forwards',
            zIndex: 10,
          }}
        />
      ))}

      <div style={{
        display: 'flex',
        gap: 4,
        padding: '0 8px',
        height: 120,
      }}>
        {NOTE_NAMES.map((note) => {
          const isActive = activeNotes.has(note);
          const isHint = !isActive && hintNote === note;
          const color = NOTE_COLORS[note];
          return (
            <button
              key={note}
              onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); onNoteOn(note); }}
              onPointerUp={() => onNoteOff(note)}
              onPointerCancel={() => onNoteOff(note)}
              style={{
                flex: 1,
                border: isHint ? `3px solid ${color}` : 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 28,
                fontWeight: 900,
                fontFamily: 'Nunito, sans-serif',
                color: isActive ? '#fff' : '#333',
                background: isActive
                  ? color
                  : 'linear-gradient(to bottom, #ffffff, #e8e8e8)',
                boxShadow: isActive
                  ? `0 0 30px ${color}, 0 0 60px ${color}40`
                  : isHint
                    ? `0 0 20px ${color}, 0 0 40px ${color}80`
                    : '0 4px 8px rgba(0,0,0,0.3)',
                transform: isActive ? 'translateY(4px)' : 'none',
                animation: isHint ? 'hintPulse 0.9s ease-in-out infinite' : undefined,
                transition: 'all 0.08s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {NOTE_LABELS[note]}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
                  pointerEvents: 'none',
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
