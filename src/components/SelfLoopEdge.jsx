import { EdgeLabelRenderer } from '@xyflow/react';

export default function SelfLoopEdge({ id, sourceX, sourceY, targetX, targetY, data, markerEnd, style }) {
  // Mid point between source and target handles
  const cx = (sourceX + targetX) / 2;
  const cy = Math.min(sourceY, targetY);

  // Bezier loop that goes above the node
  const loopHeight = 80;
  const spread = 45;

  const d = [
    `M ${sourceX} ${sourceY}`,
    `C ${sourceX - spread} ${cy - loopHeight}`,
    `  ${targetX + spread} ${cy - loopHeight}`,
    `  ${targetX} ${targetY}`,
  ].join(' ');

  const labelX = cx;
  const labelY = cy - loopHeight - 6;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={d}
        fill="none"
        style={style}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY}px)`,
            background: style?.stroke === '#818cf8' ? '#1e2a4a' : '#0d2b1e',
            border: `1px solid ${style?.stroke || '#818cf8'}33`,
            padding: '3px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 700,
            color: style?.stroke === '#818cf8' ? '#c7d2fe' : '#a7f3d0',
            pointerEvents: 'all',
            whiteSpace: 'nowrap',
          }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
