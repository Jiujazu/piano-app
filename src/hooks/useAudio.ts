import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { NOTE_TO_PITCH } from '../constants';
import type { NoteName } from '../types';

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const startedRef = useRef(false);

  const ensureStarted = useCallback(async () => {
    if (startedRef.current) return;
    await Tone.start();
    startedRef.current = true;
  }, []);

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.4,
          release: 0.8,
        },
      }).toDestination();
      synthRef.current.volume.value = -6;
    }
    return synthRef.current;
  }, []);

  const playNote = useCallback((note: NoteName, duration = '8n') => {
    ensureStarted().then(() => {
      const synth = getSynth();
      const pitch = NOTE_TO_PITCH[note];
      synth.triggerAttackRelease(pitch, duration);
    });
  }, [ensureStarted, getSynth]);

  const playChord = useCallback((notes: NoteName[], duration = '2n') => {
    ensureStarted().then(() => {
      const synth = getSynth();
      const pitches = notes.map(n => NOTE_TO_PITCH[n]);
      synth.triggerAttackRelease(pitches, duration);
    });
  }, [ensureStarted, getSynth]);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  return { playNote, playChord, ensureStarted };
}
