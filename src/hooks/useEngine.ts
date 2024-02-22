import { useEffect, useRef, useState } from 'react';
import { Engine, type IEngineDefinition, Resolver, Runner } from 'matter-js';

(Resolver as typeof Resolver & { _restingThresh: number })._restingThresh = 0;

const DEFAULT_ENGINE_OPTIONS = {
  gravity: {
    x: 0,
    y: 0,
  },
};

interface UseEngineProps {
  isRunning: boolean;
  engineOptions?: IEngineDefinition;
}

export const useEngine = ({
  engineOptions = DEFAULT_ENGINE_OPTIONS,
  isRunning,
}: UseEngineProps) => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);

  const [engine] = useState(() => {
    const engine = Engine.create(engineOptions);
    return engine;
  });
  const runner = useRef(Runner.create());

  useEffect(() => {
    if (isRunning) {
      Runner.run(runner.current, engine);
    } else {
      Runner.stop(runner.current);
    }
  }, [isRunning]);

  return {
    boxRef,
    canvasRef,
    engine,
    runner: runner.current,
  };
};
