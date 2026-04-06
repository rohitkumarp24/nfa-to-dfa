import { Handle, Position } from '@xyflow/react';

export default function CustomNode({ data }) {
  const { label, isAccept, isStart, isHighlighted, isPath, isDead } = data;

  // Determine colors based on state
  let border = '2px solid #4f46e5';
  let bg = '#1a1f35';
  let color = '#c7d2fe';
  let glow = 'none';

  if (isDead) {
    border = '2px solid #374151';
    bg = '#111827';
    color = '#4b5563';
  }
  if (isHighlighted) {
    border = '2px solid #a78bfa';
    bg = '#2e1f5e';
    color = '#e9d5ff';
    glow = '0 0 16px #a78bfa88';
  }
  if (isPath) {
    border = '2px solid #fbbf24';
    bg = '#2a1f0a';
    color = '#fde68a';
    glow = '0 0 16px #fbbf2488';
  }

  const size = 64;

  return (
    <>
      {/* Invisible handles so ReactFlow can connect edges */}
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Start state arrow */}
        {isStart && (
          <div style={{
            position: 'absolute',
            left: -38,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#818cf8',
            fontSize: 20,
            fontWeight: 900,
            lineHeight: 1,
          }}>
            ▶
          </div>
        )}

        {/* Accept state outer ring */}
        {isAccept && (
          <div style={{
            position: 'absolute',
            width: size + 10,
            height: size + 10,
            borderRadius: '50%',
            border,
            opacity: 0.6,
          }} />
        )}

        {/* Main circle */}
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border,
          background: bg,
          boxShadow: glow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: label.length > 6 ? 9 : label.length > 4 ? 10 : 12,
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          color,
          textAlign: 'center',
          padding: 4,
          userSelect: 'none',
          transition: 'all 0.3s ease',
          cursor: 'default',
          lineHeight: 1.2,
        }}>
          {label}
        </div>
      </div>
    </>
  );
}
