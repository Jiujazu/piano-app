import { useState, useCallback, useEffect } from 'react';
import { Game } from './components/Game';
import { songs } from './data/songs';
import { NOTE_COLORS } from './constants';
import type { Song } from './types';
import './App.css';

const STORAGE_KEY = 'pianoHeroStars';

function loadStars(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStars(songId: string, newStars: number) {
  const all = loadStars();
  const prev = all[songId] ?? 0;
  if (newStars > prev) {
    all[songId] = newStars;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

export default function App() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [starCounts, setStarCounts] = useState(loadStars);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSong(null);
    setStarCounts(loadStars());
  }, []);

  const handleSongComplete = useCallback((songId: string, earnedStars: number) => {
    saveStars(songId, earnedStars);
    setStarCounts(loadStars());
  }, []);

  if (selectedSong) {
    return (
      <Game
        song={selectedSong}
        onBack={handleBack}
        onSongComplete={handleSongComplete}
      />
    );
  }

  // Song selection screen
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: 24,
      gap: 24,
      alignItems: 'center',
    }}>
      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: 24,
          padding: '8px 16px',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        {isFullscreen ? '⊡' : '⊞'}
      </button>

      <h1 style={{
        fontSize: 48,
        fontWeight: 900,
        background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #00cc00, #00cccc, #0066ff, #8b00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
      }}>
        🎹 Piano Hero 🎹
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20,
        width: '100%',
        maxWidth: 900,
        flex: 1,
        alignContent: 'center',
      }}>
        {songs.map((song, i) => {
          const colors = Object.values(NOTE_COLORS);
          const color1 = colors[i % colors.length]!;
          const color2 = colors[(i + 2) % colors.length]!;
          const bestStars = starCounts[song.id] ?? 0;
          return (
            <button
              key={song.id}
              onClick={() => setSelectedSong(song)}
              style={{
                background: `linear-gradient(135deg, ${color1}30, ${color2}30)`,
                border: `3px solid ${color1}60`,
                borderRadius: 20,
                padding: 24,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: `0 4px 20px ${color1}20`,
              }}
              onPointerEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 8px 40px ${color1}40`;
              }}
              onPointerLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${color1}20`;
              }}
            >
              <span style={{ fontSize: 48 }}>{song.emoji}</span>
              <span style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {song.name}
              </span>
              <span style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Nunito, sans-serif',
              }}>
                Level {song.level}
              </span>
              {bestStars > 0 && (
                <span style={{
                  fontSize: 16,
                  color: '#ffd93d',
                  fontWeight: 900,
                  fontFamily: 'Nunito, sans-serif',
                }}>
                  ⭐ {bestStars}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
