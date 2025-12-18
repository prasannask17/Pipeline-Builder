// src/nodes/mathNode.js
import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position } from "reactflow";

import { useStore } from "../store";
import { shallow } from "zustand/shallow";

export const MathNode = ({ id, data = {} }) => {
  const [localA, setLocalA] = useState(String(data?.localA ?? "0"));
  const [localB, setLocalB] = useState(String(data?.localB ?? "0"));
  const [op, setOp] = useState(data?.op ?? "add");
  const [result, setResult] = useState(data?.result ?? 0);

  const selector = (s) => ({
    nodes: s.nodes,
    edges: s.edges,
    updateNodeData: s.updateNodeData || s.updateNodeField, 
  });
  const { edges, updateNodeData } = useStore(selector, shallow);

  const parseNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const a = data?.inputA !== undefined ? Number(data.inputA) : parseNumber(localA);
  const b = data?.inputB !== undefined ? Number(data.inputB) : parseNumber(localB);

  useEffect(() => {
    let res = 0;

    if (op === "div" && b === 0) {
      res = null;
    } else if (op === "add") {
      res = a + b;
    } else if (op === "sub") {
      res = a - b;
    } else if (op === "mul") {
      res = a * b;
    } else if (op === "div") {
      res = a / b;
    }

    setResult(res);

    if (typeof data.onChange === "function") {
      data.onChange({
        localA,
        localB,
        inputA: data?.inputA, 
        inputB: data?.inputB,
        op,
        result: res,
      });
    }

    if (Array.isArray(edges) && typeof updateNodeData === "function") {
      const outgoing = edges.filter((e) => e.source === id);

      outgoing.forEach((edge) => {
        const targetId = edge.target;
        if (!targetId) return;
        updateNodeData(targetId, { ...({}), value: res, result: res });
      });
    }
  }, [a, b, op, localA, localB, data, edges, updateNodeData]);

  return (
    <div style={{ width: 360, padding: 10, border: "1px solid #111", borderRadius: 6, background: "#fff" }}>
      <Handle type="target" position={Position.Left} id={`${id}-input-a`} style={{ top: 28, background: "#999" }} />
      <Handle type="target" position={Position.Left} id={`${id}-input-b`} style={{ top: 68, background: "#999" }} />

      <div style={{ fontWeight: 700, marginBottom: 8 }}>Math</div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          a:
          <input
            value={data?.inputA !== undefined ? data.inputA : localA}
            onChange={(e) => setLocalA(e.target.value)}
            style={{ width: 80 }}
            disabled={data?.inputA !== undefined}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          op:
          <select value={op} onChange={(e) => setOp(e.target.value)} style={{ marginLeft: 6 }}>
            <option value="add">Add</option>
            <option value="sub">Subtract</option>
            <option value="mul">Multiply</option>
            <option value="div">Divide</option>
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          b:
          <input
            value={data?.inputB !== undefined ? data.inputB : localB}
            onChange={(e) => setLocalB(e.target.value)}
            style={{ width: 80 }}
            disabled={data?.inputB !== undefined}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </label>
      </div>

      <div style={{ marginTop: 6, fontSize: 13 }}>
        <strong>Result:</strong> {result === null ? "∞" : String(result)}
      </div>

      <Handle type="source" position={Position.Right} id={`${id}-result`} style={{ top: 58, background: "#111" }} />
    </div>
  );
};

export default MathNode;
