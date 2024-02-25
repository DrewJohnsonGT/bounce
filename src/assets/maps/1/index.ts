import map1Edges from '~/assets/maps/1/edges.json';
import map1End from '~/assets/maps/1/end.json';
import map1Start from '~/assets/maps/1/start.json';

export const MAP_1 = {
  edges: map1Edges,
  end: map1End,
  name: 'Map 1',
  obstacles: [],
  podium: {
    height: 175,
    width: 175,
    x: 40,
    y: 780,
  },
  start: map1Start,
};
