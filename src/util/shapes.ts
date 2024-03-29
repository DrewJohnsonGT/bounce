import {
  Bodies,
  type Body,
  Composite,
  type IChamferableBodyDefinition,
  Vector,
} from 'matter-js';

export const PERFECTLY_ELASTIC_INF_INTERTIA: IChamferableBodyDefinition = {
  density: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  inertia: Infinity,
  restitution: 1,
};

export const PERFECTLY_ELASTIC: IChamferableBodyDefinition = {
  density: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  restitution: 1,
};

export const createHollowRectangle = ({
  additionalOptions = {},
  color,
  side1Length,
  side2Length,
  thickness,
  x,
  y,
}: {
  x: number;
  y: number;
  side1Length: number;
  side2Length: number;
  thickness: number;
  color: string;
  additionalOptions?: Partial<IChamferableBodyDefinition>;
}): Body[] => {
  const rectangleDefinitionConfig = {
    isStatic: true,
    label: 'static-wall',
    render: { fillStyle: color },
    ...PERFECTLY_ELASTIC_INF_INTERTIA,
    ...additionalOptions,
  };

  const offset = thickness / 2;
  const side1LengthWithThickness = side1Length + thickness * 2;
  const side2LengthWithThickness = side2Length + thickness * 2;

  const top = Bodies.rectangle(
    x,
    y - side2Length / 2 - offset,
    side1LengthWithThickness,
    thickness,
    rectangleDefinitionConfig,
  );
  const bottom = Bodies.rectangle(
    x,
    y + side2Length / 2 + offset,
    side1LengthWithThickness,
    thickness,
    rectangleDefinitionConfig,
  );
  const left = Bodies.rectangle(
    x - side1Length / 2 - offset,
    y,
    thickness,
    side2LengthWithThickness,
    rectangleDefinitionConfig,
  );
  const right = Bodies.rectangle(
    x + side1Length / 2 + offset,
    y,
    thickness,
    side2LengthWithThickness,
    rectangleDefinitionConfig,
  );

  return [top, bottom, left, right];
};

export const getRandomPositionInsideSquareContainer = ({
  containerPosX,
  containerPosY,
  containerSize,
  containerWallThickness,
  elementSize = 0,
}: {
  containerSize: number;
  containerWallThickness: number;
  elementSize?: number;
  containerPosX: number;
  containerPosY: number;
}) => {
  const effectiveHalfSize =
    containerSize / 2 - containerWallThickness - elementSize / 2;

  const minX = containerPosX - effectiveHalfSize;
  const minY = containerPosY - effectiveHalfSize;

  const x = minX + Math.random() * (2 * effectiveHalfSize);
  const y = minY + Math.random() * (2 * effectiveHalfSize);

  return { x, y };
};

export const verticesToEdges = (
  vertices: Vector[],
  options: IChamferableBodyDefinition = {},
  edgeThickness: number = 5,
  overlapExtension: number = 0.5,
) => {
  const composite = Composite.create();
  for (let i = 0; i < vertices.length; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % vertices.length];

    const edgeVector = Vector.sub(end, start);
    const length = Vector.magnitude(edgeVector) + overlapExtension * 2;
    const angle = Math.atan2(edgeVector.y, edgeVector.x);
    const midpoint = {
      x: (start.x + end.x) / 2 + (overlapExtension * Math.cos(angle)) / 2,
      y: (start.y + end.y) / 2 + (overlapExtension * Math.sin(angle)) / 2,
    };

    const edge = Bodies.rectangle(
      midpoint.x,
      midpoint.y,
      length,
      edgeThickness,
      {
        angle,
        isStatic: true,
        ...options,
      },
    );

    Composite.add(composite, edge);
  }
  return composite;
};

export const centroid = (vertices: Vector[]) => {
  const centroid = vertices.reduce(
    (acc, cur) => {
      return {
        x: acc.x + cur.x / vertices.length,
        y: acc.y + cur.y / vertices.length,
      };
    },
    { x: 0, y: 0 },
  );
  return centroid;
};

export const fillOutsideVerticesWithColor = (
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

export const fillInsideVerticesWithColor = (
  canvas: HTMLCanvasElement,
  vertices: Vector[],
  fillColor: string,
) => {
  if (!canvas || !vertices || vertices.length === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = fillColor;

  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  vertices.forEach((vertex) => {
    ctx.lineTo(vertex.x, vertex.y);
  });
  ctx.closePath();

  ctx.fill();
};

export const renderCheckeredFlagForNonUniformBody = (
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

export const createHollowCircle = ({
  additionalOptions,
  color,
  radius,
  segments,
  thickness,
  x,
  y,
}: {
  x: number;
  y: number;
  thickness: number;
  color: string;
  radius: number;
  segments: number;
  additionalOptions?: Partial<IChamferableBodyDefinition>;
}): Composite => {
  const circleParts = [];
  for (let i = 0; i < segments; i++) {
    const angle = ((2 * Math.PI) / segments) * i;
    const innerRadius = radius - thickness;
    const outerSegmentLength = (2 * Math.PI * radius) / segments;
    const posX =
      x + innerRadius * Math.cos(angle) + (thickness * Math.cos(angle)) / 2;
    const posY =
      y + innerRadius * Math.sin(angle) + (thickness * Math.sin(angle)) / 2;

    const segment = Bodies.rectangle(
      posX,
      posY,
      outerSegmentLength,
      thickness,
      {
        ...PERFECTLY_ELASTIC_INF_INTERTIA,
        ...additionalOptions,
        angle,
        isStatic: true,
        render: {
          fillStyle: color,
        },
      },
    );

    circleParts.push(segment);
  }

  return Composite.create({ bodies: circleParts });
};
