// src/store.js
import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},

  getNodeID: (type) => {
    const newIDs = { ...(get().nodeIDs || {}) };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: true,
          markerEnd: { type: MarkerType.Arrow, height: "20px", width: "20px" },
        },
        get().edges
      ),
    });
  },

  // simple helper you already had (keep it)
  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...(node.data || {}), [fieldName]: fieldValue };
        }
        return node;
      }),
    });
  },

  // NEW: generic update of node.data by merging newData into node.data
  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...(node.data || {}),
              ...(newData || {}),
            },
          };
        }
        return node;
      }),
    });
  },

  // NEW: remove nodes by ids
  removeNodes: (ids = []) => {
    set({
      nodes: get().nodes.filter((n) => !ids.includes(n.id)),
      edges: get().edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
    });
  },

  // NEW: remove single node by id
  // inside create(...) return object in store.js
removeNodes: (ids) => {
  if (!Array.isArray(ids)) return;
  set({
    nodes: get().nodes.filter((n) => !ids.includes(n.id)),
    edges: get().edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
  });
},
}));

