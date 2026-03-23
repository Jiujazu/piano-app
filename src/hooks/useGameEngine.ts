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
}

export function useGameEngine(
  song: Song | null,
  bpm: number,
  onNoteHit: (note: NoteName) => void,
) {
  const [state, setState] = useState<GameState>({
    fallingNotes: [],
    currentNoteIndex: 0,
    isComplete: false,
    isPlaying: false,
  });

  // Beat position tracks how far into the song we are (in beats)
  const beatPositionRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const waitingRef = useRef(false);
  const animFrameRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize song
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

    beatPositionRef.current = -4; // Start 4 beats before first note (lead-in)
    waitingRef.current = false;
    lastFrameTimeRef.current = 0;

    setState({
      fallingNotes: notes,
      currentNoteIndex: 0,
      isComplete: false,
      isPlaying: true,
    });
  }, [song]);

  // Animation loop
  useEffect(() => {
    if (!state.isPlaying || state.isComplete) return;

    function tick(timestamp: number) {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMs = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      // Only advance time if not waiting for player
      if (!waitingRef.current) {
        const beatsPerMs = bpm / 60 / 1000;
        beatPositionRef.current += deltaMs * beatsPerMs;
      }

      const current = stateRef.current;
      const currentNote = current.fallingNotes[current.currentNoteIndex];

      // Check if current note has reached the hit line (beat position >= note time)
      if (currentNote && !currentNote.hit && beatPositionRef.current >= currentNote.time) {
        // Snap beat position to note time and wait
        beatPositionRef.current = currentNote.time;
        waitingRef.current = true;
      }

      // Force re-render for smooth animation
      setState(prev => ({ ...prev }));

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state.isPlaying, state.isComplete, bpm]);

  // Handle note press
  const handleNotePress = useCallback((pressedNote: NoteName) => {
    const current = stateRef.current;
    if (!current.isPlaying || current.isComplete) return;

    const currentNote = current.fallingNotes[current.currentNoteIndex];
    if (!currentNote || currentNote.hit) return;

    // Only accept the correct note
    if (pressedNote !== currentNote.note) return;

    // Mark note as hit
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
    }));

    // Resume time advancement
    waitingRef.current = false;
    lastFrameTimeRef.current = 0; // Reset to avoid time jump
  }, [onNoteHit]);

  // Get the current beat position for rendering
  const getBeatPosition = useCallback(() => beatPositionRef.current, []);

  const resetGame = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setState({
      fallingNotes: [],
      currentNoteIndex: 0,
      isComplete: false,
      isPlaying: false,
    });
  }, []);

  return {
    ...state,
    startGame,
    resetGame,
    handleNotePress,
    getBeatPosition,
  };
}
