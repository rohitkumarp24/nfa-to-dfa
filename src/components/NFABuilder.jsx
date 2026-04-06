import { useState, useCallback } from 'react';

// ── Preset NFA examples ───────────────────────────────────────────────
const PRESETS = {
  sample: {
    label: '📖 Default Sample',
    nfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      start: 'q0',
      accept: ['q2'],
      transitions: {
        q0: { a: ['q0', 'q1'], b: ['q0'] },
        q1: { a: [],           b: ['q2'] },
        q2: { a: [],           b: []     },
      },
      epsilon: { q0: [], q1: [], q2: [] },
    },
  },
  endsWith_ab: {
    label: '🔚 Ends with "ab"',
    nfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      start: 'q0',
      accept: ['q2'],
      transitions: {
        q0: { a: ['q0', 'q1'], b: ['q0'] },
        q1: { a: [],           b: ['q2'] },
        q2: { a: [],           b: []     },
      },
      epsilon: { q0: [], q1: [], q2: [] },
    },
  },
  evenZeros: {
    label: '⓪ Even number of 0s',
    nfa: {
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      start: 'q0',
      accept: ['q0'],
      transitions: {
        q0: { '0': ['q1'], '1': ['q0'] },
        q1: { '0': ['q0'], '1': ['q1'] },
      },
      epsilon: { q0: [], q1: [] },
    },
  },
  containsAB: {
    label: '🔍 Contains "ab" anywhere',
    nfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      start: 'q0',
      accept: ['q2'],
      transitions: {
        q0: { a: ['q0', 'q1'], b: ['q0'] },
        q1: { a: [],           b: ['q2'] },
        q2: { a: ['q2'],       b: ['q2'] },
      },
      epsilon: { q0: [], q1: [], q2: [] },
    },
  },
  epsilonExample: {
    label: '✨ ε-transition Demo',
    nfa: {
      states: ['q0', 'q1', 'q2', 'q3'],
      alphabet: ['a', 'b'],
      start: 'q0',
      accept: ['q3'],
      transitions: {
        q0: { a: ['q1'], b: []     },
        q1: { a: [],     b: ['q2'] },
        q2: { a: [],     b: []     },
        q3: { a: [],     b: []     },
      },
      epsilon: { q0: [], q1: [], q2: ['q3'], q3: [] },
    },
  },
};

// ── Small UI helpers ──────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 font-mono">
      {children}
    </div>
  );
}

function Badge({ children, color = 'indigo', onRemove }) {
  const colors = {
    indigo: 'bg-indigo-950 border-indigo-700 text-indigo-300',
    emerald: 'bg-emerald-950 border-emerald-700 text-emerald-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono font-semibold ${colors[color]}`}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400 transition-colors ml-0.5 leading-none"
        >×</button>
      )}
    </span>
  );
}

function AddInput({ value, onChange, onAdd, placeholder, color = 'indigo' }) {
  const accent = color === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500';
  const btnBg  = color === 'indigo'
    ? 'bg-indigo-600 hover:bg-indigo-500'
    : 'bg-emerald-600 hover:bg-emerald-500';
  return (
    <div className="flex gap-2 mt-2">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        placeholder={placeholder}
        className={`flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 ${accent}`}
      />
      <button
        onClick={onAdd}
        className={`${btnBg} text-white text-xs font-bold px-3 py-1 rounded transition-colors`}
      >+ Add</button>
    </div>
  );
}

