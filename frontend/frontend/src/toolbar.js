// src/toolbar.js
import React from "react";
import { DraggableNode } from "./draggableNode";

const NODES = [
  { type: "input", label: "Input" },
  { type: "llm", label: "LLM" },
  { type: "output", label: "Output" },
  { type: "text", label: "Text" },
  { type: "math", label: "Math" },
  { type: "date", label: "Date" },
  { type: "upper", label: "Uppercase" },
  { type: "rand", label: "Random" },
];

export const PipelineToolbar = () => {
  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        {NODES.map((n) => (
          <div key={n.type} className="toolbar-btn">
            <DraggableNode type={n.type} label={n.label} />
          </div>
        ))}
      </div>
    </div>
  );
};
