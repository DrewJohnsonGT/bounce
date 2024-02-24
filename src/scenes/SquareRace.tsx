import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Render, Runner, World } from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { createHollowSquare, PERFECTLY_ELASTIC } from '~/util/shapes';

const SQUARE_SIZE = 20;
const INITIAL_VELOCITY = 5;

const createSquare = (x: number, y: number, color: string) => {
  return Bodies.rectangle(x, y, SQUARE_SIZE, SQUARE_SIZE, {
    ...PERFECTLY_ELASTIC,
    label: 'square',
    render: {
      fillStyle: color,
    },
  });
};

export const SquareRace = () => {
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

    const tempWalls = createHollowSquare({
      color: COLORS.WHITE,
      side: 500,
      thickness: 10,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const bounds = Bodies.fromVertices(
      200,
      420,
      [
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 200, y: 250 },
          { x: 100, y: 300 },
        ],
      ],
      {
        isStatic: true,
        render: {
          fillStyle: COLORS.WHITE,
        },
      },
    );

    const squareBody = createSquare(
      CANVAS_WIDTH / 1.5 - SQUARE_SIZE,
      CANVAS_HEIGHT / 1.5 - SQUARE_SIZE,
      COLORS.BLUE,
    );

    World.add(engine.world, [...tempWalls, bounds, squareBody]);

    Body.setVelocity(squareBody, { x: INITIAL_VELOCITY, y: INITIAL_VELOCITY });

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
