import { useEffect, useRef } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

const MIDI_PATH_PREFIX = 'public/midi/';

export const useMidiTrackChunks = ({
  chunkDuration = 0.5,
  filePath,
}: {
  filePath: string;
  chunkDuration?: number;
}) => {
  const midiTrackRef = useRef<Midi | null>(null);
  const chunksRef = useRef<
    Array<{
      start: number;
      end: number;
      notes: Array<{
        time: number;
        duration: number;
        name: string;
        velocity: number;
      }>;
    }>
  >([]);
  const currentChunkRef = useRef<number>(0);

  useEffect(() => {
    const loadAndDivideMidi = async () => {
      const response = await fetch(`${MIDI_PATH_PREFIX}${filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      midiTrackRef.current = midi;
      const totalDuration = midi.duration;
      const totalChunks = Math.ceil(totalDuration / chunkDuration);

      const chunks = Array.from({ length: totalChunks }, (_, i) => {
        const start = i * chunkDuration;
        const end = start + chunkDuration;
        // Check all tracks for notes in the current chunk
        const notes = midi.tracks.flatMap((track) => {
          return track.notes.filter(
            (note) => note.time >= start && note.time <= end,
          );
        });
        return { end, notes, start };
      });
      // Filter out chunks without notes
      chunksRef.current = chunks.filter((chunk) => chunk.notes.length > 0);
    };

    loadAndDivideMidi().catch((e) => {
      console.error('Failed to load and divide MIDI:', e);
    });
  }, [filePath, chunkDuration]);

  const synth = new Tone.PolySynth(Tone.Synth, {
    envelope: {
      attack: 0.02,
      decay: 0.1,
      release: 1,
      sustain: 0.3,
    },
  }).toDestination();

  const playNextChunk = () => {
    const currentMidiTrack = midiTrackRef.current; // Use the ref here
    const currentChunks = chunksRef.current;
    const currentIndex = currentChunkRef.current;

    if (currentIndex >= currentChunks.length) {
      console.log('All chunks played.');
      currentChunkRef.current = 0;
      return;
    }

    if (!currentMidiTrack) return;

    const now = Tone.now();
    const chunk = currentChunks[currentIndex];

    chunk.notes.forEach((note) => {
      synth.triggerAttackRelease(
        note.name,
        note.duration,
        note.time + now - chunk.start,
        note.velocity,
      );
    });

    Tone.Transport.start(now);
    currentChunkRef.current = currentIndex + 1;
  };

  // Directly return the function
  return { playNextChunk };
};
