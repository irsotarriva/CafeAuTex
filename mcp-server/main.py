"""
Café AuTex — MCP Server

Exposes the document tree as a Model Context Protocol server.
Runs as a local process in offline mode, communicating with the React app
via localhost IPC (HTTP on a fixed port, default 7331).

Tools exposed:
  - get_node(id)                     Content and metadata of a specific tree node
  - get_context(cursor_node_id, token_budget)  Context string for AI completion
  - resolve_ref(label)               Node containing the given label
  - search_bib(query)                Ranked citation candidates
  - get_namespace()                  All newcommand definitions and acronym entries
  - list_assets()                    All figures/tables with captions and version metadata
  - get_timeline()                   Milestones, deadlines, open blocking annotations

Usage:
  python main.py [--port 7331]
"""

import argparse

from fastmcp import FastMCP

from tools.document import register_document_tools
from tools.bibliography import register_bibliography_tools
from tools.assets import register_asset_tools
from tools.issues import register_issue_tools
from tools.namespace import register_namespace_tools
from bridge import DocumentBridge

mcp = FastMCP(
    name="cafe-autex",
    version="0.1.0",
    description="Café AuTex document context API",
)

bridge = DocumentBridge()

register_document_tools(mcp, bridge)
register_bibliography_tools(mcp, bridge)
register_asset_tools(mcp, bridge)
register_issue_tools(mcp, bridge)
register_namespace_tools(mcp, bridge)


def main() -> None:
    parser = argparse.ArgumentParser(description="Café AuTex MCP server")
    parser.add_argument("--port", type=int, default=7331, help="Local port to listen on")
    parser.add_argument("--transport", default="stdio", choices=["stdio", "sse"],
                        help="MCP transport (stdio for Claude Code, sse for web clients)")
    args = parser.parse_args()

    if args.transport == "sse":
        mcp.run(transport="sse", host="127.0.0.1", port=args.port)
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
