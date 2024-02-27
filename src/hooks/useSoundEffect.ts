import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

const AUDIO_PATH = 'audio';

export const useSoundEffect = (soundUrl: string, isRunning: boolean) => {
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (isRunning && !soundRef.current) {
      console.log('Loading sound');
      const newSound = new Howl({
        autoplay: false,
        src: [`${AUDIO_PATH}/${soundUrl}`],
      });

      soundRef.current = newSound;
    }

    return () => {
      soundRef.current?.stop();
      soundRef.current?.unload();
      soundRef.current = null;
    };
  }, [isRunning, soundUrl]);

  const play = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  }, []);

  return play;
};
