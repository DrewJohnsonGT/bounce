import { FaMap } from 'react-icons/fa';
import { FormControl, FormLabel, HStack, Select, Text } from '@chakra-ui/react';
import { MAPS } from '~/assets/maps';
import { ActionType, useAppContext } from '~/hooks/useContext';

export const MapSelector = () => {
  const {
    dispatch,
    state: { selectedMap },
  } = useAppContext();

  const handleSoundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      payload: Number(event.target.value),
      type: ActionType.ChangeMap,
    });
  };

  return (
    <FormControl>
      <FormLabel>
        <HStack>
          <Text>Map</Text>
          <FaMap />
        </HStack>
      </FormLabel>
      <Select value={selectedMap} onChange={handleSoundChange}>
        {Object.entries(MAPS).map(([mapId, map]) => (
          <option key={mapId} value={mapId}>
            {map.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
