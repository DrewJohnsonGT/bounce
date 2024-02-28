import { FaMusic } from 'react-icons/fa';
import { FormControl, FormLabel, HStack, Select, Text } from '@chakra-ui/react';
import midiFiles from '~/assets/midiList.json';
import { ActionType, useAppContext } from '~/hooks/useContext';

const formatFileName = (fileName: string) => {
  return fileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
};

export const MidiSelector = () => {
  const {
    dispatch,
    state: { midi },
  } = useAppContext();

  const handleMidiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      payload: event.target.value,
      type: ActionType.SetMidi,
    });
  };

  return (
    <FormControl>
      <FormLabel>
        <HStack>
          <Text>Midi</Text>
          <FaMusic />
        </HStack>
      </FormLabel>
      <Select value={midi} onChange={handleMidiChange}>
        {midiFiles.map((file, index) => (
          <option key={file} value={file}>
            {`(${index}) - ${formatFileName(file)}`}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
