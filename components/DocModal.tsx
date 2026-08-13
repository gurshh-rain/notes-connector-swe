"use client";

import { CloseIcon } from "./Icon";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal__header">
          <h2 className="doc-modal__title">Connector Documentation</h2>
          <button
            type="button"
            className="doc-modal__close"
            onClick={onClose}
            aria-label="Close documentation"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="doc-modal__content">
          <section>
            <h3>Getting started</h3>
            <p>
              Connector is a local-first, canvas-based note-taking app. Each
              project is called a <strong>Mind map</strong>. Your maps are saved
              to the browser and restored when you come back.
            </p>
          </section>

          <section>
            <h3>Canvas controls</h3>
            <ul>
              <li>
                <strong>Left drag</strong> on the empty canvas to pan around.
              </li>
              <li>
                <strong>Right drag</strong> on the canvas to box-select nodes.
              </li>
              <li>
                <strong>Scroll</strong> with the mouse wheel or trackpad to zoom
                in and out.
              </li>
              <li>
                Use the <strong>Fit view</strong> button in the top-left to see
                the whole map.
              </li>
            </ul>
          </section>

          <section>
            <h3>Nodes</h3>
            <ul>
              <li>
                Click a node to open the notes side panel on the right.
              </li>
              <li>
                Double-click a node title to rename it.
              </li>
              <li>
                Click the colored dot to choose a sticker color.
              </li>
              <li>
                Add tags in the side panel and write rich-text notes with the
                editor.
              </li>
              <li>
                Resize any node or group by dragging the blue handles.
              </li>
            </ul>
          </section>

          <section>
            <h3>Connections</h3>
            <ul>
              <li>
                Drag the small square handle on any side of a node toward
                another node to connect them.
              </li>
              <li>
                Release the connector in empty space to create a new node
                automatically.
              </li>
              <li>
                Select an edge and press <strong>Delete</strong> or click
                Remove selected connection to delete it.
              </li>
            </ul>
          </section>

          <section>
            <h3>Groups</h3>
            <ul>
              <li>
                Select several nodes and press <strong>Group selected</strong>
                to wrap them in a group.
              </li>
              <li>
                Drag a node onto a group to move it inside. Children stay
                inside the group unless you use Remove from group.
              </li>
              <li>
                Click the group header arrow to collapse it into a small
                rounded pill, or expand it again.
              </li>
              <li>
                Use Add child to place a new node directly inside the group.
              </li>
            </ul>
          </section>

          <section>
            <h3>Selection and deletion</h3>
            <ul>
              <li>
                Click a node to select it.
              </li>
              <li>
                Hold <strong>Shift</strong> and click to multi-select nodes.
              </li>
              <li>
                Right-drag on the canvas to draw a selection box.
              </li>
              <li>
                Press <strong>Delete</strong> or <strong>Backspace</strong> to
                remove selected nodes or edges.
              </li>
            </ul>
          </section>

          <section>
            <h3>Undo</h3>
            <p>
              Press <strong>Ctrl + Z</strong> (or Cmd + Z on macOS) to undo the
              last change.
            </p>
          </section>

          <section>
            <h3>Mind maps and sidebar</h3>
            <ul>
              <li>
                The left sidebar lists all your mind maps.
              </li>
              <li>
                Click the <strong>New mind map</strong> button to start a new
                one.
              </li>
              <li>
                Use the workspace breadcrumb at the top to rename the active
                map.
              </li>
            </ul>
          </section>

          <section>
            <h3>Mini display</h3>
            <p>
              The bottom-right mini map shows all nodes and their connections.
              Drag the highlighted box to move the viewport. You can also click
              to jump to a location.
            </p>
          </section>

          <section>
            <h3>Theme</h3>
            <p>
              Use the sun/moon icon in the top-right to switch between light and
              dark mode.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
