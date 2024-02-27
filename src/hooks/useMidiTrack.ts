import { useEffect, useState } from 'react';
import { parseMidi } from 'midi-file';

export const useMidiTrack = (midiUrl: string, isRunning: boolean) => {
  const [track, setTrack] = useState<any[]>([]);

  useEffect(() => {
    if (isRunning) {
      fetch(midiUrl)
        .then(async (response) => await response.arrayBuffer())
        .then((arrayBuffer) => {
          const midi = parseMidi(new Uint8Array(arrayBuffer));
          setTrack(midi.tracks[0]);
        })
        .catch((error) => {
          console.error('Error loading midi', error);
        });
    }
  }, [isRunning, midiUrl]);

  return track;
};
