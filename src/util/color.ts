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

export const getRainbowColor = (
  num: number,
  rateOfColorChange: number = 1,
): string => {
  const hue = (num * rateOfColorChange) % 360;
  const saturation = 100;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const opacity = (hexColor: string, opacity: number) => {
  return `${hexColor}${Math.floor(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
};

export const getContrastingTextColor = (hexColor: string): string => {
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'black' : 'white';
};
