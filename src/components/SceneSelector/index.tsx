import { Select } from '@chakra-ui/react';
import { ActionType, useAppContext } from '~/hooks/useContext';

const SCENES = ['BouncingSquares', 'Conglomerates'] as const;

const formatSceneName = (scene: string) => {
  return scene.replace(/([A-Z])/g, ' $1').trim();
};

export const SceneSelector = () => {
  const {
    dispatch,
    state: { selectedScene },
  } = useAppContext();

  const handleSoundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      payload: event.target.value,
      type: ActionType.SetScene,
    });
  };

  return (
    <Select value={selectedScene} onChange={handleSoundChange}>
      {SCENES.map((scene) => (
        <option key={scene} value={scene}>
          {formatSceneName(scene)}
        </option>
      ))}
    </Select>
  );
};
