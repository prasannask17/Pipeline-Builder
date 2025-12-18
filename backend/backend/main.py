
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

app = FastAPI()

# Allow requests from your React dev server (adjust origin if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Ping": "Pong"}

# --- models for pipeline parse ---
class Node(BaseModel):
    id: str
    type: Optional[str] = None
    position: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None

class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class PipelinePayload(BaseModel):
    nodes: List[Node] = []
    edges: List[Edge] = []

@app.post("/pipelines/parse")
async def parse_pipeline(payload: PipelinePayload):
    """
    Receives pipeline { nodes, edges }. 
    Returns: {num_nodes: int, num_edges: int, is_dag: bool}
    
    This endpoint:
    1. Counts the number of nodes
    2. Counts the number of edges
    3. Checks if the graph forms a Directed Acyclic Graph (DAG)
    """
    nodes = payload.nodes
    edges = payload.edges
    
    num_nodes = len(nodes)
    num_edges = len(edges)

    # Handle empty graph - empty graph is a valid DAG
    if num_nodes == 0:
        return {"num_nodes": 0, "num_edges": 0, "is_dag": True}

    # Build adjacency list for directed graph
    node_ids = {n.id for n in nodes}
    graph = {n.id: [] for n in nodes}
    
    # Add edges to adjacency list (only if both nodes exist)
    for e in edges:
        if e.source in node_ids and e.target in node_ids:
            graph[e.source].append(e.target)

    # Cycle detection using DFS with three colors
    # WHITE (0): unvisited
    # GRAY (1): currently being processed (in recursion stack)
    # BLACK (2): completely processed
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node_id: WHITE for node_id in graph}

    def has_cycle_dfs(node):
        """
        Performs DFS to detect cycles.
        Returns True if cycle is found, False otherwise.
        """
        if color[node] == GRAY:
            # Back edge found - cycle detected
            return True
        
        if color[node] == BLACK:
            # Already fully processed - no cycle from this node
            return False
        
        # Mark as currently being processed
        color[node] = GRAY
        
        # Visit all neighbors
        for neighbor in graph[node]:
            if has_cycle_dfs(neighbor):
                return True
        
        # Mark as completely processed
        color[node] = BLACK
        return False

    # Check for cycles starting from each unvisited node
    is_dag = True
    for node_id in graph:
        if color[node_id] == WHITE:
            if has_cycle_dfs(node_id):
                is_dag = False
                break

    return {
        "num_nodes": num_nodes, 
        "num_edges": num_edges, 
        "is_dag": is_dag
    }


# --- simple mock LLM endpoint for testing frontend LLMNode ---
class LLMRequest(BaseModel):
    model: Optional[str] = "gpt-4o"
    system: Optional[str] = "You are a helpful assistant."
    prompt: Optional[str] = ""

@app.post("/api/llm")
async def api_llm(req: LLMRequest):
    """
    Mock LLM endpoint: returns an echo response. Replace with real model call.
    """
    model = req.model or "gpt-4o"
    system = req.system or ""
    prompt = req.prompt or ""

    # Very simple "response" so frontend can display something.
    text = f"Echo from mock LLM (model={model}).\nSystem: {system[:120]}\nPrompt: {prompt[:500]}"
    return {"text": text}