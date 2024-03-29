import { FaVolumeUp } from 'react-icons/fa';
import { FormControl, FormLabel, HStack, Select, Text } from '@chakra-ui/react';
import soundFiles from '~/assets/soundList.json';
import { ActionType, useAppContext } from '~/hooks/useContext';

const formatFileName = (fileName: string) => {
  return fileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
};

export const SoundSelector = () => {
  const {
    dispatch,
    state: { sound },
  } = useAppContext();

  const handleSoundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      payload: event.target.value,
      type: ActionType.SetSound,
    });
  };

  return (
    <FormControl>
      <FormLabel>
        <HStack>
          <Text>Sound</Text>
          <FaVolumeUp />
        </HStack>
      </FormLabel>
      <Select value={sound} onChange={handleSoundChange}>
        {soundFiles.map((file, index) => (
          <option key={file} value={file}>
            {`(${index}) - ${formatFileName(file)}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
