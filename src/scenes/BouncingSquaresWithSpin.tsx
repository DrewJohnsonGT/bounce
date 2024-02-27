import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSoundEffect } from '~/hooks/useSoundEffect';
import { generateRandomColor } from '~/util/color';
import {
  createHollowRectangle,
  getRandomPositionInsideSquareContainer,
  PERFECTLY_ELASTIC,
} from '~/util/shapes';

const SQUARE_SIZE = 20;

const CONTAINER_SIZE = 450;
const CONTAINER_WALL_THICKNESS = 10;

const CHANGE_OF_SQUARE_SPAWN_ON_COLLISION = 0.1;
const INITIAL_VELOCITY = 1;

const createSquare = (x: number, y: number, color: string) => {
  return Bodies.rectangle(x, y, SQUARE_SIZE, SQUARE_SIZE, {
    ...PERFECTLY_ELASTIC,
    label: 'square',
    render: {
      fillStyle: color,
    },
  });
};

export const BouncingSquaresWithSpin = () => {
  const {
    state: { isRunning, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({ isRunning });

  const bounceSound = useSoundEffect(sound, isRunning);

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

    const squareSides = createHollowRectangle({
      color: COLORS.WHITE,
      side1Length: CONTAINER_SIZE,
      side2Length: CONTAINER_SIZE,
      thickness: CONTAINER_WALL_THICKNESS,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const squareBody1 = createSquare(
      CANVAS_WIDTH / 2 - SQUARE_SIZE,
      CANVAS_HEIGHT / 2 - SQUARE_SIZE,
      COLORS.BLUE,
    );
    const squareBody2 = createSquare(
      CANVAS_WIDTH / 2 + SQUARE_SIZE,
      CANVAS_HEIGHT / 2 - SQUARE_SIZE,
      COLORS.GREEN,
    );
    const squareBody3 = createSquare(
      CANVAS_WIDTH / 2 - SQUARE_SIZE,
      CANVAS_HEIGHT / 2 + SQUARE_SIZE,
      COLORS.RED,
    );
    const squareBody4 = createSquare(
      CANVAS_WIDTH / 2 + SQUARE_SIZE,
      CANVAS_HEIGHT / 2 + SQUARE_SIZE,
      COLORS.ORANGE,
    );

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyALabel = pair.bodyA.label;
        const bodyBLabel = pair.bodyB.label;
        const key = `${bodyALabel}-${bodyBLabel}`;
        if (key.includes('square')) {
          bounceSound();
        }
        if (key.includes('static')) {
          const squareBody = bodyALabel === 'square' ? pair.bodyA : pair.bodyB;
          if (Math.random() < CHANGE_OF_SQUARE_SPAWN_ON_COLLISION) {
            Body.setStatic(squareBody, true);
            squareBody.label = 'static-square';
            createNewSquare();
            createNewSquare();
          }
        }
      });
    });

    World.add(engine.world, [
      ...squareSides,
      squareBody1,
      squareBody2,
      squareBody3,
      squareBody4,
    ]);
    Body.setVelocity(squareBody4, { x: INITIAL_VELOCITY, y: INITIAL_VELOCITY });
    Body.setVelocity(squareBody3, {
      x: -INITIAL_VELOCITY,
      y: INITIAL_VELOCITY,
    });
    Body.setVelocity(squareBody1, {
      x: -INITIAL_VELOCITY,
      y: -INITIAL_VELOCITY,
    });
    Body.setVelocity(squareBody2, {
      x: INITIAL_VELOCITY,
      y: -INITIAL_VELOCITY,
    });

    Render.run(render);
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  const createNewSquare = () => {
    const color = generateRandomColor();
    const position = getRandomPositionInsideSquareContainer({
      containerPosX: CANVAS_WIDTH / 2,
      containerPosY: CANVAS_HEIGHT / 2,
      containerSize: CONTAINER_SIZE,
      containerWallThickness: CONTAINER_WALL_THICKNESS,
      elementSize: SQUARE_SIZE,
    });
    const squareBody = createSquare(position.x, position.y, color);

    World.add(engine.world, squareBody);
    Body.setVelocity(squareBody, {
      x: Math.random() < 0.5 ? -INITIAL_VELOCITY : INITIAL_VELOCITY,
      y: Math.random() < 0.5 ? -INITIAL_VELOCITY : INITIAL_VELOCITY,
    });
  };

  return <SceneBox boxRef={boxRef} canvasRef={canvasRef} />;
};
