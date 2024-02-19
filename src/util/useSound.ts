import { useCallback } from 'react';

export const useSound = (soundUrl: string) => {
  const play = useCallback(() => {
    const sound = new Audio(soundUrl);
    sound.play().catch((error) => {
      console.error('Error playing sound:', error);
    });
  }, [soundUrl]);

  return play;
};
