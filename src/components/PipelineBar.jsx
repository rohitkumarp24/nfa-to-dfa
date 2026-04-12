export default function PipelineBar({ stages, activeStage, onStageClick }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center gap-0 px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto">
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-center">
          {/* Stage button */}
          <button
            onClick={() => stage.available && onStageClick(stage.id)}
            disabled={!stage.available}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
              activeStage === stage.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : stage.done
                ? 'text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300'
                : stage.available
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-700 cursor-not-allowed'
            }`}
          >
            {/* Step badge */}
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs leading-none ${
              stage.done
                ? 'bg-emerald-600 text-white'
                : activeStage === stage.id
                ? 'bg-indigo-400 text-white'
                : 'bg-slate-700 text-slate-500'
            }`}>
              {stage.done ? '✓' : i + 1}
            </span>
            {stage.label}
          </button>

          {/* Arrow connector */}
          {i < stages.length - 1 && (
            <div className={`flex items-center mx-1 text-xs font-bold ${
              stage.done ? 'text-emerald-600' : 'text-slate-700'
            }`}>
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
