import { useState, useCallback, useRef } from 'react';

interface ComboMessage {
  text: string;
  id: number;
}

const COMBO_MILESTONES: [number, string][] = [
  [3, '👏 Super!'],
  [5, '🎉 Toll!'],
  [10, '🌟 Fantastisch! 🌟'],
  [20, '🔥 Unglaublich! 🔥'],
  [30, '💫 Meisterhaft! 💫'],
];

export function useScoring() {
  const [stars, setStars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMessage, setComboMessage] = useState<ComboMessage | null>(null);
  const comboIdRef = useRef(0);

  const addHit = useCallback(() => {
    setStars(prev => prev + 1);
    setCombo(prev => {
      const newCombo = prev + 1;
      // Check milestones
      for (const [threshold, text] of COMBO_MILESTONES) {
        if (newCombo === threshold) {
          const id = ++comboIdRef.current;
          setComboMessage({ text, id });
          // Clear after 2.5 seconds
          setTimeout(() => {
            setComboMessage(prev => prev?.id === id ? null : prev);
          }, 2500);
          break;
        }
      }
      return newCombo;
    });
  }, []);

  const resetScoring = useCallback(() => {
    setStars(0);
    setCombo(0);
    setComboMessage(null);
  }, []);

  return { stars, combo, comboMessage, addHit, resetScoring };
}
