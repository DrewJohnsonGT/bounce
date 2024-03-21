import { useEffect, useRef } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

const MIDI_PATH_PREFIX = '/midi/';

export const useMidiTrack = ({
  chunkDuration = 0.5,
  filePath,
}: {
  filePath: string;
  chunkDuration?: number;
}) => {
  const midiTrackRef = useRef<Midi | null>(null);
  const notesRef = useRef<
    Array<{ time: number; duration: number; name: string; velocity: number }>
  >([]);
  const currentNoteRef = useRef<number>(0);

  useEffect(() => {
    const loadAndDivideMidi = async () => {
      const response = await fetch(`${MIDI_PATH_PREFIX}${filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      midiTrackRef.current = midi;

      // Assuming there is only one track
      const track = midi.tracks[0];
      const notes = track.notes;
      notesRef.current = notes;
      console.log('notes', notesRef.current);
    };

    loadAndDivideMidi().catch((e) => {
      console.error('Failed to load and divide MIDI:', e);
    });
  }, [filePath, chunkDuration]);

  const playNextNote = () => {
    const currentIndex = currentNoteRef.current;
    if (currentIndex >= notesRef.current.length) {
      console.log('All notes played.');
      currentNoteRef.current = 0;
      return;
    }

    const note = notesRef.current[currentIndex];

    const synth = new Tone.Synth({
      envelope: {
        attack: 0.005,
        decay: 0.1,
        release: 1,
        sustain: 0.3,
      },
      oscillator: {
        type: 'triangle',
      },
    }).toDestination();

    synth.triggerAttackRelease(
      note.name,
      note.duration,
      Tone.now(),
      note.velocity,
    );

    currentNoteRef.current += 1;
  };

  return { playNextNote };
};
