import { Select } from '@chakra-ui/react';
import { ActionType, useAppContext } from '~/hooks/useContext';
import { SCENES } from '~/scenes';

const SCENE_NAMES = Object.keys(SCENES);

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
      {SCENE_NAMES.map((scene) => (
        <option key={scene} value={scene}>
          {formatSceneName(scene)}
        </option>
      ))}
    </Select>
  );
};
