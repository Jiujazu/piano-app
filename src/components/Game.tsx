import { useState, useCallback, useEffect, useRef } from 'react';
import { Piano } from './Piano';
import { FallingNotes } from './FallingNotes';
import { ScoreDisplay } from './ScoreDisplay';
import { ComboPopup } from './ComboPopup';
import { EndScreen } from './EndScreen';
import { useGameEngine } from '../hooks/useGameEngine';
import { useScoring } from '../hooks/useScoring';
import { useMidi } from '../hooks/useMidi';
import { useKeyboard } from '../hooks/useKeyboard';
import { useAudio } from '../hooks/useAudio';
import type { Song, NoteName } from '../types';

interface GameProps {
  song: Song;
  onBack: () => void;
  onSongComplete: (songId: string, stars: number) => void;
}

export function Game({ song, onBack, onSongComplete }: GameProps) {
  const [activeNotes, setActiveNotes] = useState<Set<NoteName>>(new Set());
  const [bpm, setBpm] = useState(song.bpm);
  const { playNote, ensureStarted } = useAudio();
  const { stars, comboMessage, addHit, resetScoring } = useScoring();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);

  const onNoteHit = useCallback((_note: NoteName) => {
    addHit();
  }, [addHit]);

  const {
    fallingNotes,
    currentNoteIndex,
    isComplete,
    isPlaying,
    startGame,
    resetGame,
    handleNotePress,
    getBeatPosition,
  } = useGameEngine(song, bpm, onNoteHit);

  // Measure container height
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleNoteOn = useCallback((note: NoteName) => {
    ensureStarted();
    setActiveNotes(prev => new Set(prev).add(note));
    playNote(note);
    if (isPlaying) {
      handleNotePress(note);
    }
  }, [playNote, ensureStarted, isPlaying, handleNotePress]);

  const handleNoteOff = useCallback((note: NoteName) => {
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }, []);

  const handleReplay = useCallback(() => {
    resetGame();
    resetScoring();
    startGame();
  }, [resetGame, resetScoring, startGame]);

  const handleStart = useCallback(() => {
    ensureStarted();
    resetScoring();
    startGame();
  }, [ensureStarted, resetScoring, startGame]);

  // Save stars when song completes
  useEffect(() => {
    if (isComplete) {
      onSongComplete(song.id, stars);
    }
  }, [isComplete, song.id, stars, onSongComplete]);

  useMidi(handleNoteOn, handleNoteOff);
  useKeyboard(handleNoteOn, handleNoteOff);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: 16,
      gap: 8,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 20,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '8px 20px',
            cursor: 'pointer',
          }}
        >
          ← Zurück
        </button>
        <div style={{ fontSize: 24, fontWeight: 900 }}>
          {song.emoji} {song.name}
        </div>
        <ScoreDisplay stars={stars} />
      </div>

      {/* Tempo slider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 24 }}>🐢</span>
        <input
          type="range"
          min={40}
          max={160}
          value={bpm}
          onChange={e => setBpm(Number(e.target.value))}
          style={{
            width: 200,
            accentColor: '#ffd93d',
            height: 8,
          }}
        />
        <span style={{ fontSize: 24 }}>🐇</span>
        <span style={{ fontSize: 14, opacity: 0.5, minWidth: 60 }}>{bpm} BPM</span>
      </div>

      {/* Falling notes area */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {isPlaying && !isComplete && (
          <>
            <FallingNotes
              notes={fallingNotes}
              currentNoteIndex={currentNoteIndex}
              beatPosition={getBeatPosition()}
              containerHeight={containerHeight}
            />
            <ComboPopup message={comboMessage} />
          </>
        )}

        {/* Start overlay */}
        {!isPlaying && !isComplete && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <button
              onClick={handleStart}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
                border: 'none',
                borderRadius: 24,
                color: '#fff',
                fontSize: 36,
                fontWeight: 900,
                fontFamily: 'Nunito, sans-serif',
                padding: '24px 60px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(255,107,107,0.4)',
              }}
            >
              ▶ Los geht&apos;s!
            </button>
          </div>
        )}

        {/* End screen with confetti */}
        {isComplete && (
          <EndScreen
            stars={stars}
            onReplay={handleReplay}
            onBack={onBack}
          />
        )}
      </div>

      {/* Piano keyboard */}
      <Piano
        activeNotes={activeNotes}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
      />
    </div>
  );
}
