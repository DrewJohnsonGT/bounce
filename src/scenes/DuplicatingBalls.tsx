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
  PERFECTLY_ELASTIC_INF_INTERTIA,
} from '~/util/shapes';

const BALL_SIZE = 6;
const BALL_FORCE = 0.05;

const CONTAINER_SIZE = 450;
const CONTAINER_WALL_THICKNESS = 10;

const INITIAL_VELOCITY = 0.5;
const BALL_LABEL = 'ball';

const createBall = (x: number, y: number, color: string) => {
  return Bodies.circle(x, y, BALL_SIZE, {
    ...PERFECTLY_ELASTIC_INF_INTERTIA,
    label: BALL_LABEL,
    render: {
      fillStyle: color,
    },
  });
};

export const DuplicatingBalls = () => {
  const {
    state: { isRunning, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({ isRunning });

  const bounceSound = useSoundEffect(sound, isRunning);
  const newBallSound = useSoundEffect('bass-boo.m4a', isRunning);

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

    const ball1 = createBall(
      CANVAS_WIDTH / 2 - BALL_SIZE,
      CANVAS_HEIGHT / 2 - BALL_SIZE,
      COLORS.BLUE,
    );
    const ball2 = createBall(
      CANVAS_WIDTH / 2 + BALL_SIZE,
      CANVAS_HEIGHT / 2 - BALL_SIZE,
      COLORS.GREEN,
    );
    const ball3 = createBall(
      CANVAS_WIDTH / 2 - BALL_SIZE,
      CANVAS_HEIGHT / 2 + BALL_SIZE,
      COLORS.RED,
    );
    const ball4 = createBall(
      CANVAS_WIDTH / 2 + BALL_SIZE,
      CANVAS_HEIGHT / 2 + BALL_SIZE,
      COLORS.ORANGE,
    );
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyALabel = pair.bodyA.label;
        const bodyBLabel = pair.bodyB.label;

        if (bodyALabel === BALL_LABEL && bodyBLabel === BALL_LABEL) {
          newBallSound();
          createNewBall();
        } else {
          bounceSound();
        }
      });
    });

    World.add(engine.world, [...squareSides, ball1, ball2, ball3, ball4]);
    Body.setVelocity(ball4, { x: INITIAL_VELOCITY, y: INITIAL_VELOCITY });
    Body.setVelocity(ball3, {
      x: -INITIAL_VELOCITY,
      y: INITIAL_VELOCITY,
    });
    Body.setVelocity(ball1, {
      x: -INITIAL_VELOCITY,
      y: -INITIAL_VELOCITY,
    });
    Body.setVelocity(ball2, {
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

  const createNewBall = () => {
    const color = generateRandomColor();
    const position = getRandomPositionInsideSquareContainer({
      containerPosX: CANVAS_WIDTH / 2,
      containerPosY: CANVAS_HEIGHT / 2,
      containerSize: CONTAINER_SIZE,
      containerWallThickness: CONTAINER_WALL_THICKNESS,
      elementSize: BALL_SIZE,
    });
    const squareBody = createBall(position.x, position.y, color);

    World.add(engine.world, squareBody);
    Body.applyForce(
      squareBody,
      { x: 0, y: 0 },
      {
        x: Math.random() < 0.5 ? -BALL_FORCE : BALL_FORCE,
        y: Math.random() < 0.5 ? -BALL_FORCE : BALL_FORCE,
      },
    );
  };

  return <SceneBox boxRef={boxRef} canvasRef={canvasRef} />;
};
