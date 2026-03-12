"""MCP tools: timeline and issue tracker."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP

from bridge import DocumentBridge


def register_issue_tools(mcp: FastMCP, bridge: DocumentBridge) -> None:

    @mcp.tool()
    def get_timeline() -> dict[str, Any]:
        """
        Return milestones, submission deadline, and counts of open blocking annotations.
        Useful for project-status queries and deadline-aware AI suggestions.
        """
        return bridge.get_timeline()
