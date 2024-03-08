/* eslint-disable max-lines */
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
import { MAPS } from '~/assets/maps';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, EMOJIS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSoundEffect } from '~/hooks/useSoundEffect';
import { opacity } from '~/util/color';
import {
  centroid,
  fillInsideVerticesWithColor,
  fillOutsideVerticesWithColor,
  PERFECTLY_ELASTIC,
  renderCheckeredFlagForNonUniformBody,
  verticesToEdges,
} from '~/util/shapes';

const SQUARE_SIZE = 16;
const MIN_SQUARE_SPACING = 2;
const INITIAL_VELOCITY = 2;

const EDGE_THICKNESS = 5;

const MAP_BACKGROUND_COLOR = COLORS.LIGHT_BLUE;
const OBSTACLE_COLOR = COLORS.LIGHT_BROWN;
const BORDER_COLOR = COLORS.GRAY;
const OBSTACLE_BORDER_COLOR = COLORS.GRAY;

const ZONE_COLLISION_CATEGORY = 0x0001;
const SQUARE_COLLISION_CATEGORY = 0x0002;

const GRAVITY = {
  x: 0,
  y: 0.001,
};

const FINISHING_SPOTS = [
  {
    emojis: [EMOJIS.CROWN, EMOJIS.GOLD_MEDAL],
    locationOffset: { x: 0.464, y: 0.036 },
  },
  {
    emojis: [EMOJIS.PARTY, EMOJIS.SILVER_MEDAL],
    locationOffset: { x: 0.25, y: 0.321 },
  },
  {
    emojis: [EMOJIS.HAPPY, EMOJIS.BRONZE_MEDAL],
    locationOffset: { x: 0.679, y: 0.357 },
  },
  {
    emojis: [EMOJIS.SAD],
    locationOffset: { x: 0.5, y: 0.786 },
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
  OBSTACLE = 'obstacle',
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
  location: Vector,
) => {
  emojis.forEach((emoji, index) => {
    drawEmojiToCanvas(
      canvas,
      emoji,
      location.x + index * 12 + 10,
      location.y + 10,
    );
  });
};

const drawPodium = (
  canvas: HTMLCanvasElement,
  podiumConfiguration: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
) => {
  const img = new Image();
  img.src = 'podium.png';
  img.onload = function () {
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(
      img,
      podiumConfiguration.x,
      podiumConfiguration.y,
      podiumConfiguration.width,
      podiumConfiguration.height,
    );
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

const getStartingPointsForSquares = (
  zone: Matter.Body,
  numberOfSquares: number,
): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = [];
  const zoneBounds = zone.bounds;
  const usableWidth = zoneBounds.max.x - zoneBounds.min.x - SQUARE_SIZE;
  const usableHeight = zoneBounds.max.y - zoneBounds.min.y - SQUARE_SIZE;

  const gridCellSize = SQUARE_SIZE + MIN_SQUARE_SPACING;

  const cols = Math.floor(usableWidth / gridCellSize);
  const rows = Math.floor(usableHeight / gridCellSize);

  const offsetX =
    (zoneBounds.max.x -
      zoneBounds.min.x -
      (cols * gridCellSize - MIN_SQUARE_SPACING)) /
    2;
  const offsetY =
    (zoneBounds.max.y -
      zoneBounds.min.y -
      (rows * gridCellSize - MIN_SQUARE_SPACING)) /
    2;

  let placedSquares = 0;
  for (let i = 0; i < cols && placedSquares < numberOfSquares; i++) {
    for (let j = 0; j < rows && placedSquares < numberOfSquares; j++) {
      const posX = zoneBounds.min.x + offsetX + i * gridCellSize;
      const posY = zoneBounds.min.y + offsetY + j * gridCellSize;

      positions.push({ x: posX + SQUARE_SIZE / 2, y: posY + SQUARE_SIZE / 2 });
      placedSquares++;
      if (placedSquares >= numberOfSquares) break;
    }
  }

  return positions;
};

export const SquareRace = () => {
  const {
    state: { isRunning, selectedMap, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({
    engineOptions: {
      gravity: GRAVITY,
    },
    isRunning,
  });
  const map = MAPS[selectedMap as keyof typeof MAPS];
  const finishers = useRef<string[]>([]);
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

    const bounds = verticesToEdges(
      map.edges,
      {
        label: BodyLabel.WALL,
        render: {
          fillStyle: BORDER_COLOR,
          strokeStyle: BORDER_COLOR,
        },
      },
      EDGE_THICKNESS,
      1.25,
    );

    const secondaryCanvas = document.getElementById(
      'secondary-canvas',
    ) as HTMLCanvasElement;

    fillOutsideVerticesWithColor(
      secondaryCanvas,
      map.edges,
      MAP_BACKGROUND_COLOR,
    );
    drawPodium(secondaryCanvas, map.podium);

    const startCentroid = centroid(map.start);
    const startZone = Bodies.fromVertices(
      startCentroid.x,
      startCentroid.y,
      [map.start],
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

    const startPositions = getStartingPointsForSquares(startZone, 4);
    const endCentroid = centroid(map.end);
    const endZone = Bodies.fromVertices(
      endCentroid.x,
      endCentroid.y,
      [map.end],
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

    const obstacles = map.obstacles.map((obstacle) => {
      fillInsideVerticesWithColor(secondaryCanvas, obstacle, OBSTACLE_COLOR);
      return verticesToEdges(
        obstacle,
        {
          isStatic: true,
          label: BodyLabel.OBSTACLE,
          render: {
            fillStyle: OBSTACLE_BORDER_COLOR,
          },
        },
        EDGE_THICKNESS,
        1,
      );
    });

    const square1 = createSquare(
      startPositions[0].x,
      startPositions[0].y,
      COLORS.BLUE,
      BodyLabel.BLUE_SQUARE,
    );

    const square2 = createSquare(
      startPositions[1].x,
      startPositions[1].y,
      COLORS.GREEN,
      BodyLabel.GREEN_SQUARE,
    );

    const square3 = createSquare(
      startPositions[2].x,
      startPositions[2].y,
      COLORS.RED,
      BodyLabel.RED_SQUARE,
    );

    const square4 = createSquare(
      startPositions[3].x,
      startPositions[3].y,
      COLORS.DARKER_ORANGE,
      BodyLabel.ORANGE_SQUARE,
    );

    const squares = [square1, square2, square3, square4];

    World.add(engine.world, [
      bounds,
      startZone,
      endZone,
      ...squares,
      ...obstacles,
    ]);

    squares.forEach((square) => {
      Body.setVelocity(square, {
        x: Math.random() * INITIAL_VELOCITY,
        y: Math.random() * INITIAL_VELOCITY,
      });
    });

    const onSquareFinish = (square: Matter.Body) => {
      Body.setStatic(square, true);
      square.label = BodyLabel.STATIC_SQUARE;
      // Add to finishsers and move to podium location
      const finisherSpot = FINISHING_SPOTS[finishers.current.length];
      const emojiPodiumOffset = finisherSpot.locationOffset;
      const emojiLocation = {
        x: map.podium.x + emojiPodiumOffset.x * map.podium.width,
        y: map.podium.y + emojiPodiumOffset.y * map.podium.height,
      };
      Body.setPosition(square, emojiLocation);
      finishers.current.push(square.label);
      drawFinisherEmojis(secondaryCanvas, finisherSpot.emojis, emojiLocation);
    };

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
            onSquareFinish(square);
            if (finishers.current.length === FINISHING_SPOTS.length - 1) {
              // Find the remaining square and move it to the podium
              const remainingSquare = squares.find(
                (s) => !finishers.current.includes(s.label),
              );
              if (remainingSquare) {
                onSquareFinish(remainingSquare);
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
  }, [map]);

  return (
    <SceneBox
      boxRef={boxRef}
      canvasRef={canvasRef}
      logoOffset={{
        x: -100,
        y: -50,
      }}
    />
  );
};
