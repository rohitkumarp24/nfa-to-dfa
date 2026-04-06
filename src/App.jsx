import { useState, useMemo } from 'react';
import NFABuilder from './components/NFABuilder';
import GraphView from './components/GraphView';
import StepPanel from './components/StepPanel';
import StringTester from './components/StringTester';
import { subsetConstruction } from './utils/nfaToDfa';
import { nfaToFlowData, dfaToFlowData } from './utils/graphLayout';

const INITIAL_NFA = {
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
};

export default function App() {
  const [nfa, setNfa] = useState(INITIAL_NFA);
  const [dfa, setDfa] = useState(null);
  const [activeTab, setActiveTab] = useState('nfa');
  const [currentStep, setCurrentStep] = useState(-1);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [pathNodes, setPathNodes] = useState([]);

  // ── Conversion ──────────────────────────────────────────────────────
  const handleConvert = () => {
    const result = subsetConstruction(nfa);
    setDfa(result);
    setActiveTab('dfa');
    setCurrentStep(-1);
    setHighlightedNodes([]);
    setPathNodes([]);
  };

  // ── Step navigation ─────────────────────────────────────────────────
  const handleStepChange = (idx) => {
    setCurrentStep(idx);
    setPathNodes([]); // clear string test path when stepping
    if (dfa && idx >= 0) {
      const step = dfa.steps[idx];
      setHighlightedNodes([step.from, step.to]);
    } else {
      setHighlightedNodes([]);
    }
  };

  // ── String test path ────────────────────────────────────────────────
  const handlePathChange = (path) => {
    setPathNodes(path);
    setHighlightedNodes([]); // clear step highlights when testing
    if (path.length > 0) setCurrentStep(-1);
  };

  // ── Graph data (memoized) ───────────────────────────────────────────
  const nfaFlowData = useMemo(() => nfaToFlowData(nfa), [nfa]);

  const dfaFlowData = useMemo(
    () => dfa ? dfaToFlowData(dfa, highlightedNodes, pathNodes) : { nodes: [], edges: [] },
    [dfa, highlightedNodes, pathNodes]
  );

  const { nodes, edges } = activeTab === 'nfa' ? nfaFlowData : dfaFlowData;

  // ── DFA stats ───────────────────────────────────────────────────────
  const dfaStats = dfa
    ? {
        states: dfa.states.length,
        accept: dfa.accept.length,
        dead: dfa.states.includes('∅') ? 1 : 0,
      }
    : null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight">
              NFA <span className="text-indigo-400">→</span> DFA Converter
            </h1>
            <p className="text-xs text-slate-500 font-mono">Subset Construction · Theory of Computation</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-indigo-500 inline-block" />
            State
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-indigo-500 outline outline-2 outline-offset-1 outline-indigo-500 inline-block" />
            Accept
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-900 border-2 border-indigo-400 inline-block" />
            Highlighted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-900 border-2 border-amber-400 inline-block" />
            Path
          </span>
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: NFA Builder */}
        <div className="w-72 flex-shrink-0 border-r border-slate-800 overflow-hidden">
          <NFABuilder nfa={nfa} onNFAChange={setNfa} onConvert={handleConvert} />
        </div>

        {/* Middle: Graph */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="flex-shrink-0 flex items-center border-b border-slate-800 bg-slate-900 px-4">
            <button
              onClick={() => setActiveTab('nfa')}
              className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-colors ${
                activeTab === 'nfa'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              NFA Graph
              <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-xs">
                {nfa.states.length}
              </span>
            </button>
            <button
              onClick={() => dfa && setActiveTab('dfa')}
              className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-colors ${
                !dfa ? 'opacity-30 cursor-not-allowed border-transparent text-slate-500' :
                activeTab === 'dfa'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              DFA Graph
              {dfaStats && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-xs">
                  {dfaStats.states}
                </span>
              )}
            </button>

            {/* DFA stats */}
            {dfa && activeTab === 'dfa' && (
              <div className="ml-auto flex items-center gap-3 text-xs font-mono text-slate-500">
                <span><span className="text-emerald-400 font-bold">{dfaStats.accept}</span> accept</span>
                {dfaStats.dead > 0 && <span><span className="text-red-500 font-bold">{dfaStats.dead}</span> dead</span>}
                <span><span className="text-slate-300 font-bold">{dfa.steps.length}</span> steps</span>
              </div>
            )}
          </div>

          {/* Graph canvas */}
          <div className="flex-1" style={{ minHeight: 0 }}>
            <GraphView nodes={nodes} edges={edges} />
          </div>
        </div>

        {/* Right: Steps + Tester */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            <StepPanel
              steps={dfa?.steps || []}
              currentStep={currentStep}
              onStepChange={handleStepChange}
            />
          </div>
          <StringTester
            dfa={dfa ? { ...dfa, alphabet: nfa.alphabet } : null}
            onPathChange={handlePathChange}
          />
        </div>

      </div>
    </div>
  );
}
