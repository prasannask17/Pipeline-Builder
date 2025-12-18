// src/nodes/upperCaseNode.js
import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { useStore } from "../store";
import { shallow } from "zustand/shallow";

export const UpperCaseNode = ({ id, data = {} }) => {
  const [localText, setLocalText] = useState(data?.text ?? "");

  const selector = (s) => ({
    edges: s.edges,
    updateNodeData: s.updateNodeData || s.updateNodeField,
  });

  const { edges, updateNodeData } = useStore(selector, shallow);

  const incoming = data?.input ?? localText;
  const upper = incoming ? String(incoming).toUpperCase() : "";

  useEffect(() => {
    if (typeof data.onChange === "function") {
      data.onChange({
        text: localText,
        input: data?.input,
        output: upper,
      });
    }

    if (Array.isArray(edges)) {
      const outgoing = edges.filter((e) => e.source === id);

      outgoing.forEach((edge) => {
        const targetId = edge.target;
        if (!targetId) return;

        updateNodeData(targetId, {
          value: upper,
          input: upper,
          text: upper,
        });
      });
    }
  }, [incoming, localText, data, edges, updateNodeData]);

  return (
    <div
      style={{
        width: 260,
        padding: 10,
        border: "1px solid #111",
        borderRadius: 6,
        background: "#fff",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-text-in`}
        style={{ top: 40 }}
      />

      <div style={{ fontWeight: 700, marginBottom: 6 }}>Uppercase</div>
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        Converts incoming text to <b>UPPERCASE</b>.
      </div>

      <label style={{ fontSize: 12 }}>
        Local text (if not connected):
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ width: "100%", marginTop: 4 }}
          disabled={data?.input !== undefined}
        />
      </label>

      <div style={{ marginTop: 10, fontSize: 12 }}>
        <strong>Output:</strong> {upper || "—"}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-text-out`}
        style={{ top: 70 }}
      />
    </div>
  );
};

export default UpperCaseNode;

