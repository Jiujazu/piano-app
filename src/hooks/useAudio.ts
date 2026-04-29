import { useRef, useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';
import { NOTE_TO_PITCH } from '../constants';
import type { NoteName } from '../types';

const VOLUME_STORAGE_KEY = 'pianoHeroVolume';

function loadVolume(): number {
  const v = parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY) || '');
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.7;
}

// Convert a 0–1 linear value to a Tone.js dB value.
// 0 → -Infinity (mute), 1 → 0 dB. Mid-range follows a perceptual curve.
function volumeToDb(v: number): number {
  if (v <= 0) return -Infinity;
  return 20 * Math.log10(v);
}

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const startedRef = useRef(false);
  const [volume, setVolumeState] = useState<number>(loadVolume);

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
      synthRef.current.volume.value = volumeToDb(volume);
    }
    return synthRef.current;
  }, [volume]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    if (synthRef.current) {
      synthRef.current.volume.value = volumeToDb(clamped);
    }
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

  return { playNote, playChord, ensureStarted, volume, setVolume };
}
