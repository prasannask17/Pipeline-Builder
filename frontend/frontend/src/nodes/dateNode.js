// src/nodes/dateNode.js
import { useEffect, useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";   

export const DateNode = ({ id, data = {} }) => {
  const [format, setFormat] = useState(data?.format ?? "iso");
  const [now, setNow] = useState(new Date());

  // tick every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // helper to get formatted date string
  const getFormatted = () =>
    format === "iso" ? now.toISOString() : now.toLocaleString();

  useEffect(() => {
    const formatted = getFormatted();

    if (typeof data.onChange === "function") {
      data.onChange({ format, value: formatted });
    }

    try {
      const { edges, updateNodeData } = useStore.getState();

      edges
        .filter((e) => e.source === id)
        .forEach((e) => {
          updateNodeData(e.target, { value: formatted });
        });
    } catch (err) {
      console.error("Error propagating DateNode value:", err);
    }
  }, [format, now, data, id]);

  return (
    <BaseNode id={id} title="Date" rightHandles={[{ id: `${id}-date` }]}>
      <div style={{ fontSize: 13 }}>
        <label>
          Format:
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="iso">ISO</option>
            <option value="locale">Locale</option>
          </select>
        </label>

        <div style={{ marginTop: 8, color: "#111", fontSize: 13 }}>
          {getFormatted()}
        </div>
      </div>
    </BaseNode>
  );
};

export default DateNode;
