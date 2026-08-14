"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type Connection,
  type ReactFlowInstance,
  type OnConnect,
  type OnConnectEnd,
  type OnNodeDrag,
  type OnNodesChange,
  type OnEdgesChange,
  SelectionMode,
  ConnectionMode,
  Position,
} from "@xyflow/react";

import MindMapNode from "./MindMapNode";
import GroupNode from "./GroupNode";
import DocPanel from "./DocPanel";
import MiniMapEdges from "./MiniMapEdges";
import Cursors from "./Cursors";
import type { MindMap, MindMapNode as MMNode } from "@/lib/types";
import type { Awareness } from "y-protocols/awareness";
import {
  PlusIcon,
  FitViewIcon,
  PageIcon,
  SparkleIcon,
  TrashIcon,
  CloseIcon,
} from "./Icon";

interface Props {
  map: MindMap;
  onAddNode: (position?: { x: number; y: number }) => string;
  onMoveNode: (id: string, position: { x: number; y: number }) => void;
  onTitleCommit: (id: string, title: string) => void;
  onAddEdge: (connection: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }) => void;
  onRemoveEdge: (id: string) => void;
  onRemoveNode: (ids: string | string[]) => void;
  onRenameMap: (title: string) => void;
  onSetEmoji: (emoji: string) => void;
  onSetNodeColor: (id: string, color: MMNode["color"]) => void;
  onSetNodeNote: (id: string, note: string) => void;
  onSetNodeTitle: (id: string, title: string) => void;
  onSetNodeTags: (id: string, tags: string[]) => void;
  onAddGroup: (position?: { x: number; y: number }) => string;
  onAddChildToGroup: (groupId: string, position?: { x: number; y: number }) => string;
  onGroupNodes: (nodeIds: string[]) => void;
  onAssignToGroup: (nodeId: string, groupId: string | null) => void;
  onToggleGroup: (id: string) => void;
  awareness: Awareness | null;
}

const nodeTypes = { mindmap: MindMapNode, group: GroupNode };

const ICONS = ["◍", "✦", "◆", "◇", "✚", "✱", "✸", "✺", "❖", "◈"];

// Compute the bounding box of a set of child nodes so a group can wrap them.
// Width/height can be supplied from an external map so the stored nodes (which
// do not persist dimensions) can use the measured dimensions from React Flow.
function depthOf(
  node: { id: string; parentId?: string },
  all: { id: string; parentId?: string }[],
  cache = new Map<string, number>(),
): number {
  if (cache.has(node.id)) return cache.get(node.id)!;
  if (!node.parentId) {
    cache.set(node.id, 0);
    return 0;
  }
  const parent = all.find((n) => n.id === node.parentId);
  if (!parent) {
    cache.set(node.id, 0);
    return 0;
  }
  const d = depthOf(parent, all, cache) + 1;
  cache.set(node.id, d);
  return d;
}

function sortNodesByParent<T extends { id: string; parentId?: string }>(nodes: T[]): T[] {
  const cache = new Map<string, number>();
  return [...nodes].sort((a, b) => depthOf(a, nodes, cache) - depthOf(b, nodes, cache));
}

function computeGroupSize<T extends { id: string; position: { x: number; y: number }; width?: number; height?: number }>(
  children: T[],
  dimOverrides?: Map<string, { width?: number; height?: number }>,
) {
  const boxes = children.map((c) => {
    const override = dimOverrides?.get(c.id);
    const cw = override?.width ?? c.width ?? 180;
    const ch = override?.height ?? c.height ?? 80;
    return {
      left: c.position.x,
      top: c.position.y,
      right: c.position.x + cw,
      bottom: c.position.y + ch,
    };
  });
  const minX = Math.min(0, ...boxes.map((b) => b.left));
  const minY = Math.min(40, ...boxes.map((b) => b.top));
  const maxX = Math.max(0, ...boxes.map((b) => b.right));
  const maxY = Math.max(40, ...boxes.map((b) => b.bottom));
  return {
    width: Math.max(320, maxX - minX + 40),
    height: Math.max(220, maxY - minY + 60),
  };
}

