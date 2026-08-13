"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MindMap, MindMapNode, MindMapEdge, StickerColor } from "./types";

const STORAGE_KEY = "connector:maps:v1";
const ACTIVE_KEY = "connector:active:v1";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

const sampleNote = (title: string) =>
  `<p>Notes for <strong>${title || "this node"}</strong> live here. Use the toolbar above for headings, lists, quotes and code.</p>`;

const defaultMap = (): MindMap => {
  const centerId = uid();
  const leftId = uid();
  const rightId = uid();
  const deepId = uid();
  const now = Date.now();
  return {
    id: uid(),
    title: "My first mind map",
    emoji: "🧭",
    createdAt: now,
    updatedAt: now,
    nodes: [
      {
        id: centerId,
        title: "Start here",
        note: sampleNote("Start here"),
        color: "purple",
        tags: [],
    position: { x: 0, y: 0 },
      },
      {
        id: leftId,
        title: "An idea",
        note: sampleNote("An idea"),
        color: "sky",
        tags: [],
    position: { x: -280, y: 120 },
      },
      {
        id: rightId,
        title: "Another branch",
        note: sampleNote("Another branch"),
        color: "pink",
        tags: [],
    position: { x: 280, y: 120 },
      },
      {
        id: deepId,
        title: "A sub-idea",
        note: sampleNote("A sub-idea"),
        color: "teal",
        tags: [],
    position: { x: 520, y: 260 },
      },
    ],
    edges: [
      { id: uid(), source: centerId, target: leftId },
      { id: uid(), source: centerId, target: rightId },
      { id: uid(), source: rightId, target: deepId },
    ],
  };
};

const load = (): { maps: MindMap[]; activeId: string | null } => {
  if (typeof window === "undefined") return { maps: [], activeId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (!raw) {
      const first = defaultMap();
      localStorage.setItem(STORAGE_KEY, JSON.stringify([first]));
      localStorage.setItem(ACTIVE_KEY, first.id);
      return { maps: [first], activeId: first.id };
    }
    const parsed = JSON.parse(raw) as MindMap[];
    parsed.forEach((m) => m.nodes.forEach((n) => { n.tags = n.tags ?? []; }));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const first = defaultMap();
      return { maps: [first], activeId: first.id };
    }
    return { maps: parsed, activeId: activeId ?? parsed[0].id };
  } catch {
    const first = defaultMap();
    return { maps: [first], activeId: first.id };
  }
};

const persist = (maps: MindMap[], activeId: string | null) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
  if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
};

export interface UseMaps {
  ready: boolean;
  maps: MindMap[];
  activeMap: MindMap | null;
  activeId: string | null;
  canUndo: boolean;
  setActiveId: (id: string) => void;
  createMap: () => string;
  deleteMap: (id: string) => void;
  undo: () => void;
  renameMap: (id: string, title: string) => void;
  setMapEmoji: (id: string, emoji: string) => void;
  updateActive: (mutator: (m: MindMap) => MindMap) => void;
  upsertNode: (node: MindMapNode) => void;
  removeNode: (ids: string | string[]) => void;
  setNodeColor: (id: string, color: StickerColor) => void;
  setNodeNote: (id: string, note: string) => void;
  setNodeTitle: (id: string, title: string) => void;
  setNodeTags: (id: string, tags: string[]) => void;
  addNode: (position?: { x: number; y: number }) => string;
  addGroup: (position?: { x: number; y: number }) => string;
  addChildToGroup: (groupId: string, position?: { x: number; y: number }) => string;
  groupNodes: (nodeIds: string[]) => void;
  assignToGroup: (nodeId: string, groupId: string | null) => void;
  toggleGroup: (id: string) => void;
  addEdge: (connection: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }) => void;
  removeEdge: (id: string) => void;
}

