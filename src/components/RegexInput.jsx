import { useState } from 'react';
import { validateRegex } from '../utils/regexToENFA';

const REGEX_EXAMPLES = [
  { label: 'Ends with ab',       regex: '(a|b)*ab'         },
  { label: 'Contains 00',        regex: '(0|1)*00(0|1)*'   },
  { label: 'Starts with a',      regex: 'a(a|b)*'          },
  { label: 'Even length',        regex: '((a|b)(a|b))*'    },
  { label: 'ε-NFA Demo (a?b+)',  regex: 'a?b+'             },
];

export default function RegexInput({ onBuild }) {
  const [regex, setRegex]   = useState('');
  const [error, setError]   = useState(null);

  const handleBuild = () => {
    const err = validateRegex(regex);
    if (err) { setError(err); return; }
    setError(null);
    try {
      onBuild(regex.trim());
    } catch (e) {
      setError(e.message);
    }
  };

  const loadExample = (r) => {
    setRegex(r);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <h2 className="text-sm font-bold text-slate-200 font-mono">Regex Input</h2>
        <p className="text-xs text-slate-500 mt-0.5">Thompson's Construction</p>
      </div>

      <div className="flex flex-col gap-5 p-4">

        {/* Operators reference */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 font-mono">
            Supported Operators
          </div>
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            {[
              ['a', 'Literal symbol'],
              ['ab', 'Concatenation'],
              ['a|b', 'Union (OR)'],
              ['a*', 'Kleene star (0 or more)'],
              ['a+', 'Plus (1 or more)'],
              ['a?', 'Optional (0 or 1)'],
              ['(a|b)', 'Grouping'],
            ].map(([op, desc], i, arr) => (
              <div key={op} className={`flex items-center px-3 py-1.5 gap-3 ${i < arr.length - 1 ? 'border-b border-slate-800' : ''}`}>
                <code className="text-indigo-400 font-mono font-bold text-xs w-16 flex-shrink-0">{op}</code>
                <span className="text-slate-500 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 font-mono">
            Quick Examples
          </div>
          <div className="flex flex-col gap-1.5">
            {REGEX_EXAMPLES.map(({ label, regex: r }) => (
              <button
                key={r}
                onClick={() => loadExample(r)}
                className="flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-700 hover:bg-indigo-950 transition-colors group text-left"
              >
                <span className="text-xs text-slate-400 group-hover:text-slate-300">{label}</span>
                <code className="text-xs font-mono font-bold text-indigo-400 group-hover:text-indigo-300">{r}</code>
              </button>
            ))}
          </div>
        </div>

        {/* Regex input */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 font-mono">
            Enter Regex
          </div>
          <input
            value={regex}
            onChange={e => { setRegex(e.target.value); setError(null); }}
            onKeyDown={e => e.key === 'Enter' && handleBuild()}
            placeholder="e.g. (a|b)*ab"
            spellCheck={false}
            className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
              error
                ? 'border-red-700 focus:ring-red-500'
                : 'border-slate-700 focus:ring-indigo-500'
            }`}
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-400 font-mono flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}
          {regex && !error && (
            <p className="mt-1.5 text-xs text-slate-600 font-mono">
              Alphabet: {'{'}
              {[...new Set(regex.split('').filter(c => !'()|*+?\\·'.includes(c)))].sort().join(', ')}
              {'}'}
            </p>
          )}
        </div>

      </div>

      {/* Build button */}
      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={handleBuild}
          disabled={!regex.trim()}
          className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-sm transition-colors font-mono tracking-wide shadow-lg shadow-purple-900/40"
        >
          🔨 Build ε-NFA
        </button>
      </div>
    </div>
  );
}
