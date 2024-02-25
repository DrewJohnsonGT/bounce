import { FaVolumeUp } from 'react-icons/fa';
import { FormControl, FormLabel, HStack, Select, Text } from '@chakra-ui/react';
import audioFiles from '~/assets/audioList.json';
import { ActionType, useAppContext } from '~/hooks/useContext';

const formatAudioName = (audio: string) => {
  return audio.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
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
        {audioFiles.map((file, index) => (
          <option key={file} value={file}>
            {`(${index}) - ${formatAudioName(file)}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
