"use client";

import { Panel, useStore, getSmoothStepPath, Position } from "@xyflow/react";
import { getNodeDimensions, getBoundsOfRects } from "@xyflow/system";
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

export default function MiniMapEdges() {
  const { nodeLookup, edges, transform, width, height } = useStore((s) => ({
    nodeLookup: s.nodeLookup as Map<string, unknown>,
    edges: s.edges,
    transform: s.transform,
    width: s.width,
    height: s.height,
  }));

  const viewBB = {
    x: -transform[0] / transform[2],
    y: -transform[1] / transform[2],
    width: width / transform[2],
    height: height / transform[2],
  };

  const box = { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity };
  let hasNodes = false;
  for (const n of nodeLookup.values()) {
    const internal = n as {
      hidden?: boolean;
      internals?: { positionAbsolute?: { x: number; y: number } };
      measured?: { width?: number; height?: number };
      width?: number;
      height?: number;
    };
    if (internal.hidden) continue;
    hasNodes = true;
    const pos = internal.internals?.positionAbsolute ?? { x: 0, y: 0 };
    const { width: w, height: h } = getNodeDimensions(internal as any);
    if (pos.x < box.x) box.x = pos.x;
    if (pos.y < box.y) box.y = pos.y;
    if (pos.x + w > box.x2) box.x2 = pos.x + w;
    if (pos.y + h > box.y2) box.y2 = pos.y + h;
  }

  const nodeBounds = hasNodes
    ? {
        x: box.x,
        y: box.y,
        width: box.x2 - box.x,
        height: box.y2 - box.y,
      }
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

  const edgePaths = edges.map((e: Edge) => {
    const sourceNode = nodeLookup.get(e.source) as any;
    const targetNode = nodeLookup.get(e.target) as any;
    if (!sourceNode || !targetNode) return null;

    const sp = getHandlePosition(e.sourceHandle);
    const tp = getHandlePosition(e.targetHandle);
    const { width: sw, height: sh } = getNodeDimensions(sourceNode);
    const { width: tw, height: th } = getNodeDimensions(targetNode);

    const sAbs = sourceNode.internals.positionAbsolute as { x: number; y: number };
    const tAbs = targetNode.internals.positionAbsolute as { x: number; y: number };

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
  });

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
        {edgePaths.map(
          (p) =>
            p && (
              <path
                key={p.id}
                d={p.d}
                stroke="#4fa3e3"
                strokeWidth={1.5}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            ),
        )}
      </svg>
    </Panel>
  );
}
