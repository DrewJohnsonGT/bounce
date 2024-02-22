import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import { COLORS, HEIGHT, WIDTH } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSound } from '~/hooks/useSound';
import {
  generateRandomColor,
  getDarkerVersionOfColor,
} from '~/util/getRandomColor';
import {
  createHollowSquare,
  FRICTIONLESS_PERFECTLY_ELASTIC,
} from '~/util/shapes';

const SQUARE_SIZE = 10;
const SQUARE_FORCE = 0.1;

const CONTAINER_SIZE = 500;

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

const getRandomPositionInsideContainer = () => {
  const offsetX = (WIDTH - CONTAINER_SIZE) / 2;
  const offsetY = (HEIGHT - CONTAINER_SIZE) / 2;

  const x = Math.random() * CONTAINER_SIZE + offsetX;
  const y = Math.random() * CONTAINER_SIZE + offsetY;

  return { x, y };
};

export const Conglomerates = () => {
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
        height: HEIGHT,
        width: WIDTH,
        wireframes: false,
      },
    });

    const squareSides = createHollowSquare({
      color: COLORS.WHITE,
      side: CONTAINER_SIZE,
      thickness: 5,
      x: WIDTH / 2,
      y: HEIGHT / 2,
    });

    const squareBody = createSquare(WIDTH / 2, HEIGHT / 2, COLORS.BLUE);
    const squareBody2 = createSquare(
      WIDTH / 2 + SQUARE_SIZE,
      HEIGHT / 2,
      COLORS.GREEN,
    );
    const squareBody3 = createSquare(
      WIDTH / 2,
      HEIGHT / 2 + SQUARE_SIZE,
      COLORS.YELLOW,
    );
    const squareBody4 = createSquare(
      WIDTH / 2 + SQUARE_SIZE,
      HEIGHT / 2 + SQUARE_SIZE,
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
          if (Math.random() < 0.1) {
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
    const position = getRandomPositionInsideContainer();
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

  return (
    <div
      ref={boxRef}
      style={{
        height: HEIGHT,
        width: WIDTH,
      }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
