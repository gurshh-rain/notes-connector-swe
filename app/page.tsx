"use client";

import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import Workspace from "@/components/Workspace";
import { useMaps } from "@/lib/useMaps";
import { PlusIcon, SparkleIcon } from "@/components/Icon";

export default function Home() {
  const m = useMaps();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        m.undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [m.undo]);

  if (!m.ready) {
    return (
      <div className="app-shell">
        <NavBar roomId={m.roomId} onShare={m.shareRoom} />
        <Sidebar
          maps={[]}
          activeId={null}
          onSelect={() => {}}
          onCreate={() => {}}
          onDelete={() => {}}
          onRename={() => {}}
        />
        <div className="workspace">
          <div className="workspace__header">
            <div className="workspace__crumbs">
              <span className="workspace__title">Loading…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <NavBar
        roomId={m.roomId}
        onShare={m.shareRoom}
      />
      <Sidebar
        maps={m.maps}
        activeId={m.activeId}
        onSelect={m.setActiveId}
        onCreate={() => {
          const id = m.createMap();
          m.setActiveId(id);
        }}
        onDelete={m.deleteMap}
        onRename={m.renameMap}
      />
      {m.activeMap ? (
        <Workspace
          key={m.activeMap.id}
          map={m.activeMap}
          onAddNode={m.addNode}
          onMoveNode={(id, pos) =>
            m.updateActive((cur) => ({
              ...cur,
              nodes: cur.nodes.map((n) =>
                n.id === id ? { ...n, position: pos } : n,
              ),
            }))
          }
          onTitleCommit={m.setNodeTitle}
          onAddEdge={m.addEdge}
          onRemoveEdge={m.removeEdge}
          onRemoveNode={m.removeNode}
          onRenameMap={(t) =>
            m.updateActive((cur) => ({ ...cur, title: t }))
          }
          onSetEmoji={(emoji) =>
            m.updateActive((cur) => ({ ...cur, emoji }))
          }
          onSetNodeColor={m.setNodeColor}
          onSetNodeNote={m.setNodeNote}
          onSetNodeTitle={m.setNodeTitle}
          onSetNodeTags={m.setNodeTags}
          onAddGroup={m.addGroup}
          onAddChildToGroup={m.addChildToGroup}
          onGroupNodes={m.groupNodes}
          onAssignToGroup={m.assignToGroup}
          onToggleGroup={m.toggleGroup}
          awareness={m.awareness}
        />
      ) : (
        <div className="workspace">
          <div className="workspace__header">
            <div className="workspace__crumbs">
              <span className="workspace__title">No map selected</span>
            </div>
            <div className="workspace__actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  const id = m.createMap();
                  m.setActiveId(id);
                }}
              >
                <PlusIcon size={14} />
                New mind map
              </button>
            </div>
          </div>
          <div className="canvas" style={{ display: "grid", placeItems: "center" }}>
            <div className="canvas-empty__card">
              <span className="badge-pill">
                <SparkleIcon size={12} />
                Mind maps
              </span>
              <h2>Create your first mind map</h2>
              <p>Drop ideas, connect them, and open any node to take notes.</p>
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  const id = m.createMap();
                  m.setActiveId(id);
                }}
              >
                <PlusIcon size={14} />
                New mind map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
