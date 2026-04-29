import { useState, useRef, useCallback, useEffect } from 'react';
import { PITCH_TO_NOTE } from '../constants';
import type { Song, NoteName } from '../types';

export interface FallingNote {
  index: number;
  pitch: string;
  note: NoteName;
  time: number;      // beat position in song
  duration: number;   // beat duration
  hit: boolean;
}

interface GameState {
  fallingNotes: FallingNote[];
  currentNoteIndex: number;
  isComplete: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  showHint: boolean;
}

// How long the player must wait at the hit line before the hint appears (ms)
const HINT_DELAY_MS = 2500;

export function useGameEngine(
  song: Song | null,
  bpm: number,
  onNoteHit: (note: NoteName) => void,
  onNoteMiss?: (expected: NoteName, played: NoteName) => void,
) {
  const [state, setState] = useState<GameState>({
    fallingNotes: [],
    currentNoteIndex: 0,
    isComplete: false,
    isPlaying: false,
    isPaused: false,
    showHint: false,
  });

  const beatPositionRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const waitingRef = useRef(false);
  const waitStartedAtRef = useRef(0);
  const animFrameRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onMissRef = useRef(onNoteMiss);
  onMissRef.current = onNoteMiss;

  const startGame = useCallback(() => {
    if (!song) return;

    const notes: FallingNote[] = song.notes.map((n, i) => ({
      index: i,
      pitch: n.pitch,
      note: PITCH_TO_NOTE[n.pitch] ?? 'C',
      time: n.time,
      duration: n.duration,
      hit: false,
    }));

    beatPositionRef.current = -4;
    waitingRef.current = false;
    waitStartedAtRef.current = 0;
    lastFrameTimeRef.current = 0;

    setState({
      fallingNotes: notes,
      currentNoteIndex: 0,
      isComplete: false,
      isPlaying: true,
      isPaused: false,
      showHint: false,
    });
  }, [song]);

  const pauseGame = useCallback(() => {
    setState(prev => prev.isPlaying && !prev.isComplete
      ? { ...prev, isPaused: true }
      : prev,
    );
    lastFrameTimeRef.current = 0;
  }, []);

  const resumeGame = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    lastFrameTimeRef.current = 0;
  }, []);

  // Pause on tab visibility change
  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden && stateRef.current.isPlaying && !stateRef.current.isComplete) {
        pauseGame();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pauseGame]);

  // Animation loop
  useEffect(() => {
    if (!state.isPlaying || state.isComplete || state.isPaused) return;

    function tick(timestamp: number) {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMs = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      if (!waitingRef.current) {
        const beatsPerMs = bpm / 60 / 1000;
        beatPositionRef.current += deltaMs * beatsPerMs;
      }

      const current = stateRef.current;
      const currentNote = current.fallingNotes[current.currentNoteIndex];

      if (currentNote && !currentNote.hit && beatPositionRef.current >= currentNote.time) {
        if (!waitingRef.current) {
          waitingRef.current = true;
          waitStartedAtRef.current = timestamp;
        }
        beatPositionRef.current = currentNote.time;
      }

      // Show hint if waiting too long
      const shouldShowHint = waitingRef.current
        && waitStartedAtRef.current > 0
        && timestamp - waitStartedAtRef.current >= HINT_DELAY_MS;

      if (shouldShowHint !== current.showHint) {
        setState(prev => ({ ...prev, showHint: shouldShowHint }));
      } else {
        setState(prev => ({ ...prev }));
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state.isPlaying, state.isComplete, state.isPaused, bpm]);

  const handleNotePress = useCallback((pressedNote: NoteName) => {
    const current = stateRef.current;
    if (!current.isPlaying || current.isComplete || current.isPaused) return;

    const currentNote = current.fallingNotes[current.currentNoteIndex];
    if (!currentNote || currentNote.hit) return;

    // Only count as miss if we are waiting at the hit line (note is "due")
    if (pressedNote !== currentNote.note) {
      if (waitingRef.current) {
        onMissRef.current?.(currentNote.note, pressedNote);
      }
      return;
    }

    onNoteHit(pressedNote);

    const nextIndex = current.currentNoteIndex + 1;
    const isComplete = nextIndex >= current.fallingNotes.length;

    setState(prev => ({
      ...prev,
      fallingNotes: prev.fallingNotes.map((n, i) =>
        i === current.currentNoteIndex ? { ...n, hit: true } : n
      ),
      currentNoteIndex: nextIndex,
      isComplete,
      showHint: false,
    }));

    waitingRef.current = false;
    waitStartedAtRef.current = 0;
    lastFrameTimeRef.current = 0;
  }, [onNoteHit]);

  const getBeatPosition = useCallback(() => beatPositionRef.current, []);

  const resetGame = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    waitingRef.current = false;
    waitStartedAtRef.current = 0;
    setState({
      fallingNotes: [],
      currentNoteIndex: 0,
      isComplete: false,
      isPlaying: false,
      isPaused: false,
      showHint: false,
    });
  }, []);

  // Expose the currently expected note (for hint highlighting)
  const expectedNote: NoteName | null = (() => {
    const cn = state.fallingNotes[state.currentNoteIndex];
    return cn && !cn.hit ? cn.note : null;
  })();

  return {
    ...state,
    expectedNote,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    handleNotePress,
    getBeatPosition,
  };
}
