import edges from '~/assets/maps/2/edges.json';
import end from '~/assets/maps/2/end.json';
import obstacle1 from '~/assets/maps/2/obstacle1.json';
import obstacle2 from '~/assets/maps/2/obstacle2.json';
import obstacle3 from '~/assets/maps/2/obstacle3.json';
import obstacle4 from '~/assets/maps/2/obstacle4.json';
import obstacle5 from '~/assets/maps/2/obstacle5.json';
import obstacle6 from '~/assets/maps/2/obstacle6.json';
import obstacle7 from '~/assets/maps/2/obstacle7.json';
import obstacle8 from '~/assets/maps/2/obstacle8.json';
import start from '~/assets/maps/2/start.json';

export const MAP_2 = {
  edges,
  end,
  name: 'Map 2',
  obstacles: [
    obstacle1,
    obstacle2,
    obstacle3,
    obstacle4,
    obstacle5,
    obstacle6,
    obstacle7,
    obstacle8,
  ],
  podium: {
    height: 140,
    width: 140,
    x: 5,
    y: 420,
  },
  start,
};
