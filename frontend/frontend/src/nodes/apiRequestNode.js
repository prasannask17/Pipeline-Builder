// // src/nodes/apiRequestNode.js
// import React, { useCallback, useEffect, useState } from "react";
// import { Handle, Position } from "reactflow";
// import { useStore } from "../store";
// import { shallow } from "zustand/shallow";
// import { BaseNode } from "./BaseNode";

// export const APIRequestNode = ({ id, data = {} }) => {
//   const [url, setUrl] = useState(data?.url ?? "https://api.example.com/data");
//   const [loading, setLoading] = useState(false);
//   const [lastResponse, setLastResponse] = useState(data?.lastResponse ?? null);
//   const [error, setError] = useState(null);

//   const selector = (s) => ({
//     edges: s.edges,
//     updateNodeData: s.updateNodeData || s.updateNodeField,
//   });
//   const { edges, updateNodeData } = useStore(selector, shallow);

//   useEffect(() => {
//     if (typeof data?.onChange === "function") {
//       data.onChange({ url, lastResponse });
//     }
//   }, [url, lastResponse, data]);

//   const forwardToTargets = useCallback((payload) => {
//     if (!Array.isArray(edges) || typeof updateNodeData !== "function") return;
//     const outgoing = edges.filter((e) => e.source === id);
//     outgoing.forEach((edge) => {
//       const targetId = edge.target;
//       if (!targetId) return;
//       updateNodeData(targetId, { value: payload, result: payload });
//     });
//   }, [edges, updateNodeData, id]);

//   const doFetch = async (ev) => {
//     ev?.stopPropagation(); 
//     setLoading(true);
//     setError(null);
//     setLastResponse(null);

//     try {
//       const res = await fetch(url, { method: "GET" });

//       let payload;
//       const contentType = res.headers.get("content-type") || "";
//       if (contentType.includes("application/json")) {
//         payload = await res.json();
//       } else {
//         payload = await res.text();
//       }

//       const display = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
//       setLastResponse(display);

//       const forwarded = (typeof payload === "string" || typeof payload === "number")
//         ? payload
//         : JSON.stringify(payload);
//       forwardToTargets(forwarded);
//     } catch (err) {
//       setError(String(err));
//       console.error("APIRequestNode fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <BaseNode id={id} title="API Request" rightHandles={[{ id: `${id}-out`, top: 40 }]}>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         <input
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//           onMouseDown={(e) => e.stopPropagation()}
//           style={{ padding: "6px 8px", borderRadius: 6, width: "100%" }}
//         />

//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             onClick={doFetch}
//             onMouseDown={(e) => e.stopPropagation()}
//             disabled={loading}
//             style={{ padding: "6px 10px", borderRadius: 6 }}
//           >
//             {loading ? "Fetching..." : "Fetch"}
//           </button>

//           <button
//             onClick={(e) => { e.stopPropagation(); setLastResponse(null); setError(null); }}
//             style={{ padding: "6px 10px", borderRadius: 6 }}
//           >
//             Clear
//           </button>
//         </div>

//         <div style={{ fontSize: 12, color: "#666" }}>Performs GET → forwards response to connected nodes</div>

//         <div style={{ marginTop: 8 }}>
//           <div style={{ fontWeight: 700, marginBottom: 6 }}>Response</div>
//           <div style={{
//             minHeight: 48,
//             background: "#f4f4f4",
//             padding: 8,
//             borderRadius: 6,
//             whiteSpace: "pre-wrap",
//             border: "1px solid #e6e6e6",
//             fontSize: 12
//           }}>
//             {error ? `Error: ${error}` : (lastResponse ?? "—")}
//           </div>
//         </div>
//       </div>

//       <Handle type="source" position={Position.Right} id={`${id}-out`} style={{ top: 40, background: "#111" }} />
//     </BaseNode>
//   );
// };

// export default APIRequestNode;

