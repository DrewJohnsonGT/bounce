import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useMidiTrack } from '~/hooks/useMidiTrack';
import {
  createHollowCircle,
  PERFECTLY_ELASTIC_INF_INTERTIA,
} from '~/util/shapes';

const CONTAINER_SIZE = 300;
const CONTAINER_WALL_THICKNESS = 100;

const BALL_SIZE = 30;
const INITIAL_VELOCITY = 2;
const BALL_SCALE_FACTOR = 1.02;
const TRAIL_MODULO = 2;

let justCollided = false;
let trailCounter = 0;

export const FillCircle = () => {
  const {
    state: { isRunning, midi },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({
    engineOptions: {
      gravity: {
        x: 0,
        y: 0.01,
      },
    },
    isRunning,
  });

  const { togglePlay } = useMidiTrack(midi);

  useEffect(() => {
    const secondaryCanvas = document.getElementById(
      'secondary-canvas',
    ) as HTMLCanvasElement;
    const ctx = secondaryCanvas?.getContext('2d');

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

    const circularSides = createHollowCircle({
      additionalOptions: {
        label: 'side',
      },
      color: COLORS.BLACK,
      radius: CONTAINER_SIZE,
      segments: 720,
      thickness: CONTAINER_WALL_THICKNESS,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const backgroundColorCircle = Bodies.circle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CONTAINER_SIZE - 50,
      {
        collisionFilter: {
          mask: 0,
        },
        isStatic: true,
        label: 'background',
        render: {
          fillStyle: COLORS.TRANSPARENT,
        },
      },
    );
    if (ctx) {
      ctx.fillStyle = COLORS.WHITE;
      ctx.beginPath();
      ctx.arc(
        backgroundColorCircle.position.x,
        backgroundColorCircle.position.y,
        CONTAINER_SIZE - 55,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      ctx.closePath();
    }

    const bouncingBall = Bodies.circle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      BALL_SIZE,
      {
        ...PERFECTLY_ELASTIC_INF_INTERTIA,
        label: 'ball',
        render: {
          fillStyle: COLORS.TRANSPARENT,
          lineWidth: 4,
          strokeStyle: COLORS.WHITE,
        },
      },
    );

    World.add(engine.world, [
      circularSides,
      backgroundColorCircle,
      bouncingBall,
    ]);

    Body.setVelocity(bouncingBall, {
      x: INITIAL_VELOCITY,
      y: INITIAL_VELOCITY,
    });

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (justCollided) return;

        togglePlay();
        const ballBody = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
        Body.scale(
          ballBody,
          BALL_SCALE_FACTOR,
          BALL_SCALE_FACTOR,
          ballBody.position,
        );
        justCollided = true;
        setTimeout(() => {
          justCollided = false;
        }, 100);
      });
    });

    Events.on(render, 'afterRender', () => {
      if (!ctx) return;
      trailCounter += 1;
      if (trailCounter % TRAIL_MODULO === 0) return;

      const position = bouncingBall.position;
      const currentBallSize = bouncingBall.circleRadius;
      ctx.fillStyle = COLORS.BLACK;
      ctx.beginPath();
      ctx.arc(
        position.x,
        position.y,
        currentBallSize || BALL_SIZE,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      ctx.closePath();
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
