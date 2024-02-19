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
}): Body[] => {
  const halfSide = side / 2;
  const halfThickness = thickness / 2;

  const rectangleDefintionConfig = {
    isStatic: true,
    render: { fillStyle: color },
    ...FRICTIONLESS_PERFECTLY_ELASTIC,
    label: 'static-wall',
  };

  const top = Bodies.rectangle(
    x,
    y - halfSide + halfThickness,
    side,
    thickness,
    rectangleDefintionConfig,
  );
  const bottom = Bodies.rectangle(
    x,
    y + halfSide - halfThickness,
    side,
    thickness,
    rectangleDefintionConfig,
  );
  const left = Bodies.rectangle(
    x - halfSide + halfThickness,
    y,
    thickness,
    side,
    rectangleDefintionConfig,
  );
  const right = Bodies.rectangle(
    x + halfSide - halfThickness,
    y,
    thickness,
    side,
    rectangleDefintionConfig,
  );

  return [top, bottom, left, right];
};
