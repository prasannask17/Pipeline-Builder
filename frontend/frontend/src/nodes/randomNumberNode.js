// src/nodes/randomNumberNode.js
import React, { useEffect, useState } from "react";
import { useStore } from "../store";
import { shallow } from "zustand/shallow";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";

export const RandomNumberNode = ({ id, data = {} }) => {
  const [n, setN] = useState(data?.n ?? Math.floor(Math.random() * 100));

  
  const selector = (s) => ({
    edges: s.edges,
    updateNodeData: s.updateNodeData || s.updateNodeField,
  });
  const { edges, updateNodeData } = useStore(selector, shallow);

  
  const forwardValue = (val) => {
    if (!Array.isArray(edges) || typeof updateNodeData !== "function") return;
    const outgoing = edges.filter((e) => e.source === id);
    outgoing.forEach((edge) => {
      if (!edge.target) return;
      updateNodeData(edge.target, { value: val, result: val });
    });
  };

  
  useEffect(() => {
    if (typeof data?.onChange === "function") {
      data.onChange({ n });
    }
    forwardValue(n);
  }, [n]);

  const regen = (e) => {
    e?.stopPropagation(); 
    const r = Math.floor(Math.random() * 100);
    setN(r);
  };

  return (
    <BaseNode id={id} title="Random" rightHandles={[{ id: `${id}-out`, top: 40 }]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{n}</div>
        <button
          onClick={regen}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ padding: "6px 8px", borderRadius: 6 }}
        >
          Regenerate
        </button>
      </div>

      <Handle type="source" position={Position.Right} id={`${id}-out`} style={{ top: 40, background: "#111" }} />
    </BaseNode>
  );
};

export default RandomNumberNode;

