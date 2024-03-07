import React, { useEffect } from 'react';
import { Bodies, Body, Engine, Events, Render, Runner, World } from 'matter-js';
import SOUNDS from '~/assets/soundList.json';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { useSoundEffect } from '~/hooks/useSoundEffect';
import { getDarkerVersionOfColor } from '~/util/color';
import {
  createHollowRectangle,
  PERFECTLY_ELASTIC_INF_INTERTIA,
} from '~/util/shapes';

enum BallTeam {
  RED = 'RED',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  PINK = 'PINK',
  DARK_PINK = 'DARK_PINK',
}

const CONTAINER_SIZE = 500;
const CONTAINER_WALL_THICKNESS = 10;

const BALL_SIZE = 15;
const INITIAL_BALL_VELOCITY = 1;
const BALL_SAME_TEAM_VELOCITY_MULTIPLIER = 1.1;

const MAX_ARMOR = 3;
const MIN_ARMOR_COLOR = COLORS.RED;
const MAX_ARMOR_COLOR = COLORS.WHITE;

const TEAMS = [BallTeam.GREEN, BallTeam.RED];

const lerpColor = (color1: string, color2: string, factor: number): string => {
  const hex = (color: string) => parseInt(color.slice(1), 16);
  const r1 = hex(color1) >> 16;
  const g1 = (hex(color1) >> 8) & 0xff;
  const b1 = hex(color1) & 0xff;

  const r2 = hex(color2) >> 16;
  const g2 = (hex(color2) >> 8) & 0xff;
  const b2 = hex(color2) & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const getColorBasedOnArmor = (armor: number): string => {
  if (armor <= 0 || armor >= MAX_ARMOR) return MAX_ARMOR_COLOR;
  const factor = armor / MAX_ARMOR;
  return lerpColor(MIN_ARMOR_COLOR, MAX_ARMOR_COLOR, factor);
};

const createBall = (x: number, y: number, ballTeam: BallTeam) => {
  return Bodies.circle(x, y, BALL_SIZE, {
    ...PERFECTLY_ELASTIC_INF_INTERTIA,
    label: `${ballTeam}-ball`,
    render: {
      fillStyle: COLORS[ballTeam],
      lineWidth: 4,
      strokeStyle: getDarkerVersionOfColor(COLORS[ballTeam]),
    },
  });
};

const ballArmor: Record<string, number> = {};

export const BallBattle = () => {
  const {
    state: { isRunning, sound },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({ isRunning });

  const playCollisionSound = useSoundEffect(sound, isRunning);
  const playBallEnemyCollisionSound = useSoundEffect(SOUNDS[2], isRunning);
  const playBallTeamCollisionSound = useSoundEffect(SOUNDS[4], isRunning);
  const playBallDestroySound = useSoundEffect(SOUNDS[3], isRunning);

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
      color: COLORS.DARKER_ORANGE,
      side1Length: CONTAINER_SIZE,
      side2Length: CONTAINER_SIZE,
      thickness: CONTAINER_WALL_THICKNESS,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    });

    const team1Balls = [
      createBall(110, 300, TEAMS[0]),
      createBall(210, 300, TEAMS[0]),
      createBall(310, 300, TEAMS[0]),
      createBall(410, 300, TEAMS[0]),
    ];

    const team2Balls = [
      createBall(110, 650, TEAMS[1]),
      createBall(210, 650, TEAMS[1]),
      createBall(310, 650, TEAMS[1]),
      createBall(410, 650, TEAMS[1]),
    ];

    const teams = [team1Balls, team2Balls];

    World.add(engine.world, [...squareSides, ...team1Balls, ...team2Balls]);

    const allBalls = [...team1Balls, ...team2Balls];

    allBalls.forEach((ball) => {
      ballArmor[ball.id] = MAX_ARMOR;
      Body.setVelocity(ball, {
        x: INITIAL_BALL_VELOCITY * Math.random(),
        y: INITIAL_BALL_VELOCITY * Math.random(),
      });
    });

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const ballA = pair.bodyA;
        const ballB = pair.bodyB;
        if (ballA.label.includes('ball') && ballB.label.includes('ball')) {
          if (ballA.label !== ballB.label) {
            if (ballA.speed > ballB.speed) {
              ballArmor[ballB.id] -= 1;
              playBallEnemyCollisionSound();
            }
            if (ballA.speed < ballB.speed) {
              ballArmor[ballA.id] -= 1;
              playBallEnemyCollisionSound();
            }
            if (ballA.speed === ballB.speed) {
              ballArmor[ballA.id] -= 1;
              ballArmor[ballB.id] -= 1;
              playBallEnemyCollisionSound();
            }
            if (ballArmor[ballA.id] <= 0) {
              World.remove(engine.world, ballA);
              playBallDestroySound();
            }
            if (ballArmor[ballB.id] <= 0) {
              World.remove(engine.world, ballB);
              playBallDestroySound();
            }
            return;
          }
          if (ballA.label === ballB.label) {
            Body.setVelocity(ballA, {
              x: ballA.velocity.x * BALL_SAME_TEAM_VELOCITY_MULTIPLIER,
              y: ballA.velocity.y * BALL_SAME_TEAM_VELOCITY_MULTIPLIER,
            });
            Body.setVelocity(ballB, {
              x: ballB.velocity.x * BALL_SAME_TEAM_VELOCITY_MULTIPLIER,
              y: ballB.velocity.y * BALL_SAME_TEAM_VELOCITY_MULTIPLIER,
            });
            playBallTeamCollisionSound();
            return;
          }
        }
        playCollisionSound();
      });
    });

    Events.on(render, 'afterRender', (render) => {
      const canvas = render.source.canvas;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      allBalls.forEach((ball) => {
        const position = ball.position;
        ctx.fillStyle = getColorBasedOnArmor(ballArmor[ball.id] || 0);
        ctx.font = '800 20px Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(
          `${ballArmor[ball.id] || ''}`,
          position.x - BALL_SIZE / 2.75,
          position.y + BALL_SIZE / 1.8,
        );
        ctx.fillText(
          `${ballArmor[ball.id] || ''}`,
          position.x - BALL_SIZE / 2.75,
          position.y + BALL_SIZE / 1.8,
        );
      });
      ctx.font = '800 30px Arial';
      // Do the above but in a loop
      teams.forEach((team, i) => {
        const teamColor = COLORS[TEAMS[i]];
        const teamBallsRemaining = team.reduce(
          (acc, ball) => acc + (ballArmor[ball.id] || 0),
          0,
        );
        ctx.fillStyle = teamColor;
        ctx.fillText(
          `${teamBallsRemaining}`,
          CANVAS_WIDTH / 2 + (i === 0 ? -250 : 25),
          200,
        );
        // Draw teamBallsRemaining smaller balls to represent the balls remaining
        for (let j = 0; j < teamBallsRemaining; j++) {
          ctx.beginPath();
          ctx.arc(
            CANVAS_WIDTH / 2 + (i === 0 ? -250 : 25) + j * 10,
            210,
            4,
            0,
            2 * Math.PI,
          );
          ctx.fill();
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
