// src/submit.js
import React from "react";
import { useStore } from "./store";

function computeAndForward(nodes, edges, updateNodeData) {
  const outMap = {};
  (edges || []).forEach((e) => {
    if (!outMap[e.source]) outMap[e.source] = [];
    outMap[e.source].push(e);
  });

  (nodes || []).forEach((n) => {
    if (n.type !== "math") return;

    const a = Number(n.data?.a ?? 0);
    const b = Number(n.data?.b ?? 0);
    const op = n.data?.op ?? "add";
    let res;
    if (op === "add") res = a + b;
    else if (op === "sub") res = a - b;
    else if (op === "mul") res = a * b;
    else if (op === "div") res = b === 0 ? null : a / b;

    if (typeof updateNodeData === "function") {
      updateNodeData(n.id, { ...(n.data || {}), result: res });
    }

    const outs = outMap[n.id] || [];
    outs.forEach((edge) => {
      const targetId = edge.target;
      if (typeof updateNodeData === "function") {
        updateNodeData(targetId, { ...(nodes.find((x) => x.id === targetId)?.data || {}), value: res });
      }
    });
  });
}

export const SubmitButton = () => {
  const getState = useStore.getState;
  const nodes = () => getState().nodes;
  const edges = () => getState().edges;
  const updateNodeData = (id, d) => getState().updateNodeData(id, d);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const n = nodes();
    const ed = edges();

    computeAndForward(n, ed, updateNodeData);

    const updatedNodes = getState().nodes;
    const updatedEdges = getState().edges;

    try {
       const resp = await fetch("http://localhost:8000/pipelines/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: updatedNodes, edges: updatedEdges }),
      });

      const json = await resp.json();
      alert(`Nodes: ${json.num_nodes}\nEdges: ${json.num_edges}\nIs DAG: ${json.is_dag}`);
    } catch (err) {
      console.error("Submit failed", err);
      alert("Submit failed — see console.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={handleSubmit} type="button">
        Submit
      </button>
    </div>
  );
};

export default SubmitButton;
