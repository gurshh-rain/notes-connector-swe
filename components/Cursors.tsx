"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@xyflow/react";
import type { Awareness } from "y-protocols/awareness";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function Cursors({ awareness }: { awareness: Awareness | null }) {
  const [states, setStates] = useState<Map<number, unknown>>(new Map());
  const transform = useStore((s) => s.transform);

  useEffect(() => {
    if (!awareness) return;

    const update = () => {
      const next = new Map<number, unknown>();
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) return;
        next.set(clientId, state);
      });
      setStates(next);
    };

    update();
    awareness.on("change", update);
    return () => awareness.off("change", update);
  }, [awareness]);

  const cursors = useMemo(() => {
    const items: { x: number; y: number; color: string; name: string }[] = [];
    states.forEach((state, clientId) => {
      const s = state as Record<string, unknown> | undefined;
      const cursor = s?.cursor as { x: number; y: number } | undefined;
      if (!cursor) return;
      const color = COLORS[clientId % COLORS.length];
      const name = `User ${clientId}`;
      items.push({ x: cursor.x, y: cursor.y, color, name });
    });
    return items;
  }, [states]);

  if (!awareness || cursors.length === 0) return null;

  const [tx, ty, zoom] = transform;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {cursors.map((c, i) => {
        const sx = c.x * zoom + tx;
        const sy = c.y * zoom + ty;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sx,
              top: sy,
              transform: "translate(-50%, -50%)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={c.color}
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
            >
              <path d="M3 3l7.2 18.4 2.1-7.8L20 11.5 3 3z" />
            </svg>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: 14,
                whiteSpace: "nowrap",
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 4,
                background: c.color,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
