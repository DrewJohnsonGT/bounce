import { FaPlay, FaStop } from 'react-icons/fa';
import { Button, Stack } from '@chakra-ui/react';
import { SceneSelector } from '~/components/SceneSelector';
import { SoundSelector } from '~/components/SoundSelector';
import { ActionType, useAppContext } from '~/hooks/useContext';
import { BouncingSquares, Conglomerates } from '~/scenes';

const SCENES = {
  BouncingSquares,
  Conglomerates,
};

export const App = () => {
  const {
    dispatch,
    state: { isRunning, selectedScene },
  } = useAppContext();

  const Scene = SCENES[selectedScene as keyof typeof SCENES] || null;

  const toggleIsRunning = () => {
    dispatch({ payload: !isRunning, type: ActionType.SetIsRunning });
  };

  return (
    <div className="container">
      <div className="controls">
        <Stack spacing={3}>
          <Button
            onClick={toggleIsRunning}
            isDisabled={false}
            colorScheme={isRunning ? 'red' : 'green'}
            variant="outline"
            leftIcon={isRunning ? <FaStop /> : <FaPlay />}>
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <SoundSelector />
          <SceneSelector />
        </Stack>
      </div>
      <main className="scene">
        <Scene />
      </main>
    </div>
  );
};
