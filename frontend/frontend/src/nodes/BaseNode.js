// src/nodes/BaseNode.js
import React from "react";
import { Handle, Position } from "reactflow";

export const BaseNode = ({
  id,
  title,
  leftHandles = [],
  rightHandles = [],
  children,
  width = 220,
  height = "auto",
}) => {
  const baseStyle = {
    width,
    minHeight: height,
    background: "#ffffff",
    border: "1px solid #111",
    borderRadius: "6px",
    padding: "8px",
    fontFamily: "sans-serif",
    position: "relative",
  };

  return (
    <div style={baseStyle}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      {leftHandles.map((h, i) => (
        <Handle
          key={h.id}
          id={h.id}
          type="target"
          position={Position.Left}
          style={{
            top: 40 + i * 20,
            background: "#000",
          }}
        />
      ))}

      <div style={{ marginTop: 8 }}>{children}</div>

      {rightHandles.map((h, i) => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={Position.Right}
          style={{
            top: 40 + i * 20,
            background: "#000",
          }}
        />
      ))}
    </div>
  );
};
