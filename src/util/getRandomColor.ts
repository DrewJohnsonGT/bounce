import { COLORS } from '~/constants';

export const getRandomColor = (excluding = [] as string[]) => {
  const colors = Object.values(COLORS).filter(
    (color) => !excluding.includes(color),
  );
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

export const getDarkerVersionOfColor = (color: string) => {
  return color
    .split('')
    .map((char, index) => {
      if (index < 3) {
        return char;
      }
      const value = parseInt(char, 16);
      const newValue = Math.floor(value * 0.8);
      return newValue.toString(16);
    })
    .join('');
};
