import React, { useEffect, useRef } from 'react';
import {
  Bodies,
  Body,
  Engine,
  Events,
  Render,
  Runner,
  type Vector,
  World,
} from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSound } from '~/hooks/useSound';
import { getDarkerVersionOfColor, getRainbowColor } from '~/util/color';
import {
  createHollowRectangle,
  PERFECTLY_ELASTIC_INF_INTERTIA,
} from '~/util/shapes';

interface TrailSquare {
  position: Vector;
}

const SQUARE_COLLISION_CATEGORY = 0x0001;
const WALL_COLLISION_CATEGORY = 0x0002;

const SQUARE_SIZE = 50;
const SQUARE_FORCE = 10;
const SQUARE_BORDER_COLOR = COLORS.BLACK;
const FORCE_MULTIPLIER = 0.9; // 0.1, 0.3, 0.5, 0.9

const CONTAINER_SIZE = 450;
const CONTAINER_WALL_THICKNESS = 10;

const TRAIL_MODULO = 3;
let trailCounter = 0;

const createSquare = (x: number, y: number, color: string) => {
  return Bodies.rectangle(x, y, SQUARE_SIZE, SQUARE_SIZE, {
    ...PERFECTLY_ELASTIC_INF_INTERTIA,
    collisionFilter: {
      category: SQUARE_COLLISION_CATEGORY,
      mask: WALL_COLLISION_CATEGORY,
    },
    label: 'square',
    render: {
      fillStyle: color,
      strokeStyle: getDarkerVersionOfColor(color),
    },
  });
};

export const TrailingRainbow = () => {
  const trails = useRef<TrailSquare[]>([]);
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
        background: COLORS.TRANSPARENT,
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
        wireframes: false,
      },
    });

    const squareSides = createHollowRectangle({
      additionalOptions: {
        collisionFilter: {
          category: WALL_COLLISION_CATEGORY,
          mask: SQUARE_COLLISION_CATEGORY,
        },
      },
      color: COLORS.WHITE,
      side1Length: CONTAINER_SIZE,
      side2Length: CONTAINER_SIZE,
      thickness: CONTAINER_WALL_THICKNESS,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const square = createSquare(
      CANVAS_WIDTH / 2 - CONTAINER_SIZE / 2 + SQUARE_SIZE / 2,
      CANVAS_HEIGHT / 2 - CONTAINER_SIZE / 2 + SQUARE_SIZE / 2,
      COLORS.RED,
    );

    World.add(engine.world, [...squareSides, square]);

    Body.applyForce(
      square,
      { x: 0, y: 0 },
      { x: SQUARE_FORCE * FORCE_MULTIPLIER, y: SQUARE_FORCE },
    );

    const secondaryCanvas = document.getElementById(
      'secondary-canvas',
    ) as HTMLCanvasElement;
    const ctx = secondaryCanvas?.getContext('2d');

    Events.on(render, 'afterRender', () => {
      if (!ctx) return;
      trailCounter += 1;
      if (trailCounter % TRAIL_MODULO === 0) {
        const trail = trails.current;
        trail.unshift({
          position: { ...square.position },
        });
      }
      const unpaintedTrail = trails.current.slice(0)[0];
      const trailColor = getRainbowColor(trailCounter, 0.25);
      if (unpaintedTrail) {
        const point = unpaintedTrail.position;
        ctx.fillStyle = trailColor;
        ctx.fillRect(
          point.x - SQUARE_SIZE / 2,
          point.y - SQUARE_SIZE / 2,
          SQUARE_SIZE,
          SQUARE_SIZE,
        );
        ctx.strokeStyle = SQUARE_BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          point.x - SQUARE_SIZE / 2,
          point.y - SQUARE_SIZE / 2,
          SQUARE_SIZE,
          SQUARE_SIZE,
        );
      }
      // Draw the actual square
      const position = square.position;
      render.context.fillStyle = trailColor;
      render.context.fillRect(
        position.x - SQUARE_SIZE / 2,
        position.y - SQUARE_SIZE / 2,
        SQUARE_SIZE,
        SQUARE_SIZE,
      );
      render.context.strokeStyle = SQUARE_BORDER_COLOR;
      render.context.lineWidth = 2;
      render.context.strokeRect(
        position.x - SQUARE_SIZE / 2,
        position.y - SQUARE_SIZE / 2,
        SQUARE_SIZE,
        SQUARE_SIZE,
      );
    });

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyALabel = pair.bodyA.label;
        const bodyBLabel = pair.bodyB.label;
        const key = `${bodyALabel}-${bodyBLabel}`;
        if (key.includes('square')) {
          bounceSound();
        }
      });
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
