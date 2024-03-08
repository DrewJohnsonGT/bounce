import edges from '~/assets/maps/3/edges.json';
import end from '~/assets/maps/3/end.json';
import obstacle2 from '~/assets/maps/3/obstacle2.json';
import obstacle3 from '~/assets/maps/3/obstacle3.json';
import obstacle4 from '~/assets/maps/3/obstacle4.json';
import obstacle5 from '~/assets/maps/3/obstacle5.json';
import start from '~/assets/maps/3/start.json';

export const MAP_3 = {
  edges,
  end,
  name: 'Map 3',
  obstacles: [obstacle2, obstacle3, obstacle4, obstacle5],
  podium: {
    height: 150,
    width: 150,
    x: 280,
    y: 390,
  },
  start,
};
