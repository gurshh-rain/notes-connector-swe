"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import type { MindMapNode as MindMapNodeData } from "@/lib/types";
import { STICKER_COLORS } from "@/lib/types";

type NodeData = MindMapNodeData & {
  onTitleCommit?: (id: string, t: string) => void;
};

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function MindMapNodeView({ id, data, selected }: NodeProps) {
  const d = data as unknown as NodeData;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.title);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(d.title);
  }, [d.title, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const preview = stripHtml(d.note)
    .replace(/\s+/g, " ")
    .slice(0, 140);

  const swatchColor =
    d.color && d.color !== "none" ? STICKER_COLORS[d.color] : "transparent";

  return (
    <div
      className={
        "mm-node" +
        (selected ? " mm-node--selected" : "") +
        (editing ? " mm-node--editing" : "")
      }
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={{ left: "60%" }}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{ top: "40%" }}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={{ left: "60%" }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{ top: "40%" }}
      />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={{ left: "40%" }}
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{ top: "60%" }}
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={{ left: "40%" }}
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{ top: "60%" }}
      />
      <NodeResizer
        minWidth={120}
        maxWidth={480}
        minHeight={80}
        isVisible={selected || hovered}
        keepAspectRatio={false}
        color="var(--color-primary)"
      />

      {!editing && (
        <span
          className="mm-node__swatch"
          style={{ background: swatchColor }}
          aria-hidden
        />
      )}

      <div className="mm-node__body">
        {editing ? (
          <input
            ref={inputRef}
            className="mm-node__title"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setEditing(false);
              d.onTitleCommit?.(id, draft.trim() || "Untitled");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") {
                setDraft(d.title);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Untitled"
            style={{
              border: 0,
              outline: 0,
              background: "transparent",
              font: "var(--type-title)",
              fontSize: 16,
              lineHeight: 1.35,
              letterSpacing: "-0.1px",
              width: "100%",
              color: "var(--color-ink)",
            }}
          />
        ) : (
          <span className="mm-node__title" data-placeholder="Untitled">
            {d.title || "Untitled"}
          </span>
        )}
        {preview && <div className="mm-node__preview">{preview}</div>}
        {!!d.tags?.length && (
          <div className="mm-node__tags">
            {d.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MindMapNodeView);
