import { useRef, useEffect } from 'react';

export default function StepPanel({ steps, currentStep, onStepChange }) {
  const listRef = useRef(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (listRef.current && currentStep >= 0) {
      const el = listRef.current.children[currentStep];
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep]);

  if (!steps || steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-600 gap-2">
        <span className="text-2xl">∅</span>
        <p className="text-xs font-mono">Convert to see steps</p>
      </div>
    );
  }

  const progress = currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
            Construction Steps
          </span>
          <span className="text-xs font-mono text-slate-500">
            {currentStep >= 0 ? `${currentStep + 1}` : '0'}/{steps.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex gap-2 px-4 py-2.5 border-b border-slate-800">
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep <= 0}
          className="flex-1 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors text-slate-300"
        >
          ← Prev
        </button>
        <button
          onClick={() => onStepChange(currentStep === -1 ? 0 : Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep >= steps.length - 1}
          className="flex-1 py-1.5 text-xs font-mono font-bold bg-indigo-700 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors text-indigo-100"
        >
          Next →
        </button>
      </div>

      {/* Steps list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          return (
            <div
              key={i}
              onClick={() => onStepChange(i)}
              className={`px-4 py-3 border-b border-slate-800/60 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-indigo-950 border-l-2 border-l-indigo-500'
                  : 'hover:bg-slate-900 border-l-2 border-l-transparent'
              }`}
            >
              {/* Step header */}
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold font-mono ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : i < currentStep
                    ? 'bg-emerald-900 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </span>
                <code className="text-xs text-slate-300 font-mono">
                  <span className="text-indigo-400">{`{${step.from}}`}</span>
                  <span className="text-slate-500"> —</span>
                  <span className="text-amber-400 font-bold">{step.symbol}</span>
                  <span className="text-slate-500">→ </span>
                  <span className="text-emerald-400">{`{${step.to}}`}</span>
                </code>
              </div>

              {/* Step description — only for active */}
              {isActive && (
                <div className="mt-2 ml-7 text-xs text-slate-400 font-mono leading-relaxed bg-slate-900 rounded p-2 border border-slate-800">
                  {step.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
