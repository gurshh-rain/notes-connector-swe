export type StickerColor =
  | "sky"
  | "purple"
  | "pink"
  | "orange"
  | "teal"
  | "green"
  | "brown"
  | "none";

export interface MindMapNode {
  id: string;
  title: string;
  note: string; // tiptap HTML
  color: StickerColor;
  tags: string[];
  isGroup?: boolean;
  parentId?: string;
  expanded?: boolean;
  position: { x: number; y: number };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface MindMap {
  id: string;
  title: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export const STICKER_COLORS: Record<Exclude<StickerColor, "none">, string> = {
  sky: "#62aef0",
  purple: "#d6b6f6",
  pink: "#ff64c8",
  orange: "#dd5b00",
  teal: "#2a9d99",
  green: "#1aae39",
  brown: "#523410",
};
