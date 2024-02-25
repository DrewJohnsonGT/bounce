import { FaRegImage } from 'react-icons/fa';
import { FormControl, FormLabel, HStack, Select, Text } from '@chakra-ui/react';
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
    <FormControl>
      <FormLabel>
        <HStack>
          <Text>Scene</Text>
          <FaRegImage />
        </HStack>
      </FormLabel>
      <Select value={selectedScene} onChange={handleSoundChange}>
        {SCENE_NAMES.map((scene, index) => (
          <option key={scene} value={scene}>
            {`(${index}) - ${formatSceneName(scene)}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
