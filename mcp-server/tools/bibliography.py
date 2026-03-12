"""MCP tools: bibliography search."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP

from bridge import DocumentBridge


def register_bibliography_tools(mcp: FastMCP, bridge: DocumentBridge) -> None:

    @mcp.tool()
    def search_bib(query: str, limit: int = 10) -> list[dict[str, Any]]:
        """
        Return ranked citation candidates from the bibliography store matching the query.
        Searches title, author, abstract, and keywords fields.
        """
        entries = bridge.get_bibliography()
        query_lower = query.lower()
        results = []
        for entry in entries:
            score = 0
            title = str(entry.get("title", "")).lower()
            authors = str(entry.get("authors", "")).lower()
            abstract = str(entry.get("abstract", "")).lower()
            keywords = str(entry.get("keywords", "")).lower()
            if query_lower in title:
                score += 10
            if query_lower in authors:
                score += 5
            if query_lower in abstract:
                score += 3
            if query_lower in keywords:
                score += 2
            if score > 0:
                results.append({**entry, "_score": score})
        results.sort(key=lambda e: e["_score"], reverse=True)
        return results[:limit]
