import { useEffect, useRef } from 'react';
import { MIDI_NOTE_MAP } from '../constants';
import type { NoteName } from '../types';

type NoteCallback = (note: NoteName) => void;
type ConnectionCallback = (connected: boolean) => void;

export function useMidi(
  onNoteOn: NoteCallback,
  onNoteOff: NoteCallback,
  onConnectionChange?: ConnectionCallback,
) {
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  const onConnRef = useRef(onConnectionChange);
  onNoteOnRef.current = onNoteOn;
  onNoteOffRef.current = onNoteOff;
  onConnRef.current = onConnectionChange;

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    let inputs: WebMidi.MIDIInput[] = [];

    function handleMidiMessage(e: WebMidi.MIDIMessageEvent) {
      const [status, noteNumber] = e.data;
      if (status === undefined || noteNumber === undefined) return;
      const command = status & 0xf0;
      const note = MIDI_NOTE_MAP[noteNumber];
      if (!note) return;

      if (command === 0x90) {
        const velocity = e.data[2] ?? 0;
        if (velocity > 0) {
          onNoteOnRef.current(note);
        } else {
          onNoteOffRef.current(note);
        }
      } else if (command === 0x80) {
        onNoteOffRef.current(note);
      }
    }

    navigator.requestMIDIAccess().then((access) => {
      function connectInputs() {
        inputs.forEach(input => input.onmidimessage = null);
        inputs = Array.from(access.inputs.values());
        inputs.forEach(input => {
          input.onmidimessage = handleMidiMessage;
        });
        onConnRef.current?.(inputs.length > 0);
      }

      connectInputs();
      access.onstatechange = connectInputs;
    }).catch(() => {
      onConnRef.current?.(false);
    });

    return () => {
      inputs.forEach(input => input.onmidimessage = null);
      onConnRef.current?.(false);
    };
  }, []);
}
