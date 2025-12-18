// src/App.js
import React, { useCallback, useState } from "react";

import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";
import { SubmitButton } from "./submit";

/* Import your nodes (named exports) */
import { InputNode } from "./nodes/inputNode";
import { LLMNode } from "./nodes/llmNode";
import { OutputNode } from "./nodes/outputNode";
import { TextNode } from "./nodes/textNode";
import { MathNode } from "./nodes/mathNode";
import { DateNode } from "./nodes/dateNode";
import { UpperCaseNode } from "./nodes/upperCaseNode";
import { RandomNumberNode } from "./nodes/randomNumberNode";
// import { APIRequestNode } from "./nodes/apiRequestNode";

/* nodeTypes map for React Flow */
const nodeTypes = {
  Input: InputNode,
  llm: LLMNode,
  output: OutputNode,
  text: TextNode,
  math: MathNode,
  date: DateNode,
  upper: UpperCaseNode,
  rand: RandomNumberNode,
  // api: APIRequestNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // update node data
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  }, []);

  // add node when clicking toolbar button
  const addNode = useCallback(
    (type) => {
      const id = `${type}-${Date.now()}`;
      const newNode = {
        id,
        type,
        position: { x: 200, y: 200 },
        data: {
          onChange: (updated) => updateNodeData(id, updated),
          ...(type === "input" ? { inputName: id, inputType: "Text" } : {}),
          ...(type === "text" ? { text: "{{input}}" } : {}),
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [updateNodeData]
  );

  return (
    <div className="app-root">
      {/* Top bar */}
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo-dot" />
          <span className="app-title" style={{ color: "#9ca3af" }}>
            Pipeline Builder
          </span>
        </div>

        {/* Toolbar buttons */}
        <PipelineToolbar onAddNode={addNode} />
      </header>

      {/* Main section: canvas + bottom submit row */}
      <main className="app-main">
        <section className="canvas-wrapper">
          <PipelineUI
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            nodeTypes={nodeTypes}
            updateNodeData={updateNodeData}
          />
        </section>

        <footer className="submit-bar">
          <SubmitButton nodes={nodes} edges={edges} />
        </footer>
      </main>
    </div>
  );
}

export default App;
