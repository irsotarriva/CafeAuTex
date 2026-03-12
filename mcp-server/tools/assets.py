"""MCP tools: asset listing."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP

from bridge import DocumentBridge


def register_asset_tools(mcp: FastMCP, bridge: DocumentBridge) -> None:

    @mcp.tool()
    def list_assets() -> list[dict[str, Any]]:
        """
        Return all figures and tables with their captions, labels, and active version metadata.
        """
        return bridge.get_assets()
