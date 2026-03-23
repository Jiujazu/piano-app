import type { Song } from '../types';

// Helper to build note arrays from a simple string notation
// Format: "C D E F" where each token is a pitch, durations default to 1 beat
// Use "G2" for a 2-beat note, "E0.5" for an eighth note
function parseNotes(notation: string): { pitch: string; duration: number; time: number }[] {
  const tokens = notation.trim().split(/\s+/);
  const notes: { pitch: string; duration: number; time: number }[] = [];
  let time = 0;

  for (const token of tokens) {
    // Match note name and optional duration: e.g. "C4", "G4:2", "E4:0.5"
    const match = token.match(/^([A-G]#?\d):?(\d*\.?\d*)$/);
    if (!match) continue;
    const pitch = match[1]!;
    const duration = match[2] ? parseFloat(match[2]) : 1;
    notes.push({ pitch, duration, time });
    time += duration;
  }

  return notes;
}

export const songs: Song[] = [
  {
    id: 'entchen',
    name: 'Alle meine Entchen',
    emoji: '🦆',
    level: 1,
    bpm: 100,
    notes: parseNotes(
      // Alle meine Entchen schwimmen auf dem See
      'C4 D4 E4 F4 G4:2 G4:2 ' +
      // Köpfchen in das Wasser, Schwänzchen in die Höh
      'A4 A4 A4 A4 G4:2 ' +
      // Alle meine Entchen schwimmen auf dem See (not repeated - second verse)
      'A4 A4 A4 A4 G4:2 ' +
      // Köpfchen in das Wasser, Schwänzchen in die Höh
      'F4 F4 F4 F4 E4:2 ' +
      'D4 D4 D4 D4 C4:2'
    ),
  },
  {
    id: 'haenschen',
    name: 'Hänschen klein',
    emoji: '🏠',
    level: 1,
    bpm: 100,
    notes: parseNotes(
      // Hänschen klein, ging allein
      'G4 E4 E4:2 F4 D4 D4:2 ' +
      // in die weite Welt hinein
      'C4 D4 E4 F4 G4 G4 G4:2 ' +
      // Hänschen klein, ging allein
      'G4 E4 E4:2 F4 D4 D4:2 ' +
      // in die weite Welt hinein
      'C4 E4 G4 G4 C4:2'
    ),
  },
  {
    id: 'summ',
    name: 'Summ summ summ',
    emoji: '🐝',
    level: 1,
    bpm: 100,
    notes: parseNotes(
      // Summ summ summ, Bienchen summ herum
      'G4 E4 E4:2 G4 E4 E4:2 ' +
      // Ei wir tun dir nichts zuleide
      'D4 E4 F4 F4 F4 F4 ' +
      // flieg nur aus in Wald und Heide
      'E4 F4 G4 G4 G4 G4 ' +
      // Summ summ summ, Bienchen summ herum
      'G4 E4 E4:2 G4 E4 E4:2 ' +
      'D4 E4 F4 F4 E4 D4 C4:2'
    ),
  },
  {
    id: 'jakob',
    name: 'Bruder Jakob',
    emoji: '🔔',
    level: 2,
    bpm: 100,
    notes: parseNotes(
      // Bruder Jakob, Bruder Jakob
      'C4 D4 E4 C4 C4 D4 E4 C4 ' +
      // Schläfst du noch? Schläfst du noch?
      'E4 F4 G4:2 E4 F4 G4:2 ' +
      // Hörst du nicht die Glocken?
      'G4 A4 G4 F4 E4 C4 ' +
      // Hörst du nicht die Glocken?
      'G4 A4 G4 F4 E4 C4 ' +
      // Ding dang dong, ding dang dong
      'C4 G4 C4:2 C4 G4 C4:2'
    ),
  },
  {
    id: 'twinkle',
    name: 'Morgen kommt der Weihnachtsmann',
    emoji: '⭐',
    level: 2,
    bpm: 90,
    notes: parseNotes(
      // Twinkle twinkle little star
      'C4 C4 G4 G4 A4 A4 G4:2 ' +
      // How I wonder what you are
      'F4 F4 E4 E4 D4 D4 C4:2 ' +
      // Up above the world so high
      'G4 G4 F4 F4 E4 E4 D4:2 ' +
      // Like a diamond in the sky
      'G4 G4 F4 F4 E4 E4 D4:2 ' +
      // Twinkle twinkle little star
      'C4 C4 G4 G4 A4 A4 G4:2 ' +
      // How I wonder what you are
      'F4 F4 E4 E4 D4 D4 C4:2'
    ),
  },
  {
    id: 'kuchen',
    name: 'Backe backe Kuchen',
    emoji: '🍰',
    level: 2,
    bpm: 100,
    notes: parseNotes(
      // Backe backe Kuchen
      'G4 E4 E4:2 F4 D4 D4:2 ' +
      // der Bäcker hat gerufen
      'C4 D4 E4 F4 G4 G4:2 ' +
      // Wer will guten Kuchen backen
      'G4 E4 E4:2 F4 D4 D4:2 ' +
      // der muss haben sieben Sachen
      'C4 E4 G4 G4 C4:2'
    ),
  },
];