export function useMaps(): UseMaps {
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const activeIdRef = useRef<string | null>(null);
  const mapsRef = useRef<MindMap[]>([]);
  const pastRef = useRef<MindMap[][]>([]);

  useEffect(() => {
    const { maps: loaded, activeId: a } = load();
    setMaps(loaded);
    setActiveIdState(a);
    activeIdRef.current = a;
    setReady(true);
  }, []);

  useEffect(() => {
    mapsRef.current = maps;
  }, [maps]);

  const undo = useCallback(() => {
    const snap = pastRef.current.pop();
    if (!snap) return;
    const a = activeIdRef.current;
    setMaps(snap);
    persist(snap, a);
    setCanUndo(pastRef.current.length > 0);
  }, [setMaps]);

  const write = useCallback(
    (next: MindMap[], nextActive: string | null) => {
      const prev = mapsRef.current;
      pastRef.current.push(
        typeof structuredClone === "function"
          ? structuredClone(prev)
          : JSON.parse(JSON.stringify(prev)),
      );
      if (pastRef.current.length > 30) pastRef.current.shift();
      setCanUndo(true);
      setMaps(next);
      mapsRef.current = next;
      setActiveIdState(nextActive);
      activeIdRef.current = nextActive;
      persist(next, nextActive);
    },
    [setMaps, setActiveIdState],
  );

  const updateActive = useCallback(
    (mutator: (m: MindMap) => MindMap) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a ? { ...mutator(m), updatedAt: Date.now() } : m,
      );
      write(next, a);
    },
    [write],
  );

  const setActiveId = useCallback(
    (id: string) => {
      write(mapsRef.current, id);
    },
    [write],
  );

  const createMap = useCallback((): string => {
    const m = defaultMap();
    const next = [...mapsRef.current, m];
    write(next, m.id);
    return m.id;
  }, [write]);

  const deleteMap = useCallback(
    (id: string) => {
      const next = mapsRef.current.filter((m) => m.id !== id);
      let active = activeIdRef.current;
      if (active === id) {
        active = next[0]?.id ?? null;
        if (!active) {
          const fresh = defaultMap();
          next.push(fresh);
          active = fresh.id;
        }
      }
      write(next, active);
    },
    [write],
  );

  const renameMap = useCallback(
    (id: string, title: string) => {
      const next = mapsRef.current.map((m) =>
        m.id === id ? { ...m, title, updatedAt: Date.now() } : m,
      );
      write(next, activeIdRef.current);
    },
    [write],
  );

  const setMapEmoji = useCallback(
    (id: string, emoji: string) => {
      const next = mapsRef.current.map((m) =>
        m.id === id ? { ...m, emoji, updatedAt: Date.now() } : m,
      );
      write(next, activeIdRef.current);
    },
    [write],
  );

  const activeMap = mapsRef.current.find((m) => m.id === activeId) ?? null;

  const addNode = useCallback(
    (position?: { x: number; y: number }): string => {
      const a = activeIdRef.current;
      if (!a) return "";
      const id = uid();
      const map = mapsRef.current.find((m) => m.id === a);
      const last = map?.nodes[map.nodes.length - 1];
      const pos =
        position ??
        (last
          ? { x: last.position.x + 40, y: last.position.y + 80 }
          : { x: 80, y: 80 });
      const node: MindMapNode = {
        id,
        title: "New idea",
        note: sampleNote("New idea"),
        color: "sky",
        tags: [],
        position: pos,
      };
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? { ...m, nodes: [...m.nodes, node], updatedAt: Date.now() }
          : m,
      );
      write(next, a);
      return id;
    },
    [write],
  );

  const addGroup = useCallback(
    (position?: { x: number; y: number }): string => {
      const a = activeIdRef.current;
      if (!a) return "";
      const id = uid();
      const map = mapsRef.current.find((m) => m.id === a);
      const last = map?.nodes[map.nodes.length - 1];
      const pos =
        position ??
        (last
          ? { x: last.position.x + 80, y: last.position.y + 40 }
          : { x: 80, y: 80 });
      const group: MindMapNode = {
        id,
        title: "New group",
        note: sampleNote("New group"),
        color: "sky",
        tags: [],
        isGroup: true,
        expanded: true,
        position: pos,
      };
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? { ...m, nodes: [...m.nodes, group], updatedAt: Date.now() }
          : m,
      );
      write(next, a);
      return id;
    },
    [write],
  );

  const addChildToGroup = useCallback(
    (groupId: string, position?: { x: number; y: number }): string => {
      const a = activeIdRef.current;
      if (!a) return "";
      const id = uid();
      const pos = position ?? { x: 40, y: 80 };
      const child: MindMapNode = {
        id,
        title: "New child",
        note: sampleNote("New child"),
        color: "purple",
        tags: [],
        parentId: groupId,
        position: pos,
      };
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? { ...m, nodes: [...m.nodes, child], updatedAt: Date.now() }
          : m,
      );
      write(next, a);
      return id;
    },
    [write],
  );

  const groupNodes = useCallback(
    (nodeIds: string[]) => {
      const a = activeIdRef.current;
      if (!a) return;
      const idSet = new Set(nodeIds);
      const map = mapsRef.current.find((m) => m.id === a);
      if (!map) return;
      const selected = map.nodes.filter(
        (n) => idSet.has(n.id) && !n.isGroup,
      );
      if (selected.length === 0) return;

      const PADDING = { x: 40, y: 60 };
      const minX = Math.min(...selected.map((n) => n.position.x)) - PADDING.x;
      const minY = Math.min(...selected.map((n) => n.position.y)) - PADDING.y;
      const maxX = Math.max(...selected.map((n) => n.position.x)) + 180 + PADDING.x;
      const maxY = Math.max(...selected.map((n) => n.position.y)) + 80 + PADDING.y;
      const groupPos = { x: minX, y: minY };

      const groupId = uid();
      const group: MindMapNode = {
        id: groupId,
        title: "Group",
        note: sampleNote("Group"),
        color: "sky",
        tags: [],
        isGroup: true,
        expanded: true,
        position: groupPos,
      };

      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: [
                ...m.nodes.map((n) =>
                  idSet.has(n.id) && !n.isGroup
                    ? {
                        ...n,
                        parentId: groupId,
                        position: {
                          x: n.position.x - groupPos.x,
                          y: n.position.y - groupPos.y,
                        },
                      }
                    : n,
                ),
                group,
              ],
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const assignToGroup = useCallback(
    (nodeId: string, groupId: string | null) => {
      const a = activeIdRef.current;
      if (!a) return;
      const map = mapsRef.current.find((m) => m.id === a);
      if (!map) return;

      const getAbs = (n: MindMapNode, visited = new Set<string>()): { x: number; y: number } => {
        if (visited.has(n.id)) return n.position;
        visited.add(n.id);
        if (!n.parentId) return n.position;
        const p = map.nodes.find((x) => x.id === n.parentId);
        if (!p) return n.position;
        const pp = getAbs(p, visited);
        return { x: n.position.x + pp.x, y: n.position.y + pp.y };
      };

      const next = mapsRef.current.map((m) => {
        if (m.id !== a) return m;
        const n = m.nodes.find((x) => x.id === nodeId);
        if (!n || n.isGroup) return m;
        const oldGroup = n.parentId ? m.nodes.find((x) => x.id === n.parentId) : null;
        const oldAbs = getAbs(n);

        if (!groupId) {
          if (!n.parentId) return m;
          return {
            ...m,
            nodes: m.nodes.map((x) =>
              x.id === nodeId
                ? { ...x, parentId: undefined, position: oldAbs }
                : x,
            ),
            updatedAt: Date.now(),
          };
        }

        const g = m.nodes.find((x) => x.id === groupId);
        if (!g || !g.isGroup || g.id === n.id) return m;
        const gAbs = getAbs(g);
        return {
          ...m,
          nodes: m.nodes.map((x) =>
            x.id === nodeId
              ? {
                  ...x,
                  parentId: groupId,
                  position: {
                    x: oldAbs.x - gAbs.x,
                    y: oldAbs.y - gAbs.y,
                  },
                }
              : x,
          ),
          updatedAt: Date.now(),
        };
      });
      write(next, a);
    },
    [write],
  );

  const toggleGroup = useCallback(
    (id: string) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: m.nodes.map((n) =>
                n.id === id ? { ...n, expanded: !n.expanded } : n,
              ),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const upsertNode = useCallback(
    (node: MindMapNode) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) => {
        if (m.id !== a) return m;
        const exists = m.nodes.some((n) => n.id === node.id);
        return {
          ...m,
          nodes: exists
            ? m.nodes.map((n) => (n.id === node.id ? node : n))
            : [...m.nodes, node],
          updatedAt: Date.now(),
        };
      });
      write(next, a);
    },
    [write],
  );

  const removeNode = useCallback(
    (ids: string | string[]) => {
      const a = activeIdRef.current;
      if (!a) return;
      const idSet = new Set(Array.isArray(ids) ? ids : [ids]);
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: m.nodes.filter(
                (n) =>
                  !idSet.has(n.id) &&
                  !(n.parentId && idSet.has(n.parentId)),
              ),
              edges: m.edges.filter(
                (e) => !idSet.has(e.source) && !idSet.has(e.target),
              ),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const setNodeColor = useCallback(
    (id: string, color: StickerColor) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: m.nodes.map((n) =>
                n.id === id ? { ...n, color } : n,
              ),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const setNodeNote = useCallback(
    (id: string, note: string) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: m.nodes.map((n) =>
                n.id === id ? { ...n, note } : n,
              ),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const setNodeTitle = useCallback(
    (id: string, title: string) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: m.nodes.map((n) =>
                n.id === id ? { ...n, title } : n,
              ),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const setNodeTags = useCallback(
    (id: string, tags: string[]) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              nodes: m.nodes.map((n) =>
                n.id === id ? { ...n, tags } : n,
              ),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  const addEdge = useCallback(
    (connection: {
      source: string;
      target: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }) => {
      if (connection.source === connection.target) return;
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) => {
        if (m.id !== a) return m;
        if (
          m.edges.some(
            (e) =>
              e.source === connection.source && e.target === connection.target,
          )
        )
          return m;
        const edge: MindMapEdge = {
          id: uid(),
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
        };
        return { ...m, edges: [...m.edges, edge], updatedAt: Date.now() };
      });
      write(next, a);
    },
    [write],
  );

  const removeEdge = useCallback(
    (id: string) => {
      const a = activeIdRef.current;
      if (!a) return;
      const next = mapsRef.current.map((m) =>
        m.id === a
          ? {
              ...m,
              edges: m.edges.filter((e) => e.id !== id),
              updatedAt: Date.now(),
            }
          : m,
      );
      write(next, a);
    },
    [write],
  );

  return {
    ready,
    maps,
    activeMap: activeMap ?? null,
    activeId,
    canUndo,
    undo,
    setActiveId,
    createMap,
    deleteMap,
    renameMap,
    setMapEmoji,
    updateActive,
    upsertNode,
    removeNode,
    setNodeColor,
    setNodeNote,
    setNodeTitle,
    setNodeTags,
    addNode,
    addGroup,
    addChildToGroup,
    groupNodes,
    assignToGroup,
    toggleGroup,
    addEdge,
    removeEdge,
  };
}
