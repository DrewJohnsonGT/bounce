import { CANVAS_HEIGHT, CANVAS_WIDTH } from '~/constants';
import styles from './SceneBox.module.css';

const LOGO_SIZE = 100;

interface SceneBoxProps {
  boxRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  logoOffset?: { x: number; y: number };
}

export const SceneBox = ({ boxRef, canvasRef, logoOffset }: SceneBoxProps) => {
  return (
    <div
      className={styles.box}
      ref={boxRef}
      style={{
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
      }}>
      <canvas ref={canvasRef} />
      <img
        src="/logo.png"
        alt="CubeCode Logo"
        className={styles.logo}
        style={{
          height: LOGO_SIZE,
          left: `calc(50% - ${LOGO_SIZE / 2}px + ${logoOffset?.x || 0}px)`,
          top: `calc(50% - ${LOGO_SIZE / 2}px + ${logoOffset?.y || 0}px)`,
          width: LOGO_SIZE,
        }}
      />
    </div>
  );
};
