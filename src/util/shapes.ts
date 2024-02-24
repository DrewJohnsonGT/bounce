import { Bodies } from 'matter-js';
import type { Body, IChamferableBodyDefinition } from 'matter-js';

export const FRICTIONLESS_PERFECTLY_ELASTIC: IChamferableBodyDefinition = {
  density: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  inertia: Infinity,
  restitution: 1,
};

export const createHollowSquare = ({
  additionalOptions = {},
  color,
  side,
  thickness,
  x,
  y,
}: {
  x: number;
  y: number;
  side: number;
  thickness: number;
  color: string;
  additionalOptions?: Partial<IChamferableBodyDefinition>;
}): Body[] => {
  const rectangleDefinitionConfig = {
    isStatic: true,
    render: { fillStyle: color },
    ...FRICTIONLESS_PERFECTLY_ELASTIC,
    label: 'static-wall',
    ...additionalOptions,
  };

  const offset = thickness / 2;
  const sideLength = side + thickness * 2;

  // Adjust positions and dimensions to maintain the interior side^2 area
  const top = Bodies.rectangle(
    x,
    y - side / 2 - offset,
    sideLength,
    thickness,
    rectangleDefinitionConfig,
  );
  const bottom = Bodies.rectangle(
    x,
    y + side / 2 + offset,
    sideLength,
    thickness,
    rectangleDefinitionConfig,
  );
  const left = Bodies.rectangle(
    x - side / 2 - offset,
    y,
    thickness,
    sideLength,
    rectangleDefinitionConfig,
  );
  const right = Bodies.rectangle(
    x + side / 2 + offset,
    y,
    thickness,
    sideLength,
    rectangleDefinitionConfig,
  );

  return [top, bottom, left, right];
};

export const getRandomPositionInsideSquareContainer = ({
  containerPosX,
  containerPosY,
  containerSize,
  containerWallThickness,
  elementSize = 0,
}: {
  containerSize: number;
  containerWallThickness: number;
  elementSize?: number;
  containerPosX: number;
  containerPosY: number;
}) => {
  const effectiveHalfSize =
    containerSize / 2 - containerWallThickness - elementSize / 2;

  const minX = containerPosX - effectiveHalfSize;
  const minY = containerPosY - effectiveHalfSize;

  const x = minX + Math.random() * (2 * effectiveHalfSize);
  const y = minY + Math.random() * (2 * effectiveHalfSize);

  return { x, y };
};
