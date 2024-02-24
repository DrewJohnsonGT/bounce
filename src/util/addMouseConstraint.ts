import {
  type Engine,
  Events,
  Mouse,
  MouseConstraint,
  type Render,
  World,
} from 'matter-js';

export const addMouseConstraint = (engine: Engine, render: Render) => {
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    constraint: {
      stiffness: 0.2,
    },
    mouse,
  });
  Events.on(mouseConstraint, 'mousedown', (event) => {
    const mousePosition = event.mouse.position;
    console.log('Mouse clicked at:', mousePosition);
  });
  World.add(engine.world, mouseConstraint);
};
