"use client";

import { memo } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import type { StickerColor } from "@/lib/types";
import { STICKER_COLORS } from "@/lib/types";
import { ChevronRightIcon, ChevronDownIcon } from "./Icon";

type GroupData = {
  id: string;
  title: string;
  color: StickerColor;
  expanded: boolean;
  onToggle?: (id: string) => void;
  onAddChild?: (id: string) => void;
};

function GroupNodeView({ id, data, selected }: NodeProps) {
  const d = data as unknown as GroupData;
  const swatchColor =
    d.color && d.color !== "none" ? STICKER_COLORS[d.color] : "transparent";

  return (
    <div
      className={
        "group-node" +
        (selected ? " group-node--selected" : "") +
        (d.expanded ? " group-node--expanded" : " group-node--collapsed")
      }
    >
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
      />

      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={48}
        lineStyle={{ borderColor: "var(--color-primary)" }}
        handleStyle={{ background: "var(--color-primary)" }}
      />

      <div className="group-node__header">
        <span
          className="group-node__swatch"
          style={{ background: swatchColor }}
          aria-hidden
        />
        <span className="group-node__title">{d.title || "Untitled"}</span>
        <button
          type="button"
          className="group-node__btn"
          onClick={(e) => {
            e.stopPropagation();
            d.onToggle?.(id);
          }}
          title={d.expanded ? "Collapse" : "Expand"}
          aria-label={d.expanded ? "Collapse" : "Expand"}
        >
          {d.expanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
        </button>
        <button
          type="button"
          className="group-node__btn"
          onClick={(e) => {
            e.stopPropagation();
            d.onAddChild?.(id);
          }}
          title="Add child node"
          aria-label="Add child node"
        >
          + child
        </button>
      </div>
    </div>
  );
}

export default memo(GroupNodeView);
