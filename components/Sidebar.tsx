"use client";

import { useState } from "react";
import type { MindMap } from "@/lib/types";
import {
  HomeIcon,
  StarIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  PageIcon,
  CompassIcon,
} from "./Icon";

interface Props {
  maps: MindMap[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function Sidebar({
  maps,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (m: MindMap) => {
    setEditingId(m.id);
    setDraft(m.title);
  };

  const commit = () => {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  };

  return (
    <aside className="sidebar" aria-label="Workspace">
      <div className="sidebar__top">
        <div className="sidebar__search">
          <SearchIcon size={14} />
          <input placeholder="Search" />
          <kbd>⌘K</kbd>
        </div>
      </div>

      <div className="sidebar__section">
        <button className="sidebar__row" type="button">
          <span className="sidebar__row-icon" aria-hidden>
            <HomeIcon />
          </span>
          <span className="sidebar__row-title">Home</span>
        </button>
        <button className="sidebar__row" type="button">
          <span className="sidebar__row-icon" aria-hidden>
            <StarIcon />
          </span>
          <span className="sidebar__row-title">Favorites</span>
        </button>
        <button className="sidebar__row" type="button">
          <span className="sidebar__row-icon" aria-hidden>
            <TrashIcon />
          </span>
          <span className="sidebar__row-title">Trash</span>
        </button>
      </div>

      <div className="sidebar__section">
        <div className="sidebar__heading">
          <span>Mind maps</span>
          <button
            type="button"
            aria-label="New mind map"
            onClick={onCreate}
            title="New mind map"
          >
            <PlusIcon size={12} />
          </button>
        </div>
        {maps.length === 0 && (
          <div className="sidebar__empty">No mind maps yet.</div>
        )}
        {maps.map((m) => (
          <div
            key={m.id}
            className={
              "sidebar__row" +
              (m.id === activeId ? " sidebar__row--active" : "")
            }
            role="button"
            tabIndex={0}
            onClick={() => onSelect(m.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(m.id);
            }}
            onDoubleClick={() => startEdit(m)}
          >
            <span className="sidebar__row-icon" aria-hidden>
              {m.id === activeId ? <CompassIcon /> : <PageIcon />}
            </span>
            {editingId === m.id ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="sidebar__row-input"
              />
            ) : (
              <span className="sidebar__row-title">{m.title}</span>
            )}
            <button
              className="sidebar__row-action"
              aria-label="Delete mind map"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${m.title}"?`)) onDelete(m.id);
              }}
              title="Delete"
              type="button"
            >
              <TrashIcon size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__avatar" aria-hidden>
            A
          </span>
          <div className="sidebar__user-meta">
            <strong>Alex Morgan</strong>
            <span>alex@connector.app</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
