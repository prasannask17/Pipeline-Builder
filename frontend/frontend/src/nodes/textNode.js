// src/nodes/textNode.js
import { useState, useEffect, useRef } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";  

export const TextNode = ({ id, data = {} }) => {
  const [text, setText] = useState(data.text || "");
  const [vars, setVars] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    const found = [];
    const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    let m;

    while ((m = regex.exec(text))) {
      const v = m[1];
      if (!found.includes(v)) {
        found.push(v);
      }
    }

    setVars(found);

    if (data.onChange) {
      data.onChange({
        text,
        variables: found,
      });
    }

    try {
      const { edges, updateNodeData } = useStore.getState();
      const varsText = found.length ? found.join(", ") : "";

      edges
        .filter((e) => e.source === id)
        .forEach((e) => {
          updateNodeData(e.target, { value: varsText });
        });
    } catch (err) {
      console.error("Error propagating vars from TextNode:", err);
    }
  }, [text, data, id]);

  const leftHandles = vars.map((v) => ({
    id: `${id}-var-${v}`,
    label: v,
  }));

  return (
    <BaseNode
      id={id}
      title="Text"
      leftHandles={leftHandles}
      rightHandles={[{ id: `${id}-out` }]}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          minHeight: 60,
          maxHeight: 300,
          borderRadius: 6,
          padding: 8,
          border: "1px solid #ddd",
          fontFamily: "monospace",
          fontSize: 13,
          resize: "none",
          overflow: "auto",
        }}
        placeholder="Type something. Use {{var}} to add handles."
      />
      <div
        style={{
          fontSize: 11,
          marginTop: 5,
          color: "#555",
          wordBreak: "break-word",
          maxWidth: "100%",
        }}
      >
        Vars: {vars.length > 0 ? vars.join(", ") : "none"}
      </div>
    </BaseNode>
  );
};
