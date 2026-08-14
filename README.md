# Note Taking Connector

A local-first, canvas-based note-taking app for mapping out ideas. Built with Next.js, React, TypeScript, and React Flow.

## Features

- Infinite canvas with pan, zoom, and fit-view
- Create, edit, and delete nodes with rich text notes
- Connect nodes from any side with smooth-step edges
- Drag a connector into empty space to spawn a new node
- Group selected nodes into resizable groups
- Drag nodes into existing groups; clamp children inside groups
- Remove a node from its group via the side panel
- Box select, shift multi-select, and keyboard deletion
- Collapsible and resizable group nodes
- Color-coded sticker nodes and tags
- Undo with Ctrl+Z
- Mini-map with node and edge overview
- Auto-saves to browser localStorage
- Real-time collaboration with shareable links and live cursors

## Tech Stack

- [Next.js](https://nextjs.org/) 16.3.0
- [React](https://react.dev/) 19.2.8
- [TypeScript](https://www.typescriptlang.org/)
- [React Flow](https://xyflow.com/) 12.11.3
- [Tiptap](https://tiptap.dev/) for rich-text notes

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:

```bash
npm run build
```

## Controls

- **Left drag** on the canvas to pan
- **Right drag** on the canvas to box-select
- **Shift + click** to multi-select nodes
- **Delete / Backspace** to remove selected nodes or edges
- **Ctrl + Z** to undo the last change
- **Drag a node's handle** to create a connection, or release in empty space to create a new node
- **Double-click** a node title to rename
- **Click** a node to open the notes side panel

## Future Goals

- Cloud sync and multi-device support
- Custom node shapes and templates
- Markdown import / export
- Image and file attachments on nodes
- Full-text search across all maps and notes
- Edge labels and directional arrows
- Keyboard shortcuts and command palette
- Offline PWA support
- Mobile-optimized touch interactions
