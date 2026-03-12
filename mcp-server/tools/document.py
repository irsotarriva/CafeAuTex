"""MCP tools: document tree access."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP

from bridge import DocumentBridge


def register_document_tools(mcp: FastMCP, bridge: DocumentBridge) -> None:

    @mcp.tool()
    def get_node(id: str) -> dict[str, Any] | None:
        """Return the content and metadata of a specific document tree node by ID."""
        return bridge.get_node(id)

    @mcp.tool()
    def get_context(cursor_node_id: str, token_budget: int = 4096) -> str:
        """
        Assemble a context string for AI completion by traversing the document tree
        outward from the cursor node. Includes command namespace and acronym table
        automatically. Respects the token budget (approximate character limit).
        """
        # TODO(phase-2): Implement tree traversal and context serialisation.
        node = bridge.get_node(cursor_node_id)
        if node is None:
            return f"[Node {cursor_node_id} not found]"
        ns = bridge.get_namespace()
        lines: list[str] = [
            f"# Current node: {cursor_node_id}",
            f"# Node type: {node.get('type', 'unknown')}",
            "",
            "# Command namespace",
            str(ns),
        ]
        return "\n".join(lines)[:token_budget]

    @mcp.tool()
    def resolve_ref(label: str) -> dict[str, Any] | None:
        """Return the node containing the given LaTeX label, enabling cross-reference queries."""
        for node in bridge.get_all_nodes().values():
            if node.get("label") == label:
                return node
        return None
