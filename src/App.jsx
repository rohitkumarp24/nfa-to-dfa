import { useState, useMemo } from 'react';
import NFABuilder     from './components/NFABuilder';
import RegexInput     from './components/RegexInput';
import GraphView      from './components/GraphView';
import StepPanel      from './components/StepPanel';
import MinStepPanel   from './components/MinStepPanel';
import StringTester   from './components/StringTester';
import PipelineBar    from './components/PipelineBar';

import { subsetConstruction, removeEpsilonTransitions } from './utils/nfaToDfa';
import { regexToENFA }    from './utils/regexToENFA';
import { hopcroftMinimize } from './utils/minimizeDFA';
import { nfaToFlowData, dfaToFlowData } from './utils/graphLayout';

const INITIAL_NFA = {
  states: ['q0', 'q1', 'q2'],
  alphabet: ['a', 'b'],
  start: 'q0',
  accept: ['q2'],
  transitions: {
    q0: { a: ['q0', 'q1'], b: ['q0'] },
    q1: { a: [],            b: ['q2'] },
    q2: { a: [],            b: []     },
  },
  epsilon: { q0: [], q1: [], q2: [] },
};

export default function App() {
  // ── Input mode ───────────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState('builder'); // 'builder' | 'regex'

  // ── Pipeline states ──────────────────────────────────────────────────
  const [nfa,     setNfa]     = useState(INITIAL_NFA); // manual NFA
  const [enfa,    setEnfa]    = useState(null);         // ε-NFA from regex
  const [nfaClean, setNfaClean] = useState(null);       // NFA after ε-removal
  const [dfa,     setDfa]     = useState(null);
  const [minDfa,  setMinDfa]  = useState(null);

  // ── UI state ─────────────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState('builder');
  const [currentStep,      setCurrentStep]      = useState(-1);
  const [minStep,          setMinStep]          = useState(-1);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [pathNodes,        setPathNodes]        = useState([]);

  // ── Reset pipeline downstream from a stage ───────────────────────────
  const resetFrom = (stage) => {
    if (stage === 'nfa')  { setDfa(null); setMinDfa(null); setCurrentStep(-1); setMinStep(-1); }
    if (stage === 'dfa')  { setMinDfa(null); setMinStep(-1); }
    setHighlightedNodes([]);
    setPathNodes([]);
  };

  // ── Regex → ε-NFA ────────────────────────────────────────────────────
  const handleBuildFromRegex = (regex) => {
    const result = regexToENFA(regex);
    setEnfa(result);
    const clean = removeEpsilonTransitions(result);
    setNfaClean(clean);
    resetFrom('nfa');
    setActiveTab('enfa');
  };

  // ── NFA → DFA ────────────────────────────────────────────────────────
  const handleConvert = () => {
    const sourceNFA = inputMode === 'regex' ? nfaClean : nfa;
    if (!sourceNFA) return;
    const result = subsetConstruction(sourceNFA);
    setDfa(result);
    resetFrom('dfa');
    setActiveTab('dfa');
    setCurrentStep(-1);
  };

  // ── DFA → Min-DFA ────────────────────────────────────────────────────
 
// ✅ FIXED — pass alphabet explicitly
const handleMinimize = () => {
  if (!dfa) return;
  const alphabet = inputMode === 'regex'
    ? enfa?.alphabet
    : nfa.alphabet;
  const result = hopcroftMinimize({ ...dfa, alphabet });
  setMinDfa(result);
  setMinStep(-1);
  setActiveTab('minDfa');
  setHighlightedNodes([]);
  setPathNodes([]);
};
  // ── Step navigation ──────────────────────────────────────────────────
  const handleStepChange = (idx) => {
    setCurrentStep(idx);
    setPathNodes([]);
    if (dfa && idx >= 0) {
      const step = dfa.steps[idx];
      setHighlightedNodes([step.from, step.to]);
    } else {
      setHighlightedNodes([]);
    }
  };

  const handleMinStepChange = (idx) => {
    setMinStep(idx);
    setHighlightedNodes([]);
    setPathNodes([]);
  };

  // ── String tester ────────────────────────────────────────────────────
  const handlePathChange = (path) => {
    setPathNodes(path);
    setHighlightedNodes([]);
    if (path.length > 0) setCurrentStep(-1);
  };

  // ── Graph data ───────────────────────────────────────────────────────
  const enfaFlow    = useMemo(() => enfa    ? nfaToFlowData(enfa)      : null, [enfa]);
  const nfaFlow     = useMemo(() => {
    const src = inputMode === 'regex' ? nfaClean : nfa;
    return src ? nfaToFlowData(src) : null;
  }, [nfa, nfaClean, inputMode]);
  const dfaFlow     = useMemo(() => dfa    ? dfaToFlowData(dfa,    highlightedNodes, pathNodes) : null, [dfa, highlightedNodes, pathNodes]);
  const minDfaFlow  = useMemo(() => minDfa ? dfaToFlowData(minDfa, [],               pathNodes) : null, [minDfa, pathNodes]);

  const currentFlow = () => {
    switch (activeTab) {
      case 'enfa':   return enfaFlow;
      case 'nfa':    return nfaFlow;
      case 'dfa':    return dfaFlow;
      case 'minDfa': return minDfaFlow;
      default:       return nfaFlow;
    }
  };

  const { nodes, edges } = currentFlow() || { nodes: [], edges: [] };

  // ── Pipeline bar config ──────────────────────────────────────────────
  const pipelineStages = [
    ...(inputMode === 'regex' ? [{
      id: 'enfa',
      label: 'ε-NFA',
      available: !!enfa,
      done: !!enfa,
    }] : []),
    {
      id: 'nfa',
      label: inputMode === 'regex' ? 'NFA' : 'NFA Builder',
      available: true,
      done: inputMode === 'regex' ? !!nfaClean : true,
    },
    {
      id: 'dfa',
      label: 'DFA',
      available: !!dfa,
      done: !!dfa,
    },
    {
      id: 'minDfa',
      label: 'Min-DFA',
      available: !!minDfa,
      done: !!minDfa,
    },
  ];

  const handlePipelineClick = (stageId) => {
    if (stageId === 'nfa') setActiveTab(inputMode === 'regex' ? 'nfa' : 'builder');
    else setActiveTab(stageId);
  };

  // ── Which NFA to feed StringTester ───────────────────────────────────
  const activeDFA = activeTab === 'minDfa' ? minDfa : dfa;

  // ── DFA stats ─────────────────────────────────────────────────────────
  const dfaStats = dfa ? {
    states: dfa.states.length,
    accept: dfa.accept.length,
    dead:   dfa.states.includes('∅') ? 1 : 0,
  } : null;

  const minStats = minDfa ? {
    original:   minDfa.originalStateCount,
    minimized:  minDfa.minimizedStateCount,
  } : null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-2.5 bg-slate-900 border-b border-slate-800">
        <div>
          <h1 className="text-sm font-bold text-slate-100 font-mono tracking-tight">
            Regex <span className="text-purple-400">/</span> NFA{' '}
            <span className="text-indigo-400">→</span> ε-NFA{' '}
            <span className="text-indigo-400">→</span> NFA{' '}
            <span className="text-indigo-400">→</span> DFA{' '}
            <span className="text-indigo-400">→</span>{' '}
            <span className="text-emerald-400">Min-DFA</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono">Subset Construction · Hopcroft's Minimization · Thompson's Construction</p>
        </div>

        {/* Input mode toggle */}
        <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
          {['builder', 'regex'].map(mode => (
            <button
              key={mode}
              onClick={() => {
                setInputMode(mode);
                setActiveTab(mode === 'regex' ? (enfa ? 'enfa' : 'builder') : 'builder');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                inputMode === mode
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'builder' ? '⚙ NFA Builder' : '✦ Regex'}
            </button>
          ))}
        </div>
      </header>

      {/* ── Pipeline Bar ──────────────────────────────────────────────── */}
      <PipelineBar
        stages={pipelineStages}
        activeStage={activeTab === 'builder' ? 'nfa' : activeTab}
        onStageClick={handlePipelineClick}
      />

      {/* ── Main Layout ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Panel — Builder or Regex Input */}
        <div className="w-72 flex-shrink-0 border-r border-slate-800 overflow-hidden">
          {inputMode === 'builder' ? (
            <NFABuilder
              nfa={nfa}
              onNFAChange={(n) => { setNfa(n); resetFrom('nfa'); }}
              onConvert={handleConvert}
            />
          ) : (
            <RegexInput onBuild={handleBuildFromRegex} />
          )}
        </div>

        {/* Center — Graph canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="flex-shrink-0 flex items-center border-b border-slate-800 bg-slate-900 px-4 gap-1">

            {/* ε-NFA tab (regex mode only) */}
            {inputMode === 'regex' && (
              <TabButton
                id="enfa" active={activeTab} label="ε-NFA"
                badge={enfa?.states?.length}
                available={!!enfa}
                color="purple"
                onClick={() => enfa && setActiveTab('enfa')}
              />
            )}

            {/* NFA tab */}
            <TabButton
              id={inputMode === 'regex' ? 'nfa' : 'builder'}
              active={activeTab}
              label="NFA"
              badge={inputMode === 'regex' ? nfaClean?.states?.length : nfa.states.length}
              available={true}
              color="indigo"
              onClick={() => setActiveTab(inputMode === 'regex' ? 'nfa' : 'builder')}
            />

            {/* DFA tab */}
            <TabButton
              id="dfa" active={activeTab} label="DFA"
              badge={dfaStats?.states}
              available={!!dfa}
              color="emerald"
              onClick={() => dfa && setActiveTab('dfa')}
            />

            {/* Min-DFA tab */}
            <TabButton
              id="minDfa" active={activeTab} label="Min-DFA"
              badge={minDfa?.states?.length}
              available={!!minDfa}
              color="amber"
              onClick={() => minDfa && setActiveTab('minDfa')}
            />

            {/* Action buttons */}
            <div className="ml-auto flex items-center gap-2">
              {/* Convert button */}
              {(activeTab === 'builder' || activeTab === 'nfa' || (inputMode === 'regex' && activeTab === 'enfa')) && (
                <button
                  onClick={handleConvert}
                  disabled={inputMode === 'regex' && !nfaClean}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-mono font-bold rounded transition-colors"
                >
                  ⚡ → DFA
                </button>
              )}

              {/* Minimize button */}
              {dfa && activeTab === 'dfa' && (
                <button
                  onClick={handleMinimize}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-mono font-bold rounded transition-colors"
                >
                  ✦ Minimize
                </button>
              )}

              {/* Stats */}
              {activeTab === 'dfa' && dfaStats && (
                <span className="text-xs font-mono text-slate-500">
                  <span className="text-emerald-400 font-bold">{dfaStats.accept}</span> accept
                  {dfaStats.dead > 0 && <> · <span className="text-red-500 font-bold">{dfaStats.dead}</span> dead</>}
                </span>
              )}
              {activeTab === 'minDfa' && minStats && (
                <span className="text-xs font-mono text-slate-500">
                  <span className="text-slate-400">{minStats.original}</span> →{' '}
                  <span className="text-purple-400 font-bold">{minStats.minimized}</span> states
                </span>
              )}
            </div>
          </div>

          {/* Graph area */}
          <div className="flex-1" style={{ minHeight: 0 }}>
            {nodes.length > 0 ? (
              <GraphView nodes={nodes} edges={edges} />
            ) : (
              <EmptyGraph activeTab={activeTab} inputMode={inputMode} />
            )}
          </div>
        </div>

        {/* Right Panel — Steps + String Tester */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'minDfa' ? (
              <MinStepPanel
                steps={minDfa?.steps || []}
                currentStep={minStep}
                onStepChange={handleMinStepChange}
                partitionMap={minDfa?.partitionMap}
                stats={minStats}
              />
            ) : (
              <StepPanel
                steps={dfa?.steps || []}
                currentStep={currentStep}
                onStepChange={handleStepChange}
              />
            )}
          </div>
          <StringTester
            dfa={activeDFA ? { ...activeDFA, alphabet: (inputMode === 'regex' ? enfa?.alphabet : nfa.alphabet) || [] } : null}
            onPathChange={handlePathChange}
          />
        </div>

      </div>
    </div>
  );
}

