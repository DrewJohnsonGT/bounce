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
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, EMOJIS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSound } from '~/hooks/useSound';
import { opacity } from '~/util/color';
import { MAP_1 } from '~/util/maps';
import {
  centroid,
  fillOutsideVerticesWithColor,
  PERFECTLY_ELASTIC,
  renderCheckeredFlagForNonUniformBody,
  verticesToEdges,
} from '~/util/shapes';

const SQUARE_SIZE = 20;
const SQUARE_START_OFFSET = { x: -10, y: -10 };
const INITIAL_VELOCITY = 5;

const ZONE_COLLISION_CATEGORY = 0x0001;
const SQUARE_COLLISION_CATEGORY = 0x0002;

const FINISHING_SPOTS = [
  {
    emojis: [EMOJIS.CROWN, EMOJIS.GOLD_MEDAL],
    location: { x: 124.75, y: 796.5 },
  },
  {
    emojis: [EMOJIS.PARTY, EMOJIS.SILVER_MEDAL],
    location: { x: 92.75, y: 846.5 },
  },
  {
    emojis: [EMOJIS.HAPPY, EMOJIS.BRONZE_MEDAL],
    location: { x: 173.75, y: 857.5 },
  },
  {
    emojis: [EMOJIS.SAD],
    location: { x: 125.75, y: 924.5 },
  },
];

enum BodyLabel {
  SQUARE = 'square',
  STATIC_SQUARE = 'static-square',
  END_ZONE = 'end-zone',
  START_ZONE = 'start-zone',
  WALL = 'wall',
  RED_SQUARE = 'red-square',
  GREEN_SQUARE = 'green-square',
  BLUE_SQUARE = 'blue-square',
  ORANGE_SQUARE = 'orange-square',
}

const drawEmojiToCanvas = (
  canvas: HTMLCanvasElement,
  emoji: string,
  x: number,
  y: number,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.font = '20px Arial';
  ctx.fillText(emoji, x, y);
};

const drawFinisherEmojis = (
  canvas: HTMLCanvasElement,
  emojis: string[],
  position: Vector,
) => {
  const [x, y] = [position.x - 12, position.y - 12];
  emojis.forEach((emoji, index) => {
    drawEmojiToCanvas(canvas, emoji, x + index * 12, y);
  });
};

const drawPodium = (canvas: HTMLCanvasElement) => {
  const img = new Image();
  img.src = 'podium.png';
  img.onload = function () {
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 40, 780, 175, 175);
  };
};

const createSquare = (
  x: number,
  y: number,
  color: string,
  label = BodyLabel.SQUARE,
) => {
  return Bodies.rectangle(x, y, SQUARE_SIZE, SQUARE_SIZE, {
    ...PERFECTLY_ELASTIC,
    collisionFilter: {
      category: SQUARE_COLLISION_CATEGORY,
      mask: ZONE_COLLISION_CATEGORY | SQUARE_COLLISION_CATEGORY,
    },
    label,
    render: {
      fillStyle: color,
    },
  });
};

