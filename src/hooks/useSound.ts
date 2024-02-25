import { useCallback, useEffect, useRef } from 'react';

const POOL_SIZE = 100;
const AUDIO_PATH = '/audio';

export const useSound = (soundUrl: string, poolSize = POOL_SIZE) => {
  const audioPool = useRef<HTMLAudioElement[]>([]);
  const currentPlaying = useRef(new Set<HTMLAudioElement>());

  useEffect(() => {
    const initializeAudioPool = () => {
      audioPool.current.forEach((audio) => {
        audio.pause();
        audio.src = ''; // Release the object URL to avoid memory leaks
        currentPlaying.current.delete(audio);
      });
      audioPool.current = [];

      // Create new audio pool
      for (let i = 0; i < poolSize; i++) {
        const audio = new Audio(`${AUDIO_PATH}/${soundUrl}`);
        audioPool.current.push(audio);
        audio.addEventListener('ended', () => {
          currentPlaying.current.delete(audio);
        });
      }
    };

    initializeAudioPool();

    return () => {
      audioPool.current.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      currentPlaying.current.clear();
    };
  }, [soundUrl]);

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
