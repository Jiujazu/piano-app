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

// Compute 1–3 star rating from hits and misses.
// 3 stars: ≤ 1 miss per 10 notes
// 2 stars: ≤ 1 miss per 4 notes
// 1 star:  finished the song
export function computeStarRating(hits: number, misses: number): number {
  const total = hits + misses;
  if (total === 0) return 0;
  const accuracy = hits / total;
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.75) return 2;
  return 1;
}

export function useScoring() {
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMessage, setComboMessage] = useState<ComboMessage | null>(null);
  const comboIdRef = useRef(0);

  const addHit = useCallback(() => {
    setHits(prev => prev + 1);
    setCombo(prev => {
      const newCombo = prev + 1;
      for (const [threshold, text] of COMBO_MILESTONES) {
        if (newCombo === threshold) {
          const id = ++comboIdRef.current;
          setComboMessage({ text, id });
          setTimeout(() => {
            setComboMessage(prev => prev?.id === id ? null : prev);
          }, 2500);
          break;
        }
      }
      return newCombo;
    });
  }, []);

  const addMiss = useCallback(() => {
    setMisses(prev => prev + 1);
    setCombo(0);
  }, []);

  const resetScoring = useCallback(() => {
    setHits(0);
    setMisses(0);
    setCombo(0);
    setComboMessage(null);
  }, []);

  return { hits, misses, combo, comboMessage, addHit, addMiss, resetScoring };
}