export const SquareRace = () => {
  const {
    state: { isRunning, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({
    engineOptions: {
      gravity: { x: 0, y: 0.01 },
    },
    isRunning,
  });
  const finishers = useRef<string[]>([]);
  const bounceSound = useSound(sound, 10);

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

    const bounds = verticesToEdges(
      MAP_1.edges,
      {
        label: BodyLabel.WALL,
        render: {
          fillStyle: COLORS.WHITE,
          strokeStyle: COLORS.WHITE,
        },
      },
      5,
      1.25,
    );

    const secondaryCanvas = document.getElementById(
      'secondary-canvas',
    ) as HTMLCanvasElement;

    fillOutsideVerticesWithColor(secondaryCanvas, MAP_1.edges, COLORS.GRAY);
    drawPodium(secondaryCanvas);

    const startCentroid = centroid(MAP_1.start);
    const startZone = Bodies.fromVertices(
      startCentroid.x,
      startCentroid.y,
      [MAP_1.start],
      {
        collisionFilter: {
          category: ZONE_COLLISION_CATEGORY,
          mask: 0x00000000,
        },
        isStatic: true,
        label: BodyLabel.START_ZONE,
        render: {
          fillStyle: opacity(COLORS.GREEN, 0.5),
        },
      },
    );

    const endCentroid = centroid(MAP_1.end);
    const endZone = Bodies.fromVertices(
      endCentroid.x,
      endCentroid.y,
      [MAP_1.end],
      {
        collisionFilter: {
          category: ZONE_COLLISION_CATEGORY,
          mask: SQUARE_COLLISION_CATEGORY,
        },
        isSensor: true,
        isStatic: true,
        label: BodyLabel.END_ZONE,
        render: {
          fillStyle: opacity(COLORS.WHITE, 0.25),
        },
      },
    );

    const square1 = createSquare(
      startCentroid.x - SQUARE_SIZE + SQUARE_START_OFFSET.x - 2.5,
      startCentroid.y + SQUARE_SIZE / 2 + SQUARE_START_OFFSET.y,
      COLORS.BLUE,
      BodyLabel.BLUE_SQUARE,
    );

    const square2 = createSquare(
      startCentroid.x + SQUARE_SIZE * 2 + SQUARE_START_OFFSET.x + 5,
      startCentroid.y + SQUARE_SIZE / 2 + SQUARE_START_OFFSET.y,
      COLORS.GREEN,
      BodyLabel.GREEN_SQUARE,
    );

    const square3 = createSquare(
      startCentroid.x + SQUARE_START_OFFSET.x,
      startCentroid.y + SQUARE_SIZE / 2 + SQUARE_START_OFFSET.y,
      COLORS.RED,
      BodyLabel.RED_SQUARE,
    );

    const square4 = createSquare(
      startCentroid.x + SQUARE_SIZE + SQUARE_START_OFFSET.x + 2.5,
      startCentroid.y + SQUARE_SIZE / 2 + SQUARE_START_OFFSET.y,
      COLORS.DARKER_ORANGE,
      BodyLabel.ORANGE_SQUARE,
    );

    const squares = [square1, square2, square3, square4];

    World.add(engine.world, [bounds, startZone, endZone, ...squares]);

    squares.forEach((square) => {
      Body.setVelocity(square, {
        x: Math.random() * INITIAL_VELOCITY,
        y: Math.random() * INITIAL_VELOCITY,
      });
    });

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyALabel = pair.bodyA.label;
        const bodyBLabel = pair.bodyB.label;
        const key = `${bodyALabel}-${bodyBLabel}`;
        if (key.includes(BodyLabel.SQUARE)) {
          bounceSound();
        }
        if (key.includes(BodyLabel.END_ZONE)) {
          const square = bodyALabel.includes(BodyLabel.SQUARE)
            ? pair.bodyA
            : pair.bodyB;
          if (square.label.includes('square')) {
            Body.setStatic(square, true);
            square.label = BodyLabel.STATIC_SQUARE;
            // Add to finishsers and move to podium location
            const finisherSpot = FINISHING_SPOTS[finishers.current.length];
            const podiumLocation = finisherSpot.location;
            Body.setPosition(square, podiumLocation);
            finishers.current.push(square.label);
            drawFinisherEmojis(
              secondaryCanvas,
              finisherSpot.emojis,
              podiumLocation,
            );
            if (finishers.current.length === 3) {
              // Find the remaining square and move it to the podium
              const remainingSquare = squares.find(
                (s) => !finishers.current.includes(s.label),
              );
              if (remainingSquare) {
                const finalFinisherSpot = FINISHING_SPOTS[3];
                const podiumLocation = finalFinisherSpot.location;
                remainingSquare.label = BodyLabel.STATIC_SQUARE;
                Body.setStatic(remainingSquare, true);
                Body.setPosition(remainingSquare, podiumLocation);
                drawFinisherEmojis(
                  secondaryCanvas,
                  finalFinisherSpot.emojis,
                  podiumLocation,
                );
              }
            }
          }
        }
      });
    });

    Render.run(render);

    renderCheckeredFlagForNonUniformBody(
      endZone,
      secondaryCanvas.getContext('2d') as CanvasRenderingContext2D,
    );
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return <SceneBox boxRef={boxRef} canvasRef={canvasRef} />;
};
