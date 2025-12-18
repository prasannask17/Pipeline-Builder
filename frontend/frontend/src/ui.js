// src/ui.js
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { MathNode } from './nodes/mathNode';
import { DateNode } from './nodes/dateNode';
import { UpperCaseNode } from './nodes/upperCaseNode';
import { RandomNumberNode } from './nodes/randomNumberNode';
import { APIRequestNode } from './nodes/apiRequestNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  input: InputNode,
  llm: LLMNode,
  output: OutputNode,
  text: TextNode,
  math: MathNode,
  date: DateNode,
  upper: UpperCaseNode,
  rand: RandomNumberNode,
  api: APIRequestNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  updateNodeData: state.updateNodeData,
  removeNodes: state.removeNodes,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    removeNodes,
  } = useStore(selector, shallow);

  useEffect(() => {
    window.__nodeTypes = nodeTypes;
  }, []);

  const getInitNodeData = (nodeID, type) => {
    let nodeData = { id: nodeID, nodeType: `${type}` };
    if (type === 'input') nodeData.inputName = nodeID;
    if (type === 'text') nodeData.text = '{{input}}';
    return nodeData;
  };

  /* ----  SELECTION: derive from nodes  ---- */
  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedCount = selectedNodes.length;

  // Delete selected nodes using store.removeNodes
  const deleteSelected = useCallback(() => {
    const ids = nodes.filter((n) => n.selected).map((n) => n.id);
    if (!ids.length) {
      console.warn('No nodes selected');
      return;
    }
    console.log('Deleting nodes:', ids);
    if (typeof removeNodes === 'function') {
      removeNodes(ids);
    } else {
      console.error('removeNodes not available in store');
    }
  }, [nodes, removeNodes]);

  // wrapper called by ReactFlow when nodes deleted (e.g. Del key)
  const handleNodesDelete = useCallback(
    (nodesToDelete) => {
      if (!Array.isArray(nodesToDelete) || nodesToDelete.length === 0) return;
      const ids = nodesToDelete.map((n) => n.id);
      console.log('onNodesDelete called for ids:', ids);
      if (typeof removeNodes === 'function') removeNodes(ids);
    },
    [removeNodes]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      let raw = event.dataTransfer.getData('application/reactflow');
      let type;
      try {
        const parsed = JSON.parse(raw);
        type = parsed?.nodeType ?? parsed;
      } catch (err) {
        type = raw;
      }

      if (!type) return;
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeID = getNodeID(type);
      const newNode = {
        id: nodeID,
        type,
        position,
        data: getInitNodeData(nodeID, type),
      };

      addNode(newNode);
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{
        width: '100vw',
        height: '80vh',       // same as when it was working
        position: 'relative', // needed for overlay
      }}
    >
      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={handleNodesDelete}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        fitView
      >
        <Background color="#ddd" gap={gridSize} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* 🔹 Delete bar overlay (no more pushing canvas down) */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '4px 8px',
          background: 'rgba(15,23,42,0.9)',
          borderRadius: 4,
          border: '1px solid #4b5563',
          fontSize: 12,
        }}
      >
        <button
          onClick={deleteSelected}
          disabled={!selectedCount}
          style={{
            padding: '2px 6px',
            fontSize: 12,
            borderRadius: 4,
            border: 'none',
            cursor: selectedCount ? 'pointer' : 'not-allowed',
            background: selectedCount ? '#ef4444' : '#6b7280',
            color: 'white',
          }}
        >
          Delete selected
        </button>
        <div style={{ color: '#9ca3af' }}>
          {selectedCount ? `${selectedCount} selected` : 'No selection'}
        </div>
      </div>
    </div>
  );
};