// ── Small helper components ──────────────────────────────────────────────

function TabButton({ id, active, label, badge, available, color, onClick }) {
  const colors = {
    purple:  { active: 'border-purple-500 text-purple-400',  badge: 'bg-slate-800 text-slate-400' },
    indigo:  { active: 'border-indigo-500 text-indigo-400',  badge: 'bg-slate-800 text-slate-400' },
    emerald: { active: 'border-emerald-500 text-emerald-400', badge: 'bg-slate-800 text-slate-400' },
    amber:   { active: 'border-amber-500 text-amber-400',    badge: 'bg-slate-800 text-slate-400' },
  };
  const c = colors[color];
  const isActive = active === id;

  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={`flex items-center gap-1.5 px-4 py-3 text-xs font-mono font-bold border-b-2 transition-colors ${
        !available
          ? 'opacity-30 cursor-not-allowed border-transparent text-slate-500'
          : isActive
          ? `${c.active}`
          : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
      {badge !== undefined && (
        <span className={`px-1.5 py-0.5 rounded ${c.badge} text-xs`}>{badge}</span>
      )}
    </button>
  );
}

function EmptyGraph({ activeTab, inputMode }) {
  const messages = {
    enfa:    { icon: '✦', text: 'Enter a regex and click "Build ε-NFA"' },
    nfa:     { icon: '∿', text: inputMode === 'regex' ? 'Build ε-NFA first' : 'Define your NFA in the builder' },
    builder: { icon: '∿', text: 'Define your NFA in the left panel' },
    dfa:     { icon: '⚡', text: 'Click "→ DFA" to run subset construction' },
    minDfa:  { icon: '✦', text: 'Click "Minimize" on the DFA tab' },
  };
  const msg = messages[activeTab] || messages.builder;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
      <span className="text-4xl">{msg.icon}</span>
      <p className="text-sm font-mono">{msg.text}</p>
    </div>
  );
}
