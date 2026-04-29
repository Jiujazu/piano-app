import { useState, useCallback, useEffect, useRef } from 'react';
import { Piano } from './Piano';
import { FallingNotes } from './FallingNotes';
import { ScoreDisplay } from './ScoreDisplay';
import { ComboPopup } from './ComboPopup';
import { EndScreen } from './EndScreen';
import { useGameEngine } from '../hooks/useGameEngine';
import { useScoring, computeStarRating } from '../hooks/useScoring';
import { useMidi } from '../hooks/useMidi';
import { useKeyboard } from '../hooks/useKeyboard';
import { useAudio } from '../hooks/useAudio';
import { useMicrophone } from '../hooks/useMicrophone';
import type { Song, NoteName } from '../types';

interface GameProps {
  song: Song;
  prevBestRating: number;
  onBack: () => void;
  onSongComplete: (songId: string, rating: number) => void;
}

export function Game({ song, prevBestRating, onBack, onSongComplete }: GameProps) {
  const [activeNotes, setActiveNotes] = useState<Set<NoteName>>(new Set());
  const [bpm, setBpm] = useState(song.bpm);
  const [micEnabled, setMicEnabled] = useState(false);
  const [midiConnected, setMidiConnected] = useState(false);
  const { playNote, ensureStarted, volume, setVolume } = useAudio();
  const { hits, misses, combo, comboMessage, addHit, addMiss, resetScoring } = useScoring();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const finalRatingRef = useRef(0);
  const [finalRating, setFinalRating] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const onNoteHit = useCallback((_note: NoteName) => {
    addHit();
  }, [addHit]);

  const onNoteMiss = useCallback((_expected: NoteName, _played: NoteName) => {
    addMiss();
  }, [addMiss]);

  const {
    fallingNotes,
    currentNoteIndex,
    isComplete,
    isPlaying,
    isPaused,
    showHint,
    expectedNote,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    handleNotePress,
    getBeatPosition,
  } = useGameEngine(song, bpm, onNoteHit, onNoteMiss);

  // Measure container with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleNoteOn = useCallback((note: NoteName) => {
    ensureStarted();
    setActiveNotes(prev => {
      if (prev.has(note)) return prev;
      const next = new Set(prev);
      next.add(note);
      return next;
    });
    // When using mic input, the real piano is making the sound
    if (!micEnabled) playNote(note);
    if (isPlaying && !isPaused) {
      handleNotePress(note);
    }
  }, [playNote, ensureStarted, isPlaying, isPaused, handleNotePress, micEnabled]);

  const handleNoteOff = useCallback((note: NoteName) => {
    setActiveNotes(prev => {
      if (!prev.has(note)) return prev;
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }, []);

  const handleReplay = useCallback(() => {
    resetGame();
    resetScoring();
    setFinalRating(0);
    setIsNewRecord(false);
    startGame();
  }, [resetGame, resetScoring, startGame]);

  const handleStart = useCallback(() => {
    ensureStarted();
    resetScoring();
    setFinalRating(0);
    setIsNewRecord(false);
    startGame();
  }, [ensureStarted, resetScoring, startGame]);

  // Compute and persist rating exactly once per completion
  useEffect(() => {
    if (isComplete && finalRatingRef.current === 0) {
      const rating = computeStarRating(hits, misses);
      finalRatingRef.current = rating;
      setFinalRating(rating);
      setIsNewRecord(rating > prevBestRating);
      onSongComplete(song.id, rating);
    }
    if (!isComplete) {
      finalRatingRef.current = 0;
    }
  }, [isComplete, hits, misses, song.id, prevBestRating, onSongComplete]);

  useMidi(handleNoteOn, handleNoteOff, setMidiConnected);
  useKeyboard(handleNoteOn, handleNoteOff);
  const { status: micStatus } = useMicrophone(micEnabled, handleNoteOn, handleNoteOff);

  const inputBadgeStyle: React.CSSProperties = {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.08)',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
  };

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
        gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 18,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          ← Zurück
        </button>
        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Nunito, sans-serif' }}>
          {song.emoji} {song.name}
        </div>
        <ScoreDisplay hits={hits} combo={combo} />
      </div>

      {/* Controls row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        justifyContent: 'center',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* Tempo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🐢</span>
          <input
            type="range"
            min={40}
            max={160}
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            style={{ width: 140, accentColor: '#ffd93d', height: 8 }}
            aria-label="Tempo"
          />
          <span style={{ fontSize: 20 }}>🐇</span>
          <span style={{ fontSize: 12, opacity: 0.5, minWidth: 56 }}>{bpm} BPM</span>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{volume === 0 ? '🔇' : '🔊'}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ width: 100, accentColor: '#ffd93d', height: 8 }}
            aria-label="Lautstärke"
          />
        </div>

        {/* Mic toggle */}
        <button
          onClick={() => setMicEnabled(v => !v)}
          style={{
            background: micEnabled
              ? 'linear-gradient(135deg, #ff6b6b, #ffd93d)'
              : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 14,
            fontWeight: 900,
            fontFamily: 'Nunito, sans-serif',
            padding: '8px 14px',
            cursor: 'pointer',
          }}
          title="Mikrofon hört auf das echte Klavier"
        >
          🎤 {micEnabled ? 'Mikro AN' : 'Mikro'}
        </button>

        {/* Pause / Resume */}
        {isPlaying && !isComplete && (
          <button
            onClick={isPaused ? resumeGame : pauseGame}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              fontWeight: 900,
              fontFamily: 'Nunito, sans-serif',
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            {isPaused ? '▶ Weiter' : '⏸ Pause'}
          </button>
        )}
      </div>

      {/* Input status badges */}
      <div style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {midiConnected && (
          <span style={{ ...inputBadgeStyle, color: '#00cccc' }}>🎹 MIDI verbunden</span>
        )}
        {micEnabled && micStatus === 'requesting' && (
          <span style={{ ...inputBadgeStyle, color: '#ffd93d' }}>🎤 Frage Mikrofon an…</span>
        )}
        {micEnabled && micStatus === 'active' && (
          <span style={{ ...inputBadgeStyle, color: '#00cc00' }}>🎤 Hört zu</span>
        )}
        {micEnabled && micStatus === 'denied' && (
          <span style={{ ...inputBadgeStyle, color: '#ff6b6b' }}>🎤 Zugriff verweigert</span>
        )}
        {micEnabled && micStatus === 'error' && (
          <span style={{ ...inputBadgeStyle, color: '#ff6b6b' }}>🎤 Nicht verfügbar</span>
        )}
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

        {/* Pause overlay */}
        {isPlaying && isPaused && !isComplete && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10,10,46,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 5,
          }}>
            <button
              onClick={resumeGame}
              style={{
                background: 'linear-gradient(135deg, #00cc00, #00cccc)',
                border: 'none',
                borderRadius: 24,
                color: '#fff',
                fontSize: 32,
                fontWeight: 900,
                fontFamily: 'Nunito, sans-serif',
                padding: '20px 48px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,204,0,0.4)',
              }}
            >
              ▶ Weiter
            </button>
          </div>
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
            rating={finalRating}
            hits={hits}
            misses={misses}
            isNewRecord={isNewRecord}
            onReplay={handleReplay}
            onBack={onBack}
          />
        )}
      </div>

      {/* Piano keyboard */}
      <Piano
        activeNotes={activeNotes}
        hintNote={showHint ? expectedNote : null}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
      />
    </div>
  );
}
