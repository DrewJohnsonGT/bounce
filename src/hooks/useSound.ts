import { useCallback, useEffect, useRef } from 'react';

const POOL_SIZE = 500;
const AUDIO_PATH = '/audio';

export const useSound = (soundUrl: string) => {
  const audioPool = useRef<HTMLAudioElement[]>([]);
  const currentPlaying = useRef(new Set<HTMLAudioElement>());

  // Effect to create or recreate the audio pool when soundUrl changes
  useEffect(() => {
    // Function to initialize the audio pool
    const initializeAudioPool = () => {
      // Clear current audio pool to prevent memory leaks
      audioPool.current.forEach((audio) => {
        audio.pause();
        audio.src = ''; // Release the object URL to avoid memory leaks
        currentPlaying.current.delete(audio);
      });
      audioPool.current = [];

      // Create new audio pool
      for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio(`${AUDIO_PATH}/${soundUrl}`);
        audioPool.current.push(audio);
        audio.addEventListener('ended', () => {
          currentPlaying.current.delete(audio);
        });
      }
    };

    initializeAudioPool();

    // Cleanup function to run when the component unmounts or before the pool is recreated
    return () => {
      audioPool.current.forEach((audio) => {
        audio.pause();
        audio.src = ''; // Clean up the audio element to avoid memory leaks
      });
      currentPlaying.current.clear();
    };
  }, [soundUrl]); // This effect runs whenever soundUrl changes

  const play = useCallback(() => {
    const audio = audioPool.current.find((a) => !currentPlaying.current.has(a));
    if (audio) {
      currentPlaying.current.add(audio);
      audio.play().catch((error) => {
        console.error('Error playing sound:', error);
      });
    } else {
      console.warn('No available audio instances to play');
    }
  }, []);

  return play;
};
