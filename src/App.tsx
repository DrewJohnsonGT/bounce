import React, { useEffect, useRef, useState } from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';
import { Button } from '@chakra-ui/react';
import {
  Bodies,
  Body,
  Engine,
  Events,
  Render,
  Resolver,
  Runner,
  World,
} from 'matter-js';
import { COLORS, HEIGHT, WIDTH } from '~/constants';
import { getRandomColor } from '~/util/getRandomColor';
import {
  createHollowSquare,
  FRICTIONLESS_PERFECTLY_ELASTIC,
} from '~/util/shapes';
import { useSound } from '~/util/useSound';

(Resolver as typeof Resolver & { _restingThresh: number })._restingThresh = 0;

const engine = Engine.create({
  gravity: {
    x: 0,
    y: 0,
  },
});
const runner = Runner.create();

const SQUARE_SIZE = 25;

export const App = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const bounceSound = useSound('/audio/bounce.m4a');

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
      side: 500,
      thickness: 5,
      x: WIDTH / 2,
      y: HEIGHT / 2,
    });

    const squareBody = Bodies.rectangle(
      WIDTH / 2,
      HEIGHT / 2,
      SQUARE_SIZE,
      SQUARE_SIZE,
      {
        ...FRICTIONLESS_PERFECTLY_ELASTIC,
        label: 'square',
        render: {
          fillStyle: COLORS.BLUE,
        },
      },
    );
    const squareBody2 = Bodies.rectangle(
      WIDTH / 2 + 25,
      HEIGHT / 2,
      SQUARE_SIZE,
      SQUARE_SIZE,
      {
        ...FRICTIONLESS_PERFECTLY_ELASTIC,
        label: 'square',
        render: {
          fillStyle: COLORS.GREEN,
        },
      },
    );
    const squareBody3 = Bodies.rectangle(
      WIDTH / 2,
      HEIGHT / 2 + 25,
      SQUARE_SIZE,
      SQUARE_SIZE,
      {
        ...FRICTIONLESS_PERFECTLY_ELASTIC,
        label: 'square',
        render: {
          fillStyle: COLORS.YELLOW,
        },
      },
    );
    const squareBody4 = Bodies.rectangle(
      WIDTH / 2 + 25,
      HEIGHT / 2 + 25,
      SQUARE_SIZE,
      SQUARE_SIZE,
      {
        ...FRICTIONLESS_PERFECTLY_ELASTIC,
        label: 'square',
        render: {
          fillStyle: COLORS.ORANGE,
        },
      },
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
    Body.applyForce(squareBody, { x: 0, y: 0 }, { x: -1, y: -1 });
    Body.applyForce(squareBody2, { x: 0, y: 0 }, { x: 1, y: -1 });
    Body.applyForce(squareBody3, { x: 0, y: 0 }, { x: 1, y: 1 });
    Body.applyForce(squareBody4, { x: 0, y: 0 }, { x: -1, y: -1 });

    Render.run(render);
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  const createNewSquare = () => {
    const squareBody = Bodies.rectangle(
      WIDTH / 2,
      HEIGHT / 2,
      SQUARE_SIZE,
      SQUARE_SIZE,
      {
        ...FRICTIONLESS_PERFECTLY_ELASTIC,
        label: 'square',
        render: {
          fillStyle: getRandomColor([COLORS.BLACK, COLORS.TRANSPARENT]),
        },
      },
    );
    World.add(engine.world, squareBody);
    Body.applyForce(
      squareBody,
      { x: 0, y: 0 },
      { x: Math.random() < 0.5 ? -2 : 2, y: Math.random() < 0.5 ? -2 : 2 },
    );
  };
  const handleStart = () => {
    Runner.run(runner, engine);
    setIsRunning(true);
  };
  const handleStop = () => {
    Runner.stop(runner);
    setIsRunning(false);
  };
  return (
    <main className="container">
      <div className="controls">
        <Button
          onClick={isRunning ? handleStop : handleStart}
          isDisabled={false}
          colorScheme={isRunning ? 'red' : 'green'}
          variant="outline"
          leftIcon={isRunning ? <FaStop /> : <FaPlay />}>
          {isRunning ? 'Stop' : 'Start'}
        </Button>
      </div>
      <div
        ref={boxRef}
        style={{
          height: HEIGHT,
          width: WIDTH,
        }}>
        <canvas ref={canvasRef} />
      </div>
    </main>
  );
};
