import { Handle, Position } from '@xyflow/react';
import { useEffect, useState } from 'react';

export default function CustomNode({ data }) {
  const { label, isAccept, isStart, isHighlighted, isPath, isDead } = data;
  const [pulse, setPulse] = useState(false);

  // Trigger pulse animation whenever node becomes highlighted
  useEffect(() => {
    if (isHighlighted || isPath) {
      setPulse(false);
      const t = setTimeout(() => setPulse(true), 10);
      return () => clearTimeout(t);
    } else {
      setPulse(false);
    }
  }, [isHighlighted, isPath]);

  let border = '2px solid #4f46e5';
  let bg = '#1a1f35';
  let color = '#c7d2fe';
  let glow = 'none';
  let transform = 'scale(1)';

  if (isDead) {
    border = '2px solid #374151';
    bg = '#111827';
    color = '#4b5563';
  }
  if (isHighlighted) {
    border = '2px solid #a78bfa';
    bg = '#2e1f5e';
    color = '#e9d5ff';
    glow = '0 0 20px #a78bfa99';
    transform = pulse ? 'scale(1.12)' : 'scale(1)';
  }
  if (isPath) {
    border = '2px solid #fbbf24';
    bg = '#2a1f0a';
    color = '#fde68a';
    glow = '0 0 20px #fbbf2499';
    transform = pulse ? 'scale(1.12)' : 'scale(1)';
  }

  const size = 64;

  return (
    <>
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          }}>▶</div>
        )}

        {/* Ripple ring — shows on highlight/path */}
        {(isHighlighted || isPath) && pulse && (
          <div style={{
            position: 'absolute',
            width: size + 24,
            height: size + 24,
            borderRadius: '50%',
            border: `2px solid ${isPath ? '#fbbf24' : '#a78bfa'}`,
            animation: 'ripple 0.6s ease-out forwards',
            pointerEvents: 'none',
          }} />
        )}

        {isAccept && (
          <div style={{
            position: 'absolute',
            width: size + 10,
            height: size + 10,
            borderRadius: '50%',
            border,
            opacity: 0.6,
            transition: 'all 0.3s ease',
          }} />
        )}

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
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform,
          cursor: 'default',
          lineHeight: 1.2,
        }}>
          {label}
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </>
  );
}
