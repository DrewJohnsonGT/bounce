import React, { useEffect, useRef } from 'react';
import {
  Bodies,
  Body,
  Engine,
  Events,
  Render,
  Runner,
  Vector,
  World,
} from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { getDarkerVersionOfColor } from '~/util/color';
import {
  createHollowSquare,
  FRICTIONLESS_PERFECTLY_ELASTIC,
} from '~/util/shapes';

const SQUARE_SIZE = 50;
const SQUARE_FORCE = 5;

const CONTAINER_SIZE = 500;
const CONTAINER_WALL_THICKNESS = 10;

const TRAIL_MODULO = 5;
let trailCounter = 0;

const createSquare = (x: number, y: number, color: string) => {
  return Bodies.rectangle(x, y, SQUARE_SIZE, SQUARE_SIZE, {
    ...FRICTIONLESS_PERFECTLY_ELASTIC,
    label: 'square',
    render: {
      fillStyle: color,
      strokeStyle: getDarkerVersionOfColor(color),
    },
  });
};

export const TrailingSquares = () => {
  const trail = useRef<
    Array<{
      position: Vector;
      speed: number;
    }>
  >([]);
  const {
    state: { isRunning },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({ isRunning });

  useEffect(() => {
    const render = Render.create({
      canvas: canvasRef.current || undefined,
      element: boxRef.current || undefined,
      engine,
      options: {
        background: COLORS.TRANSPARENT,
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
        wireframes: false,
      },
    });

    const squareSides = createHollowSquare({
      color: COLORS.WHITE,
      side: CONTAINER_SIZE,
      thickness: CONTAINER_WALL_THICKNESS,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const square = createSquare(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      COLORS.RED,
    );

    World.add(engine.world, [...squareSides, square]);

    Body.applyForce(
      square,
      { x: 0, y: 0 },
      { x: Math.random() * SQUARE_FORCE, y: Math.random() * SQUARE_FORCE },
    );

    Events.on(render, 'afterRender', () => {
      trailCounter += 1;
      trailCounter % TRAIL_MODULO === 0 &&
        trail.current.unshift({
          position: Vector.clone(square.position),
          speed: square.speed,
        });

      if (trail.current.length > 2000) {
        trail.current.pop();
      }

      trail.current.forEach((trailSquare) => {
        const point = trailSquare.position;
        render.context.fillStyle = COLORS.RED;
        render.context.fillRect(
          point.x - SQUARE_SIZE / 2,
          point.y - SQUARE_SIZE / 2,
          SQUARE_SIZE,
          SQUARE_SIZE,
        );

        render.context.strokeStyle = COLORS.WHITE;
        render.context.lineWidth = 2;
        render.context.strokeRect(
          point.x - SQUARE_SIZE / 2,
          point.y - SQUARE_SIZE / 2,
          SQUARE_SIZE,
          SQUARE_SIZE,
        );
      });

      // const movingSquarePosition = square.position;
      // render.context.fillStyle = COLORS.WHITE;
      // render.context.fillRect(
      //   movingSquarePosition.x - SQUARE_SIZE / 2,
      //   movingSquarePosition.y - SQUARE_SIZE / 2,
      //   SQUARE_SIZE,
      //   SQUARE_SIZE,
      // );
    });

    Render.run(render);
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return <SceneBox boxRef={boxRef} canvasRef={canvasRef} />;
};