// ── TransitionCell — local raw state, validate on blur ─────────────────
// This is the KEY fix for the typing bug
function TransitionCell({ value, onCommit, color = 'indigo' }) {
  const [raw, setRaw] = useState(value);

  // Sync if parent resets (e.g. preset loaded)
  useState(() => { setRaw(value); }, [value]);

  const focusRing = color === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-purple-500';
  const textColor = color === 'indigo' ? 'text-slate-300' : 'text-purple-300';

  return (
    <input
      type="text"
      value={raw}
      placeholder="∅"
      onChange={e => setRaw(e.target.value)}
      onBlur={() => onCommit(raw)}        // ← validate ONLY on blur
      onKeyDown={e => e.key === 'Enter' && onCommit(raw)}
      className={`w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono ${textColor} placeholder-slate-600 focus:outline-none focus:ring-1 ${focusRing} text-xs`}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function NFABuilder({ nfa, onNFAChange, onConvert }) {
  const [newState,  setNewState]  = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  // ── State management ──────────────────────────────────────────────
  const addState = () => {
    const s = newState.trim();
    if (!s || nfa.states.includes(s)) return;
    const newTransitions = { ...nfa.transitions };
    const newEpsilon     = { ...nfa.epsilon };
    newTransitions[s] = Object.fromEntries(nfa.alphabet.map(sym => [sym, []]));
    newEpsilon[s] = [];
    onNFAChange({ ...nfa, states: [...nfa.states, s], transitions: newTransitions, epsilon: newEpsilon });
    setNewState('');
  };

  const removeState = (toRemove) => {
    if (nfa.states.length <= 1) return;
    const states = nfa.states.filter(s => s !== toRemove);
    const transitions = {};
    const epsilon = {};
    states.forEach(s => {
      transitions[s] = {};
      nfa.alphabet.forEach(sym => {
        transitions[s][sym] = (nfa.transitions[s]?.[sym] || []).filter(t => t !== toRemove);
      });
      epsilon[s] = (nfa.epsilon[s] || []).filter(t => t !== toRemove);
    });
    onNFAChange({
      ...nfa,
      states,
      start:  nfa.start === toRemove ? states[0] : nfa.start,
      accept: nfa.accept.filter(s => s !== toRemove),
      transitions,
      epsilon,
    });
  };

  // ── Alphabet management ───────────────────────────────────────────
  const addSymbol = () => {
    const sym = newSymbol.trim();
    if (!sym || sym === 'ε' || nfa.alphabet.includes(sym) || sym.length > 3) return;
    const transitions = {};
    nfa.states.forEach(s => {
      transitions[s] = { ...nfa.transitions[s], [sym]: [] };
    });
    onNFAChange({ ...nfa, alphabet: [...nfa.alphabet, sym], transitions });
    setNewSymbol('');
  };

  const removeSymbol = (sym) => {
    if (nfa.alphabet.length <= 1) return;
    const alphabet = nfa.alphabet.filter(s => s !== sym);
    const transitions = {};
    nfa.states.forEach(s => {
      transitions[s] = {};
      alphabet.forEach(a => { transitions[s][a] = nfa.transitions[s]?.[a] || []; });
    });
    onNFAChange({ ...nfa, alphabet, transitions });
  };

  // ── Transition commits (called on blur) ───────────────────────────
  const commitTransition = useCallback((state, symbol, raw) => {
    const targets = raw.split(',').map(s => s.trim()).filter(s => nfa.states.includes(s));
    onNFAChange({
      ...nfa,
      transitions: {
        ...nfa.transitions,
        [state]: { ...nfa.transitions[state], [symbol]: targets },
      },
    });
  }, [nfa, onNFAChange]);

  const commitEpsilon = useCallback((state, raw) => {
    const targets = raw.split(',').map(s => s.trim()).filter(s => nfa.states.includes(s));
    onNFAChange({ ...nfa, epsilon: { ...nfa.epsilon, [state]: targets } });
  }, [nfa, onNFAChange]);

  // ── Preset loader ─────────────────────────────────────────────────
  const loadPreset = (key) => {
    if (key && PRESETS[key]) onNFAChange(PRESETS[key].nfa);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200 font-mono">NFA Builder</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define your automaton</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4">

        {/* ── Presets dropdown ── */}
        <div>
          <SectionLabel>Load Preset Example</SectionLabel>
          <select
            defaultValue=""
            onChange={e => { loadPreset(e.target.value); e.target.value = ''; }}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>— Choose a preset —</option>
            {Object.entries(PRESETS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Loads a ready-made NFA — or build your own below
          </p>
        </div>

        {/* ── States ── */}
        <div>
          <SectionLabel>States (Q)</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {nfa.states.map(s => (
              <Badge key={s} color="indigo" onRemove={() => removeState(s)}>{s}</Badge>
            ))}
          </div>
          <AddInput
            value={newState}
            onChange={setNewState}
            onAdd={addState}
            placeholder="e.g. q3"
            color="indigo"
          />
        </div>

        {/* ── Alphabet ── */}
        <div>
          <SectionLabel>Alphabet (Σ)</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {nfa.alphabet.map(sym => (
              <Badge key={sym} color="emerald" onRemove={() => removeSymbol(sym)}>{sym}</Badge>
            ))}
          </div>
          <AddInput
            value={newSymbol}
            onChange={setNewSymbol}
            onAdd={addSymbol}
            placeholder="e.g. c"
            color="emerald"
          />
        </div>

        {/* ── Start & Accept ── */}
        <div>
          <SectionLabel>Start & Accept States</SectionLabel>
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-3 py-2 text-slate-500 font-mono font-semibold">State</th>
                  <th className="px-3 py-2 text-slate-500 font-mono font-semibold text-center">Start →</th>
                  <th className="px-3 py-2 text-slate-500 font-mono font-semibold text-center">Accept *</th>
                </tr>
              </thead>
              <tbody>
                {nfa.states.map((s, i) => (
                  <tr key={s} className={i !== nfa.states.length - 1 ? 'border-b border-slate-800' : ''}>
                    <td className="px-3 py-2 font-mono font-bold text-slate-300">{s}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="radio"
                        name="start"
                        checked={nfa.start === s}
                        onChange={() => onNFAChange({ ...nfa, start: s })}
                        className="accent-indigo-500 w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={nfa.accept.includes(s)}
                        onChange={() => onNFAChange({
                          ...nfa,
                          accept: nfa.accept.includes(s)
                            ? nfa.accept.filter(x => x !== s)
                            : [...nfa.accept, s],
                        })}
                        className="accent-indigo-500 w-3.5 h-3.5"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Transitions ── */}
        <div>
          <SectionLabel>Transition Function (δ)</SectionLabel>
          <p className="text-xs text-slate-600 mb-2 font-mono">
            Type targets, press Enter or click away to save.
          </p>
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-2 py-2 text-slate-500 font-mono text-left">δ</th>
                  {nfa.alphabet.map(sym => (
                    <th key={sym} className="px-2 py-2 text-indigo-400 font-mono font-bold text-center">{sym}</th>
                  ))}
                  <th className="px-2 py-2 text-purple-400 font-mono font-bold text-center">ε</th>
                </tr>
              </thead>
              <tbody>
                {nfa.states.map((state, i) => (
                  <tr key={state} className={i !== nfa.states.length - 1 ? 'border-b border-slate-800' : ''}>
                    <td className="px-2 py-1.5 font-mono font-bold text-slate-300 whitespace-nowrap">
                      {state}
                      {state === nfa.start && <span className="text-indigo-500 ml-1">→</span>}
                      {nfa.accept.includes(state) && <span className="text-emerald-500 ml-0.5">*</span>}
                    </td>
                    {nfa.alphabet.map(sym => (
                      <td key={sym} className="px-1 py-1">
                        <TransitionCell
                          key={`${state}-${sym}-${(nfa.transitions[state]?.[sym] || []).join(',')}`}
                          value={(nfa.transitions[state]?.[sym] || []).join(',')}
                          onCommit={raw => commitTransition(state, sym, raw)}
                          color="indigo"
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1">
                      <TransitionCell
                        key={`${state}-eps-${(nfa.epsilon[state] || []).join(',')}`}
                        value={(nfa.epsilon[state] || []).join(',')}
                        onCommit={raw => commitEpsilon(state, raw)}
                        color="purple"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Convert Button */}
      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={onConvert}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-3 rounded-lg font-bold text-sm transition-colors font-mono tracking-wide shadow-lg shadow-indigo-900/40"
        >
          ⚡  Convert NFA → DFA
        </button>
      </div>
    </div>
  );
}
