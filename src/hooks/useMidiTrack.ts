import { useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

const MIDI_PATH_PREFIX = 'public/midi/';

export const useMidiTrack = (filePath: string) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to start MIDI playback
  const startPlayback = useCallback(async () => {
    try {
      const response = await fetch(`${MIDI_PATH_PREFIX}${filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      const now = Tone.now() + 0.5;

      midi.tracks.forEach((track) => {
        const synth = new Tone.PolySynth(Tone.Synth, {
          envelope: {
            attack: 0.02,
            decay: 0.1,
            release: 1,
            sustain: 0.3,
          },
        }).toDestination();

        track.notes.forEach((note) => {
          synth.triggerAttackRelease(note.name, note.duration, note.time + now, note.velocity);
        });

        // Dispose of the synth after the last note is scheduled to end
        const lastNoteEnd = Math.max(...track.notes.map(note => note.time + note.duration));
        Tone.Transport.scheduleOnce(() => {
          synth.dispose();
        }, lastNoteEnd + now);
      });

      Tone.Transport.start(now);
    } catch (error) {
      console.error('Failed to load or play MIDI file:', error);
    }
  }, [filePath]);

  // Effect to handle play/pause toggle
  useEffect(() => {
    if (isPlaying) {
      startPlayback().catch((e) => { console.error('Failed to start playback:', e); });
    } else {
      Tone.Transport.cancel();
      Tone.Transport.stop();
    }

    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
    };
  }, [isPlaying, startPlayback]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return { togglePlay };
};
