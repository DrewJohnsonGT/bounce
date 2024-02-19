import { COLORS } from '~/constants';

export const getRandomColor = (excluding = [] as string[]) => {
  const colors = Object.values(COLORS).filter(
    (color) => !excluding.includes(color),
  );
  return colors[Math.floor(Math.random() * colors.length)];
};
