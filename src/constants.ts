import type { NoteName } from './types';

// Boomwhacker color scheme
export const NOTE_COLORS: Record<NoteName, string> = {
  C:  '#FF0000', // red
  D:  '#FF8C00', // orange
  E:  '#FFD700', // yellow
  F:  '#00CC00', // green
  G:  '#00CCCC', // cyan
  A:  '#0066FF', // blue
  H:  '#8B00FF', // purple
  C5: '#FF0000', // red (high C, same color)
};

// All playable notes in order
export const NOTE_NAMES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C5'];

// Display labels on keys (German naming)
export const NOTE_LABELS: Record<NoteName, string> = {
  C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', H: 'H', C5: 'C',
};

// Computer keyboard mapping: A S D F G H J K → C D E F G A H C5
export const KEYBOARD_MAP: Record<string, NoteName> = {
  'a': 'C', 's': 'D', 'd': 'E', 'f': 'F',
  'g': 'G', 'h': 'A', 'j': 'H', 'k': 'C5',
};

// MIDI note number to NoteName
export const MIDI_NOTE_MAP: Record<number, NoteName> = {
  60: 'C',   // C4
  62: 'D',   // D4
  64: 'E',   // E4
  67: 'G',   // G4 (skip 65=F, 66=F#)
  69: 'A',   // A4
  71: 'H',   // B4
  72: 'C5',  // C5
};
// Add F separately (65)
MIDI_NOTE_MAP[65] = 'F';

// Pitch string to NoteName mapping
export const PITCH_TO_NOTE: Record<string, NoteName> = {
  'C4': 'C', 'D4': 'D', 'E4': 'E', 'F4': 'F',
  'G4': 'G', 'A4': 'A', 'B4': 'H', 'C5': 'C5',
};

// NoteName to pitch string (for audio)
export const NOTE_TO_PITCH: Record<NoteName, string> = {
  C: 'C4', D: 'D4', E: 'E4', F: 'F4',
  G: 'G4', A: 'A4', H: 'B4', C5: 'C5',
};
