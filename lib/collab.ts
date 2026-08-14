"use client";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import type { Awareness } from "y-protocols/awareness";
import type { MindMap } from "./types";

export interface CollabRoom {
  doc: Y.Doc;
  provider: WebrtcProvider;
  persistence: IndexeddbPersistence;
  awareness: Awareness;
  maps: Y.Map<MindMap>;
  activeId: Y.Map<string | null>;
}

const rooms = new Map<string, CollabRoom>();

export function getCollabRoom(roomId: string): CollabRoom {
  if (rooms.has(roomId)) return rooms.get(roomId)!;

  const doc = new Y.Doc();
  const provider = new WebrtcProvider(roomId, doc, {
    signaling: ["wss://signaling.yjs.dev"],
  });
  const persistence = new IndexeddbPersistence(roomId, doc);
  const maps = doc.getMap<MindMap>("maps");
  const activeId = doc.getMap<string | null>("activeId");

  const room: CollabRoom = {
    doc,
    provider,
    persistence,
    awareness: provider.awareness,
    maps,
    activeId,
  };
  rooms.set(roomId, room);
  return room;
}

export function getMaps(room: CollabRoom): MindMap[] {
  return Array.from(room.maps.values());
}

export function setMaps(room: CollabRoom, next: MindMap[]) {
  const nextIds = new Set(next.map((m) => m.id));
  for (const [id] of room.maps) {
    if (!nextIds.has(id)) {
      room.maps.delete(id);
    }
  }
  for (const m of next) {
    const existing = room.maps.get(m.id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(m)) {
      room.maps.set(m.id, m);
    }
  }
}

export function getActiveId(room: CollabRoom): string | null {
  return room.activeId.get("id") ?? null;
}

export function setActiveId(room: CollabRoom, id: string | null) {
  const existing = room.activeId.get("id");
  if (existing !== id) {
    room.activeId.set("id", id);
  }
}
