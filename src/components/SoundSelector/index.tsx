import { Select } from '@chakra-ui/react';
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
    <Select value={sound} onChange={handleSoundChange}>
      {audioFiles.map((file) => (
        <option key={file} value={file}>
          {formatAudioName(file)}
        </option>
      ))}
    </Select>
  );
};
