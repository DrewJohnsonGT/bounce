import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSound } from '~/hooks/useSound';
import {
  createHollowRectangle,
  PERFECTLY_ELASTIC_INF_INTERTIA,
} from '~/util/shapes';

const CONTAINER_WALL_THICKNESS = 5;
const LETTER_SIZE = 40;
const INITIAL_VELOCITY = 0.5;

const LETTERS = [
  'F',
  'Z',
  'A',
  'A',
  'A',
  'J',
  'N',
  'S',
  'I',
  'V',
  'O',
  'P',
  'G',
  'U',
  'Q',
  'E',
  'S',
  'T',
  'C',
  'W',
  'T',
  'Y',
  'M',
  'D',
  'O',
  'N',
  'I',
  'H',
  'K',
  'E',
  'X',
  'S',
  'R',
  'E',
  'O',
  'N',
  'B',
  'I',
  'L',
  'T',
];

export const Letters = () => {
  const {
    state: { isRunning, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({
    engineOptions: {
      gravity: { x: 0, y: 0.01 },
    },
    isRunning,
  });
  const bounceSound = useSound(sound);

  useEffect(() => {
    const render = Render.create({
      canvas: canvasRef.current || undefined,
      element: boxRef.current || undefined,
      engine,
      options: {
        background: COLORS.OFF_WHITE,
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
        wireframes: false,
      },
    });

    const squareSides = createHollowRectangle({
      color: COLORS.BLACK,
      side1Length: CANVAS_WIDTH - CONTAINER_WALL_THICKNESS,
      side2Length: CANVAS_HEIGHT - CONTAINER_WALL_THICKNESS,
      thickness: CONTAINER_WALL_THICKNESS,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const letterBodies = LETTERS.map((letter, index) => {
      const x = (index % 5) * LETTER_SIZE + 50;
      const y = Math.floor(index / 5) * LETTER_SIZE + 50;
      return Bodies.rectangle(x, y, LETTER_SIZE, LETTER_SIZE, {
        ...PERFECTLY_ELASTIC_INF_INTERTIA,
        label: letter,
        render: {
          fillStyle: COLORS.TRANSPARENT,
        },
      });
    });

    World.add(engine.world, [...squareSides, ...letterBodies]);

    const letterImages = LETTERS.reduce<Record<string, HTMLImageElement>>(
      (acc, letter) => {
        const img = new Image(LETTER_SIZE, LETTER_SIZE);
        img.src = `/letters/${letter}.svg`;
        acc[letter] = img;
        return acc;
      },
      {},
    );

    letterBodies.forEach((body) => {
      Body.setVelocity(body, {
        x: Math.random() * INITIAL_VELOCITY,
        y: Math.random() * INITIAL_VELOCITY,
      });
    });

    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      letterBodies.forEach((body) => {
        const img = letterImages[body.label];
        const x = body.position.x;
        const y = body.position.y;
        const angle = body.angle;
        const width = img.width;
        const height = img.height;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(
          img,
          -width / 2 - 10,
          -height / 2 - 10,
          width + 20,
          height + 20,
        );
        ctx.restore();
      });
    });

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(() => {
        bounceSound();
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
