"""
DocumentBridge — reads the document state from the React app.

In offline mode the React app stores everything in IndexedDB (via Dexie.js).
The bridge communicates with the app over a localhost WebSocket on a fixed
internal port (default 7332). The app pushes a serialised snapshot of the
document tree whenever it changes; the bridge caches this in memory and
serves it to MCP tool calls synchronously.

This is a stub implementation. Full IPC protocol is specified in Phase 1 of
the Notion implementation plan.
"""

from __future__ import annotations

from typing import Any


class DocumentBridge:
    """Provides read access to the current document state."""

    def __init__(self) -> None:
        # TODO(phase-1): Connect to the React app's internal IPC socket.
        self._snapshot: dict[str, Any] = {}

    def get_node(self, node_id: str) -> dict[str, Any] | None:
        """Return the node with the given ID, or None if not found."""
        nodes: dict[str, Any] = self._snapshot.get("nodes", {})
        return nodes.get(node_id)

    def get_all_nodes(self) -> dict[str, Any]:
        return self._snapshot.get("nodes", {})

    def get_bibliography(self) -> list[dict[str, Any]]:
        return self._snapshot.get("bibliography", [])

    def get_assets(self) -> list[dict[str, Any]]:
        return self._snapshot.get("assets", [])

    def get_namespace(self) -> dict[str, Any]:
        return self._snapshot.get("namespace", {"commands": [], "acronyms": []})

    def get_timeline(self) -> dict[str, Any]:
        return self._snapshot.get("timeline", {"milestones": [], "deadline": None, "blocking": []})

    def get_annotations(self) -> list[dict[str, Any]]:
        return self._snapshot.get("annotations", [])
