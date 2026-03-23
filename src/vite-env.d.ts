/// <reference types="vite/client" />

// Web MIDI API types
declare namespace WebMidi {
  interface MIDIAccess {
    inputs: Map<string, MIDIInput>;
    outputs: Map<string, MIDIOutput>;
    onstatechange: ((this: MIDIAccess, ev: Event) => void) | null;
  }

  interface MIDIInput {
    id: string;
    name: string | null;
    onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => void) | null;
  }

  interface MIDIOutput {
    id: string;
    name: string | null;
  }

  interface MIDIMessageEvent {
    data: Uint8Array;
  }
}

interface Navigator {
  requestMIDIAccess(): Promise<WebMidi.MIDIAccess>;
}
