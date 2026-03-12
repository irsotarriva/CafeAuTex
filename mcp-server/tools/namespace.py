"""MCP tools: command namespace and acronym table."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP

from bridge import DocumentBridge


def register_namespace_tools(mcp: FastMCP, bridge: DocumentBridge) -> None:

    @mcp.tool()
    def get_namespace() -> dict[str, Any]:
        """
        Return all \\newcommand definitions and acronym entries as a compact table.
        Used by AI completion to avoid inventing commands that conflict with defined ones.
        """
        return bridge.get_namespace()
