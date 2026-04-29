import { useEffect, useRef, useState } from 'react';
import type { NoteName } from '../types';

type NoteCallback = (note: NoteName) => void;

const NOTE_FREQUENCIES: { note: NoteName; freq: number }[] = [
  { note: 'C',  freq: 261.63 },
  { note: 'D',  freq: 293.66 },
  { note: 'E',  freq: 329.63 },
  { note: 'F',  freq: 349.23 },
  { note: 'G',  freq: 392.00 },
  { note: 'A',  freq: 440.00 },
  { note: 'H',  freq: 493.88 },
  { note: 'C5', freq: 523.25 },
];

// Min RMS for "audio is present"
const RMS_THRESHOLD = 0.015;
// How close to a note (in cents, 100 cents = 1 semitone)
const CENT_TOLERANCE = 60;
// Frames a note must persist to be accepted
const STABILITY_FRAMES = 2;
// Frames of silence/different note before releasing
const RELEASE_FRAMES = 4;

function detectPitchACF(buf: Float32Array, sampleRate: number): number | null {
  const SIZE = buf.length;

  // Quick RMS check
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    const v = buf[i]!;
    rms += v * v;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < RMS_THRESHOLD) return null;

  // Lag range covers ~180 Hz to ~600 Hz (piano fundamentals C4–C5 plus margin)
  const minLag = Math.floor(sampleRate / 600);
  const maxLag = Math.ceil(sampleRate / 180);

  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    const limit = SIZE - lag;
    for (let i = 0; i < limit; i++) {
      corr += buf[i]! * buf[i + lag]!;
    }
    corr /= limit;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag < 0) return null;

  // Confidence threshold relative to RMS energy
  if (bestCorr < rms * rms * 0.4) return null;

  // Parabolic interpolation around peak for sub-sample accuracy
  const yPrev = bestLag > 0 ? lagCorr(buf, bestLag - 1) : bestCorr;
  const yNext = bestLag < SIZE - 1 ? lagCorr(buf, bestLag + 1) : bestCorr;
  const denom = yPrev - 2 * bestCorr + yNext;
  const refinedLag = denom !== 0
    ? bestLag + 0.5 * (yPrev - yNext) / denom
    : bestLag;

  return sampleRate / refinedLag;
}

function lagCorr(buf: Float32Array, lag: number): number {
  const SIZE = buf.length;
  const limit = SIZE - lag;
  let corr = 0;
  for (let i = 0; i < limit; i++) {
    corr += buf[i]! * buf[i + lag]!;
  }
  return corr / limit;
}

function freqToNote(freq: number): NoteName | null {
  let best: NoteName | null = null;
  let bestCents = Infinity;
  for (const { note, freq: ref } of NOTE_FREQUENCIES) {
    const cents = Math.abs(1200 * Math.log2(freq / ref));
    if (cents < bestCents) {
      bestCents = cents;
      best = note;
    }
  }
  return bestCents <= CENT_TOLERANCE ? best : null;
}

export type MicStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export function useMicrophone(
  enabled: boolean,
  onNoteOn: NoteCallback,
  onNoteOff: NoteCallback,
) {
  const [status, setStatus] = useState<MicStatus>('idle');
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  onNoteOnRef.current = onNoteOn;
  onNoteOffRef.current = onNoteOff;

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      return;
    }

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let rafId = 0;
    let cancelled = false;
    let currentNote: NoteName | null = null;
    let candidateNote: NoteName | null = null;
    let candidateFrames = 0;
    let silenceFrames = 0;

    setStatus('requesting');

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        if (cancelled) return;

        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const buf = new Float32Array(analyser.fftSize);
        const sampleRate = audioCtx.sampleRate;
        setStatus('active');

        function tick() {
          analyser.getFloatTimeDomainData(buf);
          const freq = detectPitchACF(buf, sampleRate);
          const detected = freq != null ? freqToNote(freq) : null;

          if (detected === currentNote) {
            // Same as currently active note: reset release counter
            silenceFrames = 0;
            candidateNote = null;
            candidateFrames = 0;
          } else if (detected != null) {
            // New candidate
            if (detected === candidateNote) {
              candidateFrames++;
            } else {
              candidateNote = detected;
              candidateFrames = 1;
            }
            silenceFrames = 0;

            if (candidateFrames >= STABILITY_FRAMES) {
              if (currentNote !== null) {
                onNoteOffRef.current(currentNote);
              }
              currentNote = detected;
              onNoteOnRef.current(detected);
              candidateNote = null;
              candidateFrames = 0;
            }
          } else {
            // Silence
            silenceFrames++;
            if (silenceFrames >= RELEASE_FRAMES && currentNote !== null) {
              onNoteOffRef.current(currentNote);
              currentNote = null;
            }
            candidateNote = null;
            candidateFrames = 0;
          }

          rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        const name = (err as Error)?.name;
        setStatus(name === 'NotAllowedError' ? 'denied' : 'error');
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (currentNote !== null) onNoteOffRef.current(currentNote);
      stream?.getTracks().forEach(t => t.stop());
      audioCtx?.close().catch(() => { /* ignore */ });
    };
  }, [enabled]);

  return { status };
}
