import { CANVAS_HEIGHT, CANVAS_WIDTH } from '~/constants';

const LOGO_SIZE = 100;

interface SceneBoxProps {
  boxRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  logoOffset?: { x: number; y: number };
}

export const SceneBox = ({ boxRef, canvasRef, logoOffset }: SceneBoxProps) => {
  return (
    <div
      ref={boxRef}
      style={{
        backgroundColor: 'black',
        height: CANVAS_HEIGHT,
        position: 'relative',
        width: CANVAS_WIDTH,
      }}>
      <canvas
        id="secondary-canvas"
        height={CANVAS_HEIGHT}
        width={CANVAS_WIDTH}
        style={{
          backgroundColor: 'transparent',
          height: CANVAS_HEIGHT,
          position: 'absolute',
          width: CANVAS_WIDTH,
          zIndex: 2,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          height: CANVAS_HEIGHT,
          position: 'absolute',
          width: CANVAS_WIDTH,
          zIndex: 3,
        }}
      />
      <img
        src="/logo.png"
        alt="CubeCode Logo"
        style={{
          height: LOGO_SIZE,
          left: `calc(50% - ${LOGO_SIZE / 2}px + ${logoOffset?.x || 0}px)`,
          opacity: '0.1',
          position: 'absolute',
          top: `calc(50% - ${LOGO_SIZE / 2}px + ${logoOffset?.y || 0}px)`,
          width: LOGO_SIZE,
          zIndex: 1,
        }}
      />
    </div>
  );
};
