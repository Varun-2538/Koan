from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List

from agno.agent import Agent
from agno.models.anthropic import Claude

# NOTE: If your agno installation names or import paths differ, adjust accordingly.

@dataclass
class NodeSpec:
    """Represents a single node in the generated flow graph."""

    id: str
    type: str
    params: Dict[str, Any]


@dataclass
class NodeFlow:
    """High-level representation of the full node flow returned by the agent."""

    description: str
    nodes: List[NodeSpec]
    edges: List[Dict[str, str]]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "description": self.description,
            "nodes": [asdict(n) for n in self.nodes],
            "edges": self.edges,
        }


class ArchitectureMapperAgent:
    """Agent that converts natural-language DeFi requirements into a structured node-flow JSON.

    Example usage
    -------------
    >>> agent = ArchitectureMapperAgent()
    >>> flow = await agent.map_user_idea(
    ...     "Create a swap application for ETH, USDC, WBTC with slippage protection"
    ... )
    >>> print(flow.to_dict())
    """

    def __init__(
        self,
        model_id: str = "claude-sonnet-4-20250514",
        temperature: float = 0.0,
    ) -> None:
        # Initialize underlying LLM via agno-agi.
        claude = Claude(id=model_id, temperature=temperature)

        self._agent = Agent(
            model=claude,
            instructions=self._system_prompt(),
            name="ArchitectureMapperAgent",
            markdown=False,
            stream=False,
        )

    @staticmethod
    def _system_prompt() -> str:
        """Detailed prompt sent as system instructions to the LLM."""
        return (
            "You are an expert DeFi architecture mapper. "
            "Given a user's natural-language request, extract the following as JSON:\n"
            "  description: brief summary\n"
            "  nodes: list of node specifications. Each node spec has:\n"
            "    id: unique slug (string, lowercase, hyphen-separated)\n"
            "    type: node type (e.g. wallet, token_selector, dex_quote)\n"
            "    params: object with key/value parameters relevant to the node\n"
            "  edges: list of edges where each edge is {\"from\": node_id, \"to\": node_id}\n"
            "Respond ONLY with valid JSON (no markdown)."
        )

    async def map_user_idea(self, user_input: str) -> NodeFlow:
        """Main public API: convert *user_input* into a NodeFlow object."""
        # Run the agent synchronously; agno returns an iterator of messages.
        messages = self._agent.run(user_input)

        content = "".join([m.content for m in messages]) if isinstance(messages, list) else str(messages)

        data = self._extract_json(content)

        nodes = [NodeSpec(**n) for n in data.get("nodes", [])]
        edges = data.get("edges", [])
        description = data.get("description", "")
        return NodeFlow(description=description, nodes=nodes, edges=edges)

    @staticmethod
    def _extract_json(text: str) -> Dict[str, Any]:
        """Extract the first JSON object found in *text* and return it as a dict."""
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("ArchitectureMapperAgent did not return JSON-formatted output. Got: " + text[:200])
        return json.loads(match.group(0))