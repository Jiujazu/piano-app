export interface SongNote {
  pitch: string;    // "C4", "D4", ... "C5"
  duration: number; // in beats (1 = quarter, 0.5 = eighth, 2 = half)
  time: number;     // start time in beats from song beginning
}

export interface Song {
  id: string;
  name: string;
  emoji: string;
  level: number;
  bpm: number;
  notes: SongNote[];
}

export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'H' | 'C5';

export interface ActiveNote {
  note: NoteName;
  timestamp: number;
}
