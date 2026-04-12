/**
 * Thompson's Construction — Regex → ε-NFA
 * Supports: literals, concatenation, union (|), star (*), plus (+), optional (?), groups (())
 */

let _id = 0;
const newState = () => `t${_id++}`;
const resetId  = () => { _id = 0; };

function addEps(epsilon, from, to) {
  if (!epsilon[from]) epsilon[from] = [];
  if (!epsilon[from].includes(to)) epsilon[from].push(to);
}

// ── NFA fragment builders (Thompson's primitives) ─────────────────────

function atomNFA(sym) {
  const s0 = newState(), s1 = newState();
  return {
    start: s0, accept: s1,
    states: [s0, s1],
    transitions: { [s0]: { [sym]: [s1] }, [s1]: {} },
    epsilon:     { [s0]: [],              [s1]: [] },
  };
}

function concatNFA(a, b) {
  const eps = { ...a.epsilon, ...b.epsilon };
  addEps(eps, a.accept, b.start);
  return {
    start: a.start, accept: b.accept,
    states: [...a.states, ...b.states],
    transitions: { ...a.transitions, ...b.transitions },
    epsilon: eps,
  };
}

function unionNFA(a, b) {
  const start = newState(), accept = newState();
  const eps = { ...a.epsilon, ...b.epsilon, [start]: [], [accept]: [] };
  addEps(eps, start, a.start); addEps(eps, start, b.start);
  addEps(eps, a.accept, accept); addEps(eps, b.accept, accept);
  return {
    start, accept,
    states: [start, accept, ...a.states, ...b.states],
    transitions: { ...a.transitions, ...b.transitions, [start]: {}, [accept]: {} },
    epsilon: eps,
  };
}

function starNFA(a) {
  const start = newState(), accept = newState();
  const eps = { ...a.epsilon, [start]: [], [accept]: [] };
  addEps(eps, start, a.start);
  addEps(eps, start, accept);
  addEps(eps, a.accept, a.start);
  addEps(eps, a.accept, accept);
  return {
    start, accept,
    states: [start, accept, ...a.states],
    transitions: { ...a.transitions, [start]: {}, [accept]: {} },
    epsilon: eps,
  };
}

function plusNFA(a) {
  const start = newState(), accept = newState();
  const eps = { ...a.epsilon, [start]: [], [accept]: [] };
  addEps(eps, start, a.start);
  addEps(eps, a.accept, a.start);
  addEps(eps, a.accept, accept);
  return {
    start, accept,
    states: [start, accept, ...a.states],
    transitions: { ...a.transitions, [start]: {}, [accept]: {} },
    epsilon: eps,
  };
}

function optionalNFA(a) {
  const start = newState(), accept = newState();
  const eps = { ...a.epsilon, [start]: [], [accept]: [] };
  addEps(eps, start, a.start);
  addEps(eps, start, accept);
  addEps(eps, a.accept, accept);
  return {
    start, accept,
    states: [start, accept, ...a.states],
    transitions: { ...a.transitions, [start]: {}, [accept]: {} },
    epsilon: eps,
  };
}

// ── Regex parser (tokenize → insert concat → postfix → NFA) ──────────

function tokenize(regex) {
  const tokens = [];
  for (let i = 0; i < regex.length; i++) {
    if (regex[i] === '\\' && i + 1 < regex.length) {
      tokens.push(regex[++i]); // escaped literal
    } else {
      tokens.push(regex[i]);
    }
  }
  return tokens;
}

function insertConcat(tokens) {
  const unary  = new Set(['*', '+', '?']);
  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    result.push(tokens[i]);
    if (i + 1 < tokens.length) {
      const cur = tokens[i];
      const nxt = tokens[i + 1];
      const afterOk  = cur !== '(' && cur !== '|';
      const beforeOk = nxt !== ')' && nxt !== '|' && !unary.has(nxt);
      if (afterOk && beforeOk) result.push('·');
    }
  }
  return result;
}

function toPostfix(tokens) {
  const prec = { '|': 1, '·': 2, '*': 3, '+': 3, '?': 3 };
  const out = [], stack = [];
  for (const tok of tokens) {
    if (tok === '(') {
      stack.push(tok);
    } else if (tok === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') out.push(stack.pop());
      stack.pop();
    } else if (prec[tok] !== undefined) {
      while (stack.length && stack[stack.length - 1] !== '(' &&
             prec[stack[stack.length - 1]] >= prec[tok]) out.push(stack.pop());
      stack.push(tok);
    } else {
      out.push(tok);
    }
  }
  while (stack.length) out.push(stack.pop());
  return out;
}

function buildNFA(postfix) {
  const stack = [];
  for (const tok of postfix) {
    if      (tok === '·') { const b = stack.pop(), a = stack.pop(); stack.push(concatNFA(a, b)); }
    else if (tok === '|') { const b = stack.pop(), a = stack.pop(); stack.push(unionNFA(a, b));  }
    else if (tok === '*') stack.push(starNFA(stack.pop()));
    else if (tok === '+') stack.push(plusNFA(stack.pop()));
    else if (tok === '?') stack.push(optionalNFA(stack.pop()));
    else                  stack.push(atomNFA(tok));
  }
  return stack[0];
}

function extractAlphabet(regex) {
  const special = new Set(['(', ')', '|', '*', '+', '?', '·', '\\']);
  const alpha = new Set();
  let escaped = false;
  for (const c of regex) {
    if (escaped) { alpha.add(c); escaped = false; }
    else if (c === '\\') escaped = true;
    else if (!special.has(c)) alpha.add(c);
  }
  return [...alpha].sort();
}

export function validateRegex(regex) {
  if (!regex.trim()) return 'Regex cannot be empty';
  let depth = 0;
  for (const c of regex) {
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (depth < 0) return 'Unmatched closing parenthesis )';
  }
  if (depth !== 0) return 'Unmatched opening parenthesis (';
  return null;
}

export function regexToENFA(regex) {
  const err = validateRegex(regex);
  if (err) throw new Error(err);

  resetId();
  const alphabet = extractAlphabet(regex);
  if (alphabet.length === 0) throw new Error('Regex must contain at least one symbol');

  const tokens   = tokenize(regex);
  const withConc = insertConcat(tokens);
  const postfix  = toPostfix(withConc);
  const result   = buildNFA(postfix);

  return {
    ...result,
    accept:   [result.accept],
    alphabet,
  };
}
