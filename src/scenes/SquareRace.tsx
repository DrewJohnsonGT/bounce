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
import { opacity } from '~/util/color';
import { MAP_1 } from '~/util/maps';
import { centroid, PERFECTLY_ELASTIC, verticesToEdges } from '~/util/shapes';

const SQUARE_SIZE = 20;
const SQUARE_START_OFFSET = { x: -10, y: -10 };
const INITIAL_VELOCITY = 5;

const ZONE_COLLISION_CATEGORY = 0x0001;
const SQUARE_COLLISION_CATEGORY = 0x0002;

const FINISHER_LOCATIONS = [
  { x: 94.25, y: 810.5 },
  { x: 62.25, y: 850.5 },
  { x: 131.25, y: 860.5 },
  { x: 94.25, y: 900.5 },
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

const fillOutsideMap = (
  canvas: HTMLCanvasElement,
  vertices: Vector[],
  fillColor: string,
) => {
  if (!canvas || !vertices || vertices.length === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  vertices.forEach((vertex) => {
    ctx.lineTo(vertex.x, vertex.y);
  });
  ctx.closePath();

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';
};

const renderCheckeredFlagForNonUniformBody = (
  body: Body,
  context: CanvasRenderingContext2D,
) => {
  const vertices = body.vertices;

  context.save();

  context.beginPath();
  context.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    context.lineTo(vertices[i].x, vertices[i].y);
  }
  context.closePath();
  context.clip();

  const patternSize = 10;
  const bounds = body.bounds;
  for (let x = bounds.min.x; x < bounds.max.x; x += patternSize) {
    for (let y = bounds.min.y; y < bounds.max.y; y += patternSize) {
      context.fillStyle =
        (Math.floor(x / patternSize) + Math.floor(y / patternSize)) % 2 === 0
          ? 'black'
          : 'white';
      context.fillRect(x, y, patternSize, patternSize);
    }
  }

  context.restore();
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
      1,
    );

    const secondaryCanvas = document.getElementById(
      'secondary-canvas',
    ) as HTMLCanvasElement;
    fillOutsideMap(secondaryCanvas, MAP_1.edges, COLORS.GRAY);
    const img = new Image();
    img.src = 'podium.png';
    img.onload = function () {
      const ctx = secondaryCanvas.getContext('2d');
      ctx?.drawImage(img, 20, 800, 150, 150);
    };

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
      startCentroid.x - SQUARE_SIZE + SQUARE_START_OFFSET.x,
      startCentroid.y + SQUARE_SIZE / 2 + SQUARE_START_OFFSET.y,
      COLORS.BLUE,
      BodyLabel.BLUE_SQUARE,
    );

    const square2 = createSquare(
      startCentroid.x + SQUARE_SIZE * 2 + SQUARE_START_OFFSET.x,
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
      startCentroid.x + SQUARE_SIZE + SQUARE_START_OFFSET.x,
      startCentroid.y + SQUARE_SIZE / 2 + SQUARE_START_OFFSET.y,
      COLORS.ORANGE,
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
            const podiumLocation = FINISHER_LOCATIONS[finishers.current.length];
            Body.setPosition(square, podiumLocation);
            finishers.current.push(square.label);
            if (finishers.current.length === 3) {
              // Find the remaining square and move it to the podium
              const remainingSquare = squares.find(
                (s) => !finishers.current.includes(s.label),
              );
              if (remainingSquare) {
                const podiumLocation = FINISHER_LOCATIONS[3];
                remainingSquare.label = BodyLabel.STATIC_SQUARE;
                Body.setStatic(remainingSquare, true);
                Body.setPosition(remainingSquare, podiumLocation);
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
