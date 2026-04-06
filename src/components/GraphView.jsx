import { useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import SelfLoopEdge from './SelfLoopEdge';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { selfloop: SelfLoopEdge };

function Flow({ nodes, edges }) {
  // Key changes when node set changes → triggers fitView
  const flowKey = useMemo(() => nodes.map(n => n.id).join(','), [nodes]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-sm font-mono">No states to display</p>
      </div>
    );
  }

  return (
    <ReactFlow
      key={flowKey}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.4, maxZoom: 1.4 }}
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={true}
      defaultEdgeOptions={{ type: 'smoothstep' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="#1e2330"
      />
      <Controls
        position="bottom-left"
        showInteractive={false}
        style={{ bottom: 16, left: 16 }}
      />
      <MiniMap
        nodeColor={n => {
          if (n.data.isPath) return '#fbbf24';
          if (n.data.isHighlighted) return '#a78bfa';
          if (n.data.isDead) return '#374151';
          return '#4f46e5';
        }}
        maskColor="#0f111788"
        position="bottom-right"
        style={{ bottom: 16, right: 16, height: 90, width: 130 }}
      />
    </ReactFlow>
  );
}

export default function GraphView({ nodes, edges }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <Flow nodes={nodes} edges={edges} />
      </div>
    </ReactFlowProvider>
  );
}
