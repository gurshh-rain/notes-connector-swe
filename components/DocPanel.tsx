"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import type { MindMapNode, StickerColor } from "@/lib/types";
import { STICKER_COLORS } from "@/lib/types";
import {
  CloseIcon,
  TrashIcon,
  PageIcon,
  ChevronRightIcon,
  Heading1Icon,
  Heading2Icon,
  BoldIcon,
  ItalicIcon,
  StrikeIcon,
  ListBulletIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  LinkIcon,
  UndoIcon,
  RedoIcon,
} from "./Icon";

interface Props {
  node: MindMapNode;
  onClose: () => void;
  onNoteChange: (id: string, html: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onTagsChange: (id: string, tags: string[]) => void;
  onColorChange: (id: string, color: StickerColor) => void;
  onAddChildToGroup?: (groupId: string) => void;
  onToggleGroup?: (id: string) => void;
  onDelete: (id: string) => void;
}

const COLOR_KEYS: StickerColor[] = [
  "none",
  "purple",
  "pink",
  "orange",
  "teal",
  "green",
  "sky",
  "brown",
];

export default function DocPanel({
  node,
  onClose,
  onNoteChange,
  onTitleChange,
  onTagsChange,
  onColorChange,
  onAddChildToGroup,
  onToggleGroup,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(node.title);
  const [tagDraft, setTagDraft] = useState("");

  useEffect(() => {
    setTitle(node.title);
  }, [node.id, node.title]);

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    if (node.tags.includes(t)) {
      setTagDraft("");
      return;
    }
    onTagsChange(node.id, [...node.tags, t]);
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    onTagsChange(node.id, node.tags.filter((t) => t !== tag));
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder: "Press / for commands, or just start writing…",
      }),
    ],
    content: node.note || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      onNoteChange(node.id, editor.getHTML());
    },
  }, [node.id]);

  // Keep editor content in sync if the node changes externally
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== node.note) {
      editor.commands.setContent(node.note || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  if (!editor) return null;

  const swatchColor =
    node.color && node.color !== "none" ? STICKER_COLORS[node.color] : "transparent";

  return (
    <section className="doc-panel" aria-label="Node notes">
      <header className="doc-panel__header">
        <div className="doc-panel__crumbs">
          <span aria-hidden style={{ display: "inline-flex" }}>
            <PageIcon size={14} />
          </span>
          <span>Mind map</span>
          <span aria-hidden style={{ display: "inline-flex" }}>
            <ChevronRightIcon />
          </span>
          <strong>{node.title || "Untitled"}</strong>
        </div>
        <div style={{ display: "inline-flex", gap: 6 }}>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              if (confirm("Delete this node and its connections?")) {
                onDelete(node.id);
                onClose();
              }
            }}
            title="Delete node"
            aria-label="Delete node"
          >
            <TrashIcon size={14} />
          </button>
          <button
            className="btn-icon-circular"
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            style={{
              background: "var(--color-canvas-soft)",
              color: "var(--color-ink)",
            }}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </header>

      <div style={{ padding: "0 48px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 4,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: swatchColor,
              display: "inline-block",
            }}
          />
          <div className="swatch-picker" role="radiogroup" aria-label="Sticker color">
            {COLOR_KEYS.map((c) => {
              const bg = c === "none" ? "transparent" : STICKER_COLORS[c];
              return (
                <button
                  key={c}
                  role="radio"
                  aria-checked={node.color === c}
                  className={
                    "swatch" + (node.color === c ? " swatch--active" : "")
                  }
                  style={{
                    background: bg,
                    borderColor: c === "none" ? "var(--color-hairline)" : "transparent",
                  }}
                  title={c}
                  onClick={() => onColorChange(node.id, c)}
                  type="button"
                />
              );
            })}
          </div>
        </div>
      </div>

      {node.isGroup && (
        <div className="doc-panel__group-actions">
          <button
            type="button"
            className="btn-utility"
            onClick={() => onToggleGroup?.(node.id)}
          >
            {node.expanded !== false ? "Collapse" : "Expand"}
          </button>
          <button
            type="button"
            className="btn-utility"
            onClick={() => onAddChildToGroup?.(node.id)}
          >
            Add child
          </button>
        </div>
      )}

      <input
        className="doc-panel__title"
        value={title}
        placeholder="Untitled"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onTitleChange(node.id, title.trim() || "Untitled")}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      <div className="doc-panel__meta">
        Click anywhere below to start writing. Edits are saved automatically.
      </div>

      <div className="doc-panel__tags">
        {node.tags.map((t) => (
          <span key={t} className="tag">
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              aria-label={`Remove ${t}`}
              title={`Remove ${t}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}
        <input
          className="doc-panel__tag-input"
          placeholder="Add a tag…"
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
            if (e.key === "Escape") setTagDraft("");
          }}
          onBlur={() => {
            if (tagDraft.trim()) addTag();
          }}
        />
      </div>

      <div className="doc-panel__editor">
        <EditorContent editor={editor} />
      </div>

      <div className="doc-panel__formatbar" role="toolbar" aria-label="Formatting">
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("heading", { level: 1 }) ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1Icon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("heading", { level: 2 }) ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2Icon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("bold") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("italic") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("strike") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <StrikeIcon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("bulletList") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bulleted list"
        >
          <ListBulletIcon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("orderedList") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrderedIcon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("blockquote") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <QuoteIcon />
        </button>
        <button
          type="button"
          className={"btn-ghost" + (editor.isActive("codeBlock") ? " is-active" : "")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          <CodeIcon />
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          title="Link"
        >
          <LinkIcon />
        </button>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <RedoIcon />
        </button>
      </div>
    </section>
  );
}
