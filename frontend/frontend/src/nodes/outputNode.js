// src/nodes/outputNode.js
import React, { useEffect, useState } from "react";
import { BaseNode } from "./BaseNode";

export const OutputNode = ({ id, data = {} }) => {
    const [name, setName] = useState(data.outputName ?? id);
    const [type, setType] = useState(data.outputType ?? "Text");

    const displayValue = data?.value !== undefined 
                         ? data.value 
                         : data?.result; 

    useEffect(() => {
        if (data?.outputName && data.outputName !== name) setName(data.outputName);
        if (data?.outputType && data.outputType !== type) setType(data.outputType);
    }, [data?.outputName, data?.outputType]);

    useEffect(() => {
        if (typeof data.onChange === "function") {
            data.onChange({ outputName: name, outputType: type, value: displayValue });
        }
    }, [name, type, displayValue]); 

    return (
        <BaseNode id={id} title="Output" leftHandles={[{ id: `${id}-value` }]}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    Name:
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginLeft: 6 }}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </label>

                <label style={{ fontSize: 12, marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    Type:
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{ marginLeft: 6 }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <option value="Text">Text</option>
                        <option value="Image">Image</option>
                    </select>
                </label>

                <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Value</div>
                    <div
                        style={{
                            marginTop: 6,
                            minHeight: 48,
                            background: "#f4f4f4",
                            padding: 8,
                            borderRadius: 6,
                            whiteSpace: "pre-wrap",
                            border: "1px solid #e6e6e6",
                        }}
                    >
                        {typeof displayValue !== "undefined" && displayValue !== null ? String(displayValue) : "—"}
                    </div>
                </div>
            </div>
        </BaseNode>
    );
};

export default OutputNode;