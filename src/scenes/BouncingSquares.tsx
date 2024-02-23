import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSound } from '~/hooks/useSound';
import { generateRandomColor } from '~/util/color';
import {
  createHollowSquare,
  FRICTIONLESS_PERFECTLY_ELASTIC,
  getRandomPositionInsideSquareContainer,
} from '~/util/shapes';

const SQUARE_SIZE = 20;
const SQUARE_FORCE = 0.5;

const CONTAINER_SIZE = 500;
const CONTAINER_WALL_THICKNESS = 10;

const CHANGE_OF_SQUARE_SPAWN_ON_COLLISION = 0.1;

const createSquare = (x: number, y: number, color: string) => {
  return Bodies.rectangle(x, y, SQUARE_SIZE, SQUARE_SIZE, {
    ...FRICTIONLESS_PERFECTLY_ELASTIC,
    label: 'square',
    render: {
      fillStyle: color,
    },
  });
};

export const BouncingSquares = () => {
  const {
    state: { isRunning, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({ isRunning });

  const bounceSound = useSound(sound);

  useEffect(() => {
    const render = Render.create({
      canvas: canvasRef.current || undefined,
      element: boxRef.current || undefined,
      engine,
      options: {
        background: COLORS.BLACK,
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

    const squareBody = createSquare(
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
      squareBody,
      squareBody2,
      squareBody3,
      squareBody4,
    ]);
    Body.applyForce(
      squareBody,
      { x: 0, y: 0 },
      { x: -SQUARE_FORCE, y: -SQUARE_FORCE },
    );
    Body.applyForce(
      squareBody2,
      { x: 0, y: 0 },
      { x: SQUARE_FORCE, y: -SQUARE_FORCE },
    );
    Body.applyForce(
      squareBody3,
      { x: 0, y: 0 },
      { x: -SQUARE_FORCE, y: SQUARE_FORCE },
    );
    Body.applyForce(
      squareBody4,
      { x: 0, y: 0 },
      { x: SQUARE_FORCE, y: SQUARE_FORCE },
    );

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
    Body.applyForce(
      squareBody,
      { x: 0, y: 0 },
      {
        x: Math.random() < 0.5 ? -SQUARE_FORCE : SQUARE_FORCE,
        y: Math.random() < 0.5 ? -SQUARE_FORCE : SQUARE_FORCE,
      },
    );
  };

  return <SceneBox boxRef={boxRef} canvasRef={canvasRef} />;
};
