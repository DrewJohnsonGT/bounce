import React, { useEffect } from 'react';
import { Engine, Render, Runner, World } from 'matter-js';
import { SceneBox } from '~/components/SceneBox';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '~/constants';
import { useAppContext } from '~/hooks/useContext';
import { useEngine } from '~/hooks/useEngine';
import { createHollowRectangle } from '~/util/shapes';

const CONTAINER_SIZE = 500;
const CONTAINER_WALL_THICKNESS = 5;

export const Blank = () => {
  const {
    state: { isRunning },
  } = useAppContext();
  const { boxRef, canvasRef, engine, runner } = useEngine({ isRunning });

  useEffect(() => {
    // const secondaryCanvas = document.getElementById(
    //   'secondary-canvas',
    // ) as HTMLCanvasElement;
    // const ctx = secondaryCanvas?.getContext('2d');

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

    World.add(engine.world, [...squareSides]);

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
