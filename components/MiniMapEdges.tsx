"use client";

import { Panel, useStore, getSmoothStepPath, Position } from "@xyflow/react";
import {
  getNodeDimensions,
  getBoundsOfRects,
  getInternalNodesBounds,
} from "@xyflow/system";
import type { Edge } from "@xyflow/react";

const ELEMENT_WIDTH = 200;
const ELEMENT_HEIGHT = 150;
const OFFSET_SCALE = 5;

function getHandlePosition(handleId: string | null | undefined): Position {
  if (!handleId) return Position.Right;
  if (handleId.includes("left")) return Position.Left;
  if (handleId.includes("right")) return Position.Right;
  if (handleId.includes("top")) return Position.Top;
  if (handleId.includes("bottom")) return Position.Bottom;
  return Position.Right;
}

function handleX(position: Position, width: number) {
  if (position === Position.Right) return width;
  if (position === Position.Left) return 0;
  return width / 2;
}

function handleY(position: Position, height: number) {
  if (position === Position.Bottom) return height;
  if (position === Position.Top) return 0;
  return height / 2;
}

type MiniMapEdgePath = { id: string; d: string };

type MiniMapState = {
  x: number;
  y: number;
  w: number;
  h: number;
  paths: MiniMapEdgePath[];
};

function rectEqual(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height
  );
}

function computeViewBox(s: any) {
  const viewBB = {
    x: -s.transform[0] / s.transform[2],
    y: -s.transform[1] / s.transform[2],
    width: s.width / s.transform[2],
    height: s.height / s.transform[2],
  };

  const nodeBounds =
    s.nodeLookup.size > 0
      ? getInternalNodesBounds(s.nodeLookup as Map<string, any>, {
          filter: (node: any) => !node.hidden,
        })
      : viewBB;

  const boundingRect = getBoundsOfRects(nodeBounds, viewBB);

  const scaledWidth = boundingRect.width / ELEMENT_WIDTH;
  const scaledHeight = boundingRect.height / ELEMENT_HEIGHT;
  const viewScale = Math.max(scaledWidth, scaledHeight, 0.0001);
  const viewWidth = viewScale * ELEMENT_WIDTH;
  const viewHeight = viewScale * ELEMENT_HEIGHT;
  const offset = OFFSET_SCALE * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const w = viewWidth + offset * 2;
  const h = viewHeight + offset * 2;

  return { x, y, w, h };
}

function computeEdgePaths(
  edges: Edge[],
  nodeLookup: Map<string, any>,
): MiniMapEdgePath[] {
  return edges
    .map((e) => {
      const sourceNode = nodeLookup.get(e.source);
      const targetNode = nodeLookup.get(e.target);
      if (!sourceNode || !targetNode) return null;

      const sp = getHandlePosition(e.sourceHandle);
      const tp = getHandlePosition(e.targetHandle);
      const { width: sw, height: sh } = getNodeDimensions(sourceNode);
      const { width: tw, height: th } = getNodeDimensions(targetNode);

      const sAbs = sourceNode.internals.positionAbsolute as {
        x: number;
        y: number;
      };
      const tAbs = targetNode.internals.positionAbsolute as {
        x: number;
        y: number;
      };

      const sourceX = sAbs.x + handleX(sp, sw);
      const sourceY = sAbs.y + handleY(sp, sh);
      const targetX = tAbs.x + handleX(tp, tw);
      const targetY = tAbs.y + handleY(tp, th);

      const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition: sp,
        targetX,
        targetY,
        targetPosition: tp,
        borderRadius: 8,
      });

      return { id: e.id, d: path };
    })
    .filter((p): p is MiniMapEdgePath => p !== null);
}

const selector = (s: any): MiniMapState => {
  const { x, y, w, h } = computeViewBox(s);
  const paths = computeEdgePaths(s.edges, s.nodeLookup as Map<string, any>);
  return { x, y, w, h, paths };
};

function areEqual(a: MiniMapState, b: MiniMapState) {
  if (a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h) return false;
  if (a.paths.length !== b.paths.length) return false;
  for (let i = 0; i < a.paths.length; i++) {
    if (a.paths[i].id !== b.paths[i].id || a.paths[i].d !== b.paths[i].d) {
      return false;
    }
  }
  return true;
}

export default function MiniMapEdges() {
  const { x, y, w, h, paths } = useStore(selector, areEqual);

  return (
    <Panel
      position="bottom-right"
      style={{
        width: ELEMENT_WIDTH,
        height: ELEMENT_HEIGHT,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`${x} ${y} ${w} ${h}`}
        style={{ overflow: "visible" }}
      >
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            stroke="#4fa3e3"
            strokeWidth={1.5}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </Panel>
  );
}
