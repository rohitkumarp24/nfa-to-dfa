import { MarkerType } from '@xyflow/react';

/**
 * BFS-based layout: places states in columns by distance from start.
 * Returns { [stateId]: { x, y } }
 */
function bfsLayout(states, start, getNeighbors) {
  const columns = {};
  const visited = new Set();
  const queue = [[start, 0]];

  while (queue.length) {
    const [state, col] = queue.shift();
    if (visited.has(state)) continue;
    visited.add(state);
    if (!columns[col]) columns[col] = [];
    columns[col].push(state);
    getNeighbors(state).forEach(n => {
      if (!visited.has(n)) queue.push([n, col + 1]);
    });
  }

  // Handle any disconnected states
  const maxCol = Math.max(0, ...Object.keys(columns).map(Number));
  states.forEach(s => {
    if (!visited.has(s)) {
      const col = maxCol + 1;
      if (!columns[col]) columns[col] = [];
      columns[col].push(s);
    }
  });

  const positions = {};
  const X_GAP = 210;
  const Y_GAP = 130;

  Object.entries(columns).forEach(([col, stateList]) => {
    stateList.forEach((state, i) => {
      positions[state] = {
        x: parseInt(col) * X_GAP + 80,
        y: (i - (stateList.length - 1) / 2) * Y_GAP + 240,
      };
    });
  });

  return positions;
}

/**
 * Groups transitions by (from, to) pairs and collects labels.
 * Returns a map: "from|||to" → { from, to, labels[] }
 */
function buildEdgeMap(states, getTransitions) {
  const edgeMap = {};
  states.forEach(from => {
    getTransitions(from).forEach(({ to, label }) => {
      const key = `${from}|||${to}`;
      if (!edgeMap[key]) edgeMap[key] = { from, to, labels: [] };
      if (!edgeMap[key].labels.includes(label)) {
        edgeMap[key].labels.push(label);
      }
    });
  });
  return edgeMap;
}

/** Convert NFA data → ReactFlow nodes & edges */
export function nfaToFlowData(nfa) {
  const { states, alphabet, start, accept, transitions, epsilon } = nfa;

  const getNeighbors = s => {
    const ns = new Set();
    alphabet.forEach(sym => (transitions[s]?.[sym] || []).forEach(t => ns.add(t)));
    (epsilon[s] || []).forEach(t => ns.add(t));
    return [...ns];
  };

  const positions = bfsLayout(states, start, getNeighbors);

  const getTransitions = from => {
    const result = [];
    alphabet.forEach(sym =>
      (transitions[from]?.[sym] || []).forEach(to => result.push({ to, label: sym }))
    );
    (epsilon[from] || []).forEach(to => result.push({ to, label: 'ε' }));
    return result;
  };

  const edgeMap = buildEdgeMap(states, getTransitions);

  const nodes = states.map(state => ({
    id: state,
    type: 'custom',
    position: positions[state] || { x: 80, y: 240 },
    data: {
      label: state,
      isAccept: accept.includes(state),
      isStart: state === start,
      isHighlighted: false,
      isPath: false,
      isDead: false,
    },
  }));

  const edges = Object.entries(edgeMap).map(([key, { from, to, labels }]) => ({
    id: `nfa-${key}`,
    source: from,
    target: to,
    type: from === to ? 'selfloop' : 'smoothstep',
    label: from !== to ? labels.join(', ') : undefined,
    data: { label: labels.join(', ') },
    style: { stroke: '#818cf8', strokeWidth: 2 },
    labelStyle: { fill: '#c7d2fe', fontWeight: 700, fontSize: 12, fontFamily: 'IBM Plex Mono' },
    labelBgStyle: { fill: '#1e2a4a', fillOpacity: 0.95 },
    labelBgPadding: [5, 8],
    labelBgBorderRadius: 4,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8', width: 15, height: 15 },
  }));

  return { nodes, edges };
}

/** Convert DFA data → ReactFlow nodes & edges, with highlight/path support */
export function dfaToFlowData(dfa, highlightedNodes = [], pathNodes = []) {
  const { states, transitions, start, accept } = dfa;

  const getNeighbors = s => [...new Set(Object.values(transitions[s] || {}))];
  const positions = bfsLayout(states, start, getNeighbors);

  const getTransitions = from =>
    Object.entries(transitions[from] || {}).map(([label, to]) => ({ to, label }));

  const edgeMap = buildEdgeMap(states, getTransitions);

  const nodes = states.map(state => ({
    id: state,
    type: 'custom',
    position: positions[state] || { x: 80, y: 240 },
    data: {
      label: state === '∅' ? '∅' : `{${state}}`,
      isAccept: accept.includes(state),
      isStart: state === start,
      isHighlighted: highlightedNodes.includes(state),
      isPath: pathNodes.includes(state),
      isDead: state === '∅',
    },
  }));

  const edges = Object.entries(edgeMap).map(([key, { from, to, labels }]) => {
    const isHighlighted = highlightedNodes.includes(from) && highlightedNodes.includes(to);
    const isOnPath = pathNodes.includes(from) && pathNodes.includes(to);
    const stroke = isOnPath ? '#fbbf24' : isHighlighted ? '#a78bfa' : '#34d399';
    const width = isHighlighted || isOnPath ? 3 : 2;

    return {
      id: `dfa-${key}`,
      source: from,
      target: to,
      type: from === to ? 'selfloop' : 'smoothstep',
      label: from !== to ? labels.join(', ') : undefined,
      data: { label: labels.join(', ') },
      style: { stroke, strokeWidth: width },
      labelStyle: { fill: '#a7f3d0', fontWeight: 700, fontSize: 12, fontFamily: 'IBM Plex Mono' },
      labelBgStyle: { fill: '#0d2b1e', fillOpacity: 0.95 },
      labelBgPadding: [5, 8],
      labelBgBorderRadius: 4,
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 15, height: 15 },
    };
  });

  return { nodes, edges };
}
