/**
 * Computes the epsilon-closure of a set of NFA states.
 * Returns a sorted array of all states reachable via ε-transitions.
 */
export function epsilonClosure(states, nfa) {
  const stack = [...states];
  const closure = new Set(states);

  while (stack.length) {
    const state = stack.pop();
    const eps = (nfa.epsilon?.[state]) || [];
    for (const t of eps) {
      if (!closure.has(t)) {
        closure.add(t);
        stack.push(t);
      }
    }
  }
  return [...closure].sort();
}

/**
 * Computes the set of NFA states reachable from `states` on `symbol`.
 */
export function move(states, symbol, nfa) {
  const result = new Set();
  for (const state of states) {
    ((nfa.transitions[state]?.[symbol]) || []).forEach(t => result.add(t));
  }
  return [...result];
}

/**
 * Subset Construction Algorithm.
 * Converts an NFA to an equivalent DFA.
 * Returns: { start, states, stateMap, transitions, accept, steps }
 */
export function subsetConstruction(nfa) {
  const DEAD = '∅';

  const startClosure = epsilonClosure([nfa.start], nfa);
  const startKey = startClosure.length ? startClosure.join(',') : DEAD;

  // Map from DFA state key → array of NFA states it represents
  const stateMap = new Map([[startKey, startClosure]]);
  const transitions = {};
  const visited = new Set();
  const queue = [startKey];
  const steps = [];

  while (queue.length) {
    const key = queue.shift();
    if (visited.has(key)) continue;
    visited.add(key);
    transitions[key] = {};

    const currentNFAStates = stateMap.get(key) || [];

    for (const sym of nfa.alphabet) {
      let closure, closureKey;

      if (key === DEAD) {
        closure = [];
        closureKey = DEAD;
      } else {
        const moved = move(currentNFAStates, sym, nfa);
        closure = epsilonClosure(moved, nfa);
        closureKey = closure.length ? closure.join(',') : DEAD;

        // Detailed description for the step panel
        steps.push({
          from: key,
          symbol: sym,
          to: closureKey,
          movedRaw: moved,
          description:
            `δ({${key}}, '${sym}') = move({${key}}, '${sym}') = ` +
            `{${moved.join(', ') || '∅'}} → ` +
            `ε-closure = {${closureKey}}`
        });
      }

      transitions[key][sym] = closureKey;

      if (!stateMap.has(closureKey)) {
        stateMap.set(closureKey, closure);
        queue.push(closureKey);
      }
    }
  }

  // A DFA state is accepting if any of its NFA states is accepting
  const accept = [...stateMap.keys()].filter(key =>
    (stateMap.get(key) || []).some(s => nfa.accept.includes(s))
  );

  return {
    start: startKey,
    states: [...stateMap.keys()],
    stateMap,
    transitions,
    accept,
    steps,
  };
}
