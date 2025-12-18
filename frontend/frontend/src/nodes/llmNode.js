// src/nodes/llmNode.js
import React, { useEffect, useState } from "react";
import { BaseNode } from "./BaseNode";
import { Position, Handle } from "reactflow";
import { useStore } from "../store"; 

export const LLMNode = ({ id, data = {} }) => {
  const initialModel = data?.model ?? "gpt-4o";
  const initialSystem = data?.system ?? "You are a helpful assistant.";
  const initialPrompt = data?.prompt ?? "";

  const [model, setModel] = useState(initialModel);
  const [systemText, setSystemText] = useState(initialSystem);
  const [promptText, setPromptText] = useState(initialPrompt);
  const [responseText, setResponseText] = useState(data?.response ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const updateNodeData = useStore((s) => s.updateNodeData);
  const edges = useStore((s) => s.edges);
  const nodes = useStore((s) => s.nodes);

  useEffect(() => {
    if (typeof data?.onChange === "function") {
      data.onChange({
        model,
        system: systemText,
        prompt: promptText,
        response: responseText,
      });
    } else {
      if (typeof updateNodeData === "function") {
        updateNodeData(id, { model, system: systemText, prompt: promptText, response: responseText });
      }
    }
  }, [model, systemText, promptText, responseText]);

  const stop = (e) => e.stopPropagation();

  const forwardResponseToConnected = (val) => {
    if (!edges || !Array.isArray(edges)) return;
    const outgoing = edges.filter((ed) => ed.source === id);
    outgoing.forEach((ed) => {
      const targetId = ed.target;
      if (typeof updateNodeData === "function") {
        const targetNode = nodes?.find((n) => n.id === targetId);
        updateNodeData(targetId, { ...(targetNode?.data || {}), value: val });
      }
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, system: systemText, prompt: promptText }),
      });

      const text = await resp.text(); 
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }

      if (!resp.ok) {
        const bodyPreview = parsed ? JSON.stringify(parsed).slice(0, 400) : text.slice(0, 400);
        throw new Error(`LLM error ${resp.status}: ${bodyPreview}`);
      }

      const resultText = parsed?.text ?? parsed?.response ?? text;
      setResponseText(resultText);

      if (typeof updateNodeData === "function") {
        updateNodeData(id, { ...(nodes?.find(n => n.id === id)?.data || {}), response: resultText });
      }

      forwardResponseToConnected(resultText);
    } catch (err) {
      console.error("LLMNode generate error:", err);
      setError(String(err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      title="LLM"
      leftHandles={[{ id: `${id}-system`, top: 28 }, { id: `${id}-prompt`, top: 80 }]}
      rightHandles={[{ id: `${id}-response`, top: 220 }]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          Model:
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            onMouseDown={stop}
            style={{ marginLeft: 8 }}
          >
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4">gpt-4</option>
            <option value="gpt-3.5">gpt-3.5</option>
          </select>
        </label>

        <label style={{ fontSize: 12 }}>
          System prompt:
          <textarea
            value={systemText}
            rows={3}
            onChange={(e) => setSystemText(e.target.value)}
            onMouseDown={stop}
            style={{ width: "100%", marginTop: 6, resize: "vertical" }}
          />
        </label>

        <label style={{ fontSize: 12 }}>
          User prompt:
          <textarea
            value={promptText}
            rows={4}
            onChange={(e) => setPromptText(e.target.value)}
            onMouseDown={stop}
            style={{ width: "100%", marginTop: 6, resize: "vertical" }}
          />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
          <button onClick={handleGenerate} disabled={loading} style={{ padding: "6px 10px" }}>
            {loading ? "Generating…" : "Generate"}
          </button>

          {error && <div style={{ color: "crimson", fontSize: 12 }}>{error}</div>}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Response</div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              background: "#fafafa",
              padding: 8,
              borderRadius: 6,
              minHeight: 48,
              border: "1px solid #eee",
              fontSize: 13,
            }}
          >
            {responseText || <span style={{ color: "#888" }}>No response yet</span>}
          </div>
        </div>
      </div>
    </BaseNode>
  );
};

export default LLMNode;
