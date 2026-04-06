import { useState } from 'react';

export default function StringTester({ dfa, onPathChange }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const testString = () => {
    if (!dfa) return;

    let current = dfa.start;
    const path = [current];

    for (const char of input) {
      if (!dfa.alphabet?.includes(char)) {
        setResult({
          accepted: false,
          path,
          reason: `'${char}' is not in the alphabet Σ = {${dfa.alphabet?.join(', ')}}`,
        });
        onPathChange(path);
        return;
      }
      const next = dfa.transitions[current]?.[char];
      if (!next) {
        setResult({
          accepted: false,
          path,
          reason: `No transition from {${current}} on '${char}'`,
        });
        onPathChange(path);
        return;
      }
      current = next;
      path.push(current);
    }

    const accepted = dfa.accept.includes(current);
    setResult({
      accepted,
      path,
      reason: accepted
        ? `Reached accept state {${current}} ✓`
        : `{${current}} is not an accept state`,
    });
    onPathChange(path);
  };

  const clear = () => {
    setInput('');
    setResult(null);
    onPathChange([]);
  };

  // Compute DFA alphabet from transitions
  const alphabet = dfa
    ? [...new Set(Object.values(dfa.transitions).flatMap(t => Object.keys(t)))]
    : [];

  return (
    <div className="border-t border-slate-800 p-4 bg-slate-950">
      <div className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500 mb-3">
        Test a String
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && testString()}
          placeholder={dfa ? `e.g. ${dfa.alphabet?.slice(0,2).join('') || 'ab'}` : 'Convert first'}
          disabled={!dfa}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
        />
        <button
          onClick={testString}
          disabled={!dfa}
          className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-bold font-mono transition-colors"
        >
          Run
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-3 border text-xs ${
          result.accepted
            ? 'bg-emerald-950 border-emerald-800'
            : 'bg-red-950 border-red-900'
        }`}>
          <div className={`font-bold font-mono text-sm mb-1 ${
            result.accepted ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {result.accepted ? '✅ ACCEPTED' : '❌ REJECTED'}
          </div>
          <div className="text-slate-400 font-mono mb-2">{result.reason}</div>

          {/* Path breadcrumbs */}
          <div className="flex flex-wrap items-center gap-1 font-mono">
            {result.path.map((state, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                  result.accepted && i === result.path.length - 1
                    ? 'bg-emerald-800 text-emerald-200'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {`{${state}}`}
                </span>
                {i < result.path.length - 1 && (
                  <span className="text-slate-600">→</span>
                )}
              </span>
            ))}
          </div>

          <button
            onClick={clear}
            className="mt-2 text-xs text-slate-600 hover:text-slate-400 font-mono transition-colors"
          >
            clear ×
          </button>
        </div>
      )}
    </div>
  );
}
