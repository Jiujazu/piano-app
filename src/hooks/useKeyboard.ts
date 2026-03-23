import { useEffect, useRef } from 'react';
import { KEYBOARD_MAP } from '../constants';
import type { NoteName } from '../types';

type NoteCallback = (note: NoteName) => void;

export function useKeyboard(onNoteOn: NoteCallback, onNoteOff: NoteCallback) {
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  onNoteOnRef.current = onNoteOn;
  onNoteOffRef.current = onNoteOff;

  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const note = KEYBOARD_MAP[key];
      if (note && !pressedKeys.current.has(key)) {
        pressedKeys.current.add(key);
        onNoteOnRef.current(note);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      const note = KEYBOARD_MAP[key];
      if (note) {
        pressedKeys.current.delete(key);
        onNoteOffRef.current(note);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}