export default function Workspace(props: Props) {
  return (
    <ReactFlowProvider>
      <WorkspaceInner {...props} />
    </ReactFlowProvider>
  );
}

function WorkspaceInner({
  map,
  onAddNode,
  onMoveNode,
  onTitleCommit,
  onAddEdge,
  onRemoveEdge,
  onRemoveNode,
  onRenameMap,
  onSetEmoji,
  onSetNodeColor,
  onSetNodeNote,
  onSetNodeTitle,
  onSetNodeTags,
  onAddGroup,
  onAddChildToGroup,
  onGroupNodes,
  onAssignToGroup,
  onToggleGroup,
  awareness,
}: Props) {
  const [title, setTitle] = useState(map.title);
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [selectBox, setSelectBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const rf = useReactFlow();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const rightSelect = useRef<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  // Stable refs to callbacks so the memoized `nodes` array doesn't churn
  const onMoveNodeRef = useRef(onMoveNode);
  const onTitleCommitRef = useRef(onTitleCommit);
  const onAddGroupRef = useRef(onAddGroup);
  const onAddChildToGroupRef = useRef(onAddChildToGroup);
  const onGroupNodesRef = useRef(onGroupNodes);
  const onAssignToGroupRef = useRef(onAssignToGroup);
  const onToggleGroupRef = useRef(onToggleGroup);
  useEffect(() => {
    onMoveNodeRef.current = onMoveNode;
    onTitleCommitRef.current = onTitleCommit;
    onAddGroupRef.current = onAddGroup;
    onAddChildToGroupRef.current = onAddChildToGroup;
    onGroupNodesRef.current = onGroupNodes;
    onAssignToGroupRef.current = onAssignToGroup;
    onToggleGroupRef.current = onToggleGroup;
  }, [
    onMoveNode,
    onTitleCommit,
    onAddGroup,
    onAddChildToGroup,
    onGroupNodes,
    onAssignToGroup,
    onToggleGroup,
  ]);

  useEffect(() => {
    setTitle(map.title);
  }, [map.id, map.title]);

  // xyflow's own controlled state. While the user is dragging, xyflow owns
  // the in-flight position — we don't touch `nodes` from outside mid-drag,
  // so the dragged node never gets a stale prop pushed back to it. On
  // drag end we read the final position out of `nodes` and commit it to
  // the store. Non-drag content changes (title, color, note, add, delete)
  // are synced from the store into `nodes`/`edges` via the effect below.
  const [flowNodes, setFlowNodes, onFlowNodesChange] = useNodesState<Node>([]);
  const flowNodesRef = useRef<Node[]>([]);
  useEffect(() => {
    flowNodesRef.current = flowNodes;
  }, [flowNodes]);
  const [flowEdges, setFlowEdges, onFlowEdgesChange] = useEdgesState<Edge>([]);

  // Sync from store → xyflow state. We only sync structural changes (add /
  // remove / content) and final positions. We *never* overwrite a node
  // that is currently being dragged (xyflow's internal drag state is the
  // source of truth mid-drag). `isDraggingRef` tracks that.
  const isDraggingRef = useRef(false);
  const dataCacheRef = useRef<Map<string, Record<string, unknown>>>(new Map());

  // Stable key that only changes when a node's width/height changes, so
  // `storeNodes` can recompute group bounding boxes without reacting to every
  // position change.
  const dimensionsKey = useMemo(
    () => flowNodes.map((f) => `${f.id}:${f.width ?? 0}:${f.height ?? 0}`).join("|"),
    [flowNodes],
  );

  // Build the "next" node list from the store (used by the sync effect).
  const storeNodes: Node[] = useMemo(() => {
    const cache = dataCacheRef.current;
    const dimMap = new Map<string, { width?: number; height?: number }>(
      flowNodes.map((f) => [f.id, { width: f.width, height: f.height }]),
    );
    return sortNodesByParent(map.nodes).map((n) => {
      const isGroup = n.isGroup ?? false;
      const parentGroup = n.parentId
        ? map.nodes.find((g) => g.id === n.parentId)
        : null;
      const hidden = parentGroup ? parentGroup.expanded === false : false;
      const expanded = n.expanded !== false;
      const key = `${n.id}|${n.title}|${n.note}|${n.color}|${openNodeId === n.id}|${n.tags.join(",")}|${isGroup}|${n.parentId ?? ""}|${expanded}`;
      let data = cache.get(key);
      if (!data) {
        data = isGroup
          ? {
              id: n.id,
              title: n.title,
              color: n.color,
              expanded,
              onToggle: (id: string) => onToggleGroupRef.current(id),
              onAddChild: (id: string) =>
                onAddChildToGroupRef.current(id, { x: 40, y: 80 }),
            }
          : {
              id: n.id,
              title: n.title,
              note: n.note,
              color: n.color,
              tags: n.tags,
              onTitleCommit: (id: string, t: string) =>
                onTitleCommitRef.current(id, t),
            };
        cache.set(key, data);
      }
      const base: Node = {
        id: n.id,
        type: isGroup ? "group" : "mindmap",
        position: n.position,
        parentId: n.parentId,
        data: data as unknown as Record<string, unknown>,
        selected: openNodeId === n.id,
        hidden,
        zIndex: isGroup ? -1 : n.parentId ? 1 : 0,
      };
      if (isGroup) {
        if (n.expanded === false) {
          base.width = 180;
          base.height = 48;
        } else {
          const children = map.nodes.filter((c) => c.parentId === n.id);
          const { width, height } = computeGroupSize(children, dimMap);
          base.width = width;
          base.height = height;
        }
      }
      return base;
    });
    // `flowNodes` is read inside the memo but only dimensions trigger a
    // recompute (captured by `dimensionsKey`), not every position change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.nodes, openNodeId, dimensionsKey]);

  // Sync effect: when the store changes, update xyflow's state. While a
  // drag is in progress, we keep xyflow's live positions and only refresh
  // content (data, selected) for the dragged node. Outside of a drag we
  // accept the store positions wholesale and keep any user-resized dimensions.
  useEffect(() => {
    setFlowNodes((prev) => {
      const prevById = new Map(prev.map((p) => [p.id, p]));
      return storeNodes.map((sn) => {
        const old = prevById.get(sn.id);
        if (!old) return sn;
        if (!isDraggingRef.current) {
          const expandedChanged =
            old.data?.expanded !== (sn.data as { expanded?: boolean }).expanded;
          const isGroup = sn.type === "group";
          // Groups should always wrap their children, but we also allow the
          // user to resize a group to be larger. So for groups we grow to the
          // store's computed size and preserve a manually larger size.
          const shouldUseStoreWidth = isGroup
            ? (sn.width && (old.width == null || expandedChanged || sn.width >= old.width))
            : expandedChanged;
          const shouldUseStoreHeight = isGroup
            ? (sn.height && (old.height == null || expandedChanged || sn.height >= old.height))
            : expandedChanged;
          return {
            ...sn,
            width: shouldUseStoreWidth ? sn.width : (old?.width ?? sn.width),
            height: shouldUseStoreHeight ? sn.height : (old?.height ?? sn.height),
          };
        }
        // Mid-drag: keep prev's positions and dimensions, refresh content.
        return { ...old, data: sn.data, selected: sn.selected };
      });
    });
  }, [storeNodes, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(
      map.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle
          ? e.sourceHandle.replace(/-target$/, "-source")
          : "right-source",
        targetHandle: e.targetHandle
          ? e.targetHandle.replace(/-target$/, "-source")
          : "left-source",
        type: "smoothstep",
        selected: selectedEdgeId === e.id,
        interactionWidth: 24,
      })),
    );
  }, [map.edges, selectedEdgeId, setFlowEdges]);

  // Clear the selected edge if it was deleted (e.g. via keyboard).
  useEffect(() => {
    setSelectedEdgeId((id) => (id && map.edges.some((e) => e.id === id) ? id : null));
  }, [map.edges]);

  // Drag handler: track in-flight drag and commit final position only.
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      let sawDragEnd = false;
      const removedIds: string[] = [];
      for (const c of changes) {
        if (c.type === "position" && c.position) {
          const child = flowNodesRef.current.find((f) => f.id === c.id);
          const parent =
            child?.parentId &&
            flowNodesRef.current.find((f) => f.id === child.parentId);
          if (parent) {
            const pw = parent.width ?? 320;
            const ph = parent.height ?? 220;
            const cw = child.width ?? 180;
            const ch = child.height ?? 80;
            c.position = {
              x: Math.max(0, Math.min(c.position.x, pw - cw)),
              y: Math.max(40, Math.min(c.position.y, ph - ch)),
            };
          }
          if (c.dragging) {
            isDraggingRef.current = true;
          } else {
            // drag end — commit final position to store
            isDraggingRef.current = false;
            onMoveNodeRef.current(c.id, c.position);
            sawDragEnd = true;
          }
        } else if (c.type === "remove") {
          removedIds.push(c.id);
        }
      }
      onFlowNodesChange(changes);
      if (removedIds.length) {
        onRemoveNode(removedIds);
        if (openNodeId && removedIds.includes(openNodeId)) setOpenNodeId(null);
      }
      if (sawDragEnd) {
        // After committing, the store will re-render and the sync effect
        // will refresh `flowNodes` with the canonical store position.
        isDraggingRef.current = false;
      }
    },
    [onFlowNodesChange, onRemoveNode],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      for (const c of changes) {
        if (c.type === "remove") onRemoveEdge(c.id);
      }
      onFlowEdgesChange(changes);
    },
    [onRemoveEdge, onFlowEdgesChange],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        onAddEdge({
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        });
      }
    },
    [onAddEdge],
  );

  const onConnectEnd: OnConnectEnd<Node> = useCallback(
    (_event, connectionState) => {
      if (connectionState.toNode) return;
      const fromNode = connectionState.fromNode;
      const fromHandle = connectionState.fromHandle;
      const pointer = connectionState.pointer;
      if (!fromNode || !fromHandle || !pointer) return;

      const newId = onAddNode({
        x: pointer.x - 90,
        y: pointer.y - 40,
      });
      if (!newId) return;

      const targetHandle =
        fromHandle.position === Position.Top
          ? "bottom-source"
          : fromHandle.position === Position.Right
            ? "left-source"
            : fromHandle.position === Position.Bottom
              ? "top-source"
              : "right-source";

      onAddEdge({
        source: fromNode.id,
        target: newId,
        sourceHandle: fromHandle.id,
        targetHandle,
      });
    },
    [onAddNode, onAddEdge],
  );

  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodeIds(params.nodes.map((n) => n.id));
    },
    [],
  );

  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    (_event, node, nodes) => {
      const all = nodes.length ? nodes : [node];
      const flow = flowNodesRef.current;

      const getAbs = (n: Node, visited = new Set<string>()): { x: number; y: number } => {
        if (visited.has(n.id)) return n.position;
        visited.add(n.id);
        if (!n.parentId) return n.position;
        const p = flow.find((f) => f.id === n.parentId);
        if (!p) return n.position;
        const pp = getAbs(p, visited);
        return { x: n.position.x + pp.x, y: n.position.y + pp.y };
      };

      for (const n of all) {
        if (n.type === "group") continue;

        const abs = getAbs(n);
        const nw = n.width ?? 180;
        const nh = n.height ?? 80;
        const cx = abs.x + nw / 2;
        const cy = abs.y + nh / 2;

        const target = flow.find(
          (f) =>
            f.type === "group" &&
            f.id !== n.id &&
            f.id !== n.parentId &&
            cx >= f.position.x &&
            cx <= f.position.x + (f.width ?? 320) &&
            cy >= f.position.y &&
            cy <= f.position.y + (f.height ?? 220),
        );

        if (target) {
          onAssignToGroupRef.current(n.id, target.id);
        } else if (n.parentId) {
          const parent = flow.find((f) => f.id === n.parentId);
          if (!parent) continue;
          const pw = parent.width ?? 320;
          const ph = parent.height ?? 220;
          const x = Math.max(0, Math.min(n.position.x, pw - nw));
          const y = Math.max(40, Math.min(n.position.y, ph - nh));
          onMoveNodeRef.current(n.id, { x, y });
        }
      }
    },
    [],
  );

  const onNodeClick = useCallback(
    (event: { shiftKey?: boolean } | unknown, node: Node) => {
      const e = event as { shiftKey?: boolean } | undefined;
      if (e?.shiftKey) return;
      setOpenNodeId(node.id);
      setSelectedEdgeId(null);
    },
    [],
  );

  const onEdgeClick = useCallback((_: unknown, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const onCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 2) return;
      const target = event.target as HTMLElement;
      if (!target.classList.contains("react-flow__pane")) return;
      event.preventDefault();
      const start = { x: event.clientX, y: event.clientY };
      rightSelect.current = { start, end: start };
      setSelectBox({
        startX: start.x,
        startY: start.y,
        endX: start.x,
        endY: start.y,
      });

      const onPointerMove = (e: PointerEvent) => {
        if (!rightSelect.current) return;
        rightSelect.current.end = { x: e.clientX, y: e.clientY };
        setSelectBox((prev) =>
          prev
            ? { ...prev, endX: e.clientX, endY: e.clientY }
            : { startX: start.x, startY: start.y, endX: e.clientX, endY: e.clientY },
        );
      };

      const onPointerUp = () => {
        if (!rightSelect.current) return;
        const { start: s, end: e } = rightSelect.current;
        const left = Math.min(s.x, e.x);
        const top = Math.min(s.y, e.y);
        const right = Math.max(s.x, e.x);
        const bottom = Math.max(s.y, e.y);
        const tl = rf.screenToFlowPosition({ x: left, y: top });
        const br = rf.screenToFlowPosition({ x: right, y: bottom });

        setFlowNodes((prev) =>
          prev.map((n) => {
            const nLeft = n.position.x;
            const nTop = n.position.y;
            const nRight = nLeft + (n.width ?? 180);
            const nBottom = nTop + (n.height ?? 80);
            const intersects = !(
              nRight < tl.x ||
              nLeft > br.x ||
              nBottom < tl.y ||
              nTop > br.y
            );
            return { ...n, selected: intersects };
          }),
        );
        setSelectedEdgeId(null);
        rightSelect.current = null;
        setSelectBox(null);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [rf, setFlowNodes, setSelectedEdgeId],
  );

  const onPaneClick = useCallback(() => {
    setOpenNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const handleAddHere = useCallback(() => {
    const pos = rf.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const id = onAddNode(pos);
    setOpenNodeId(id);
  }, [onAddNode, rf]);

  const handleAddGroup = useCallback(() => {
    const pos = rf.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    onAddGroup(pos);
  }, [onAddGroup, rf]);

  const handleGroupSelected = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      onGroupNodes(selectedNodeIds);
    }
  }, [onGroupNodes, selectedNodeIds]);

  const openNode = openNodeId
    ? map.nodes.find((n) => n.id === openNodeId) ?? null
    : null;

  const onInit = useCallback(
    (_inst: ReactFlowInstance) => {
      setTimeout(() => rf.fitView({ padding: 0.2, duration: 200 }), 50);
    },
    [rf],
  );

  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!awareness) return;
      const pos = rf.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      awareness.setLocalStateField("cursor", pos);
    },
    [awareness, rf],
  );

  return (
    <div className="workspace">
      <div className="workspace__header">
        <div className="workspace__crumbs">
          <span className="workspace__crumb-icon" aria-hidden>
            <PageIcon size={14} />
          </span>
          <span>Workspace</span>
          <span className="workspace__crumb-sep" aria-hidden>
            /
          </span>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="workspace__icon-btn"
              onClick={() => setIconPickerOpen((v) => !v)}
              aria-label="Change icon"
              title="Change icon"
            >
              {map.emoji}
            </button>
            {iconPickerOpen && (
              <div className="workspace__icon-pop" role="listbox">
                {ICONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="workspace__icon-cell"
                    onClick={() => {
                      onSetEmoji(c);
                      setIconPickerOpen(false);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            className="workspace__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onRenameMap(title.trim() || "Untitled")}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            placeholder="Untitled"
            aria-label="Mind map title"
          />
          <span className="badge-pill">
            {map.nodes.length} node{map.nodes.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="workspace__actions">
          <button
            className="btn-utility"
            type="button"
            onClick={handleAddHere}
            title="Add a new node"
          >
            <PlusIcon size={14} />
            New node
          </button>
          <button
            className="btn-utility"
            type="button"
            onClick={handleAddGroup}
            title="Add a new group"
          >
            <PlusIcon size={14} />
            New group
          </button>
          {selectedNodeIds.length > 1 && (
            <button
              className="btn-utility"
              type="button"
              onClick={handleGroupSelected}
              title="Group selected nodes"
            >
              <PlusIcon size={14} />
              Group selected
            </button>
          )}
          <button
            className="btn-primary canvas__fit-btn"
            type="button"
            onClick={() => rf.fitView({ padding: 0.2, duration: 200 })}
            title="Fit view"
          >
            <FitViewIcon size={14} />
            Fit view
          </button>
          {selectedEdgeId && (
            <button
              className="btn-utility"
              type="button"
              onClick={() => {
                onRemoveEdge(selectedEdgeId);
                setSelectedEdgeId(null);
              }}
              title="Remove selected connection"
            >
              <TrashIcon size={14} />
              Remove connection
            </button>
          )}
        </div>
      </div>

      <div
        className="canvas"
        ref={canvasRef}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={onCanvasPointerDown}
      >
        {selectBox && (
          <div
            className="canvas__selection-box"
            style={{
              position: "fixed",
              left: Math.min(selectBox.startX, selectBox.endX),
              top: Math.min(selectBox.startY, selectBox.endY),
              width: Math.abs(selectBox.endX - selectBox.startX),
              height: Math.abs(selectBox.endY - selectBox.startY),
              pointerEvents: "none",
            }}
          />
        )}
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onConnectEnd={onConnectEnd}
          onSelectionChange={onSelectionChange}
          onInit={onInit}
          onPaneMouseMove={onPaneMouseMove}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
          connectionLineStyle={{ strokeWidth: 2 }}
          panOnDrag={[0]}
          selectionOnDrag={false}
          selectionMode={SelectionMode.Partial}
          connectionMode={ConnectionMode.Loose}
          multiSelectionKeyCode="Shift"
          selectionKeyCode={null}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) =>
              node.type === "group" ? "#a855f7" : "#0075de"
            }
            maskColor="rgba(246,245,244,0.7)"
            style={{ background: "var(--color-canvas)", width: 200, height: 150 }}
          />
          <MiniMapEdges />
          <Controls
            showInteractive={false}
            showFitView={false}
          />
          <Cursors awareness={awareness} />
        </ReactFlow>

        {map.nodes.length === 0 && (
          <div className="canvas-empty">
            <div className="canvas-empty__card">
              <span className="badge-pill">
                <SparkleIcon size={12} />
                Get started
              </span>
              <h2>Your mind map is empty</h2>
              <p>
                Add a node to drop your first thought on the canvas. Drag from a
                node's edge to connect it to another.
              </p>
              <button className="btn-primary" type="button" onClick={handleAddHere}>
                <PlusIcon size={14} />
                Add your first node
              </button>
            </div>
          </div>
        )}

        {showHint && (
          <div className="canvas__hint">
            <button
              type="button"
              className="canvas__hint__close"
              aria-label="Close hint"
              onClick={() => setShowHint(false)}
            >
              <CloseIcon size={12} />
            </button>
            Left drag to pan. Right drag on the canvas to box-select. Delete to
            remove selected. Drag a node's edge to connect, double-click to
            rename, click to open notes.
          </div>
        )}

        {openNode && (
          <DocPanel
            node={openNode}
            onClose={() => setOpenNodeId(null)}
            onNoteChange={onSetNodeNote}
            onTitleChange={onSetNodeTitle}
            onTagsChange={onSetNodeTags}
            onColorChange={onSetNodeColor}
            onAddChildToGroup={(groupId) =>
              onAddChildToGroup(groupId, { x: 40, y: 80 })
            }
            onToggleGroup={onToggleGroup}
            onRemoveFromGroup={(id) => onAssignToGroup(id, null)}
            onDelete={(id) => {
              onRemoveNode(id);
              setOpenNodeId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
