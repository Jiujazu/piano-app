import { NOTE_COLORS, NOTE_LABELS, NOTE_NAMES } from '../constants';
import type { FallingNote } from '../hooks/useGameEngine';

interface FallingNotesProps {
  notes: FallingNote[];
  currentNoteIndex: number;
  beatPosition: number;
  containerHeight: number;
}

// How many beats are visible in the falling area
const VISIBLE_BEATS = 8;

export function FallingNotes({ notes, currentNoteIndex, beatPosition, containerHeight }: FallingNotesProps) {
  const pixelsPerBeat = containerHeight / VISIBLE_BEATS;
  const keyWidth = 100 / NOTE_NAMES.length; // percentage

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: containerHeight,
      overflow: 'hidden',
      padding: '0 8px',
    }}>
      {/* Hit line at the bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 8,
        right: 8,
        height: 3,
        background: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        zIndex: 2,
      }} />

      {notes.map((note, i) => {
        if (note.hit) return null;

        // Calculate Y position: bottom of container = beatPosition, notes above
        const beatDiff = note.time - beatPosition;
        const bottomY = containerHeight - (beatDiff * pixelsPerBeat);
        const noteHeight = Math.max(note.duration * pixelsPerBeat - 4, 30);
        const topY = bottomY - noteHeight;

        // Cull notes that are off-screen
        if (topY > containerHeight + 50 || bottomY < -50) return null;

        // Find the column index for this note
        const colIndex = NOTE_NAMES.indexOf(note.note);
        if (colIndex === -1) return null;

        const color = NOTE_COLORS[note.note];
        const isCurrent = i === currentNoteIndex;

        return (
          <div
            key={note.index}
            style={{
              position: 'absolute',
              left: `calc(${colIndex * keyWidth}% + 2px)`,
              width: `calc(${keyWidth}% - 4px)`,
              top: topY,
              height: noteHeight,
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              boxShadow: isCurrent
                ? `0 0 20px ${color}, 0 0 40px ${color}60`
                : `0 2px 8px rgba(0,0,0,0.3)`,
              border: isCurrent ? '3px solid rgba(255,255,255,0.8)' : 'none',
              transition: 'box-shadow 0.2s',
              zIndex: isCurrent ? 1 : 0,
            }}
          >
            {NOTE_LABELS[note.note]}
          </div>
        );
      })}
    </div>
  );
}
