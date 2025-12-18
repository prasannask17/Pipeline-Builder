// src/nodes/inputNode.js
import React, { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";   

export const InputNode = ({ id, data = {} }) => {
  const defaultName = data?.inputName ?? id.replace(/^customInput-?/, "");
  const [name, setName] = useState(defaultName);
  const [type, setType] = useState(data?.inputType ?? "Text");

  useEffect(() => {
    if (typeof data?.onChange === "function") {
      data.onChange({ inputName: name, inputType: type });
    }

    try {
      const { edges, updateNodeData } = useStore.getState();
      edges
        .filter((e) => e.source === id)
        .forEach((e) => {
          updateNodeData(e.target, { value: name });
        });
    } catch (err) {
      console.error("Error propagating value from InputNode:", err);
    }
  }, [name, type, data, id]);

  return (
    <BaseNode id={id} title="Input" rightHandles={[{ id: `${id}-value` }]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="nodrag"
            style={{
              marginLeft: 6,
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #e6e9ef",
            }}
          />
        </label>

        <label
          style={{
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Type:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="nodrag"
            style={{
              marginLeft: 6,
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #e6e9ef",
            }}
          >
            <option value="Text">Text</option>
            <option value="File">File</option>
            <option value="Number">Number</option>
          </select>
        </label>
      </div>
    </BaseNode>
  );
};

export default InputNode;
