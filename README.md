# Regex / NFA → ε-NFA → NFA → DFA → Min-DFA
### Full Automata Pipeline Simulator

---

## Problem Statement

Understanding the theoretical foundations of computation — particularly the behavior of finite automata and their transformations — is a core challenge in computer science education. While Nondeterministic Finite Automata (NFA) offer a compact and expressive way to describe formal languages, real-world machines are deterministic in nature. Furthermore, the resulting Deterministic Finite Automata (DFA) are often not in their most compact form, requiring further minimization for practical efficiency.

Traditional classroom instruction presents these algorithms through static diagrams and textbook examples, offering little interactivity or step-by-step transparency. This project addresses that gap by building a fully interactive, browser-based simulation platform that implements the **complete formal language pipeline** — from a regular expression or manually defined NFA, all the way through to a fully minimized DFA — with visual graphs, step-by-step construction panels, and input string tracing at every stage.

---

## About the Project

This is an end-to-end **Automata Theory Simulation Platform** developed as part of the **Theory of Computation (ToC). The application simulates four interconnected algorithms that form the complete pipeline of formal language processing:

```
Regex  →  ε-NFA  →  NFA  →  DFA  →  Min-DFA
        Thompson   ε-removal  Subset   Hopcroft
```

The platform focuses on three core principles: **correctness** of every algorithm, **clarity** of step-by-step visualization, and **depth** of explanation — making it a practical tool for both learning and demonstration.

---

## Full Pipeline — Algorithms Simulated

| Stage | Algorithm | Unit |
|---|---|---|
| **Regex → ε-NFA** | Thompson's Construction | Unit 2 |
| **ε-NFA → NFA** | Epsilon Closure Removal | Unit 1 |
| **NFA → DFA** | Subset Construction Algorithm | Unit 1 |
| **DFA → Min-DFA** | Hopcroft's Minimization Algorithm | Unit 1 |

### Stage 1 — Thompson's Construction (Regex → ε-NFA)
Converts a regular expression into an ε-NFA using primitive NFA fragments for each operator. Supports literals, concatenation, union (`|`), Kleene star (`*`), plus (`+`), optional (`?`), and grouping with parentheses. Each operator maps to a formal NFA primitive joined by ε-transitions.

### Stage 2 — Epsilon Closure Removal (ε-NFA → NFA)
Eliminates all ε-transitions from the ε-NFA by computing the ε-closure of every state and redefining transitions to absorb them. A state in the resulting NFA becomes accepting if any state in its ε-closure was originally accepting.

### Stage 3 — Subset Construction (NFA → DFA)
Converts the NFA into an equivalent DFA by treating sets of NFA states as individual DFA states. Every transition is computed using the move function and ε-closure, with explicit dead state (∅) generation when no NFA states are reachable. Each step is recorded and visualized.

### Stage 4 — Hopcroft's Minimization (DFA → Min-DFA)
Minimizes the DFA using Hopcroft's partition refinement algorithm. Starting with two partitions (accept and non-accept states), it iteratively splits groups based on distinguishability under each input symbol. The resulting equivalence classes are merged into a minimized DFA with the fewest possible states.

---

## Key Concepts Covered

| Concept | Description |
|---|---|
| **ε-closure** | All states reachable from a set via ε-transitions using iterative DFS |
| **Move function (δ)** | NFA states reachable from a given set on a specific input symbol |
| **Thompson primitives** | Atom, concat, union, star, plus, optional NFA fragments |
| **Subset Construction** | NFA state-set → DFA state mapping via BFS |
| **Dead / Trap State (∅)** | Explicit dead state when no NFA states are reachable |
| **Partition refinement** | Hopcroft's iterative group splitting by distinguishability |
| **Equivalence classes** | Groups of indistinguishable DFA states merged into one Min-DFA state |
| **String simulation** | Input string traced state-by-state through DFA or Min-DFA |

---

## Features

### Two Input Modes
- **NFA Builder** — manually define states, alphabet, transitions, ε-transitions, start and accept states through an interactive table
- **Regex Mode** — type any regular expression and build the ε-NFA automatically via Thompson's Construction

### Regex Input
- Supports all standard operators: `a`, `ab`, `a|b`, `a*`, `a+`, `a?`, `(a|b)`
- Real-time alphabet detection from the regex
- Inline error validation for unmatched parentheses and empty input
- 5 built-in quick examples: Ends with ab, Contains 00, Starts with a, Even length, ε-NFA Demo

### NFA Builder
- Add and remove states and alphabet symbols dynamically
- Interactive transition table with ε-transition column
- Fixed typing bug — inputs use local state with on-blur validation so typing flows naturally
- 5 preset NFA examples loadable from a dropdown
- Set start state (radio) and accept states (checkboxes) per state

### Pipeline Bar
- Visual stage tracker showing the full pipeline at the top
- Each stage clickable once its graph is computed
- Completed stages marked with a checkmark (✓)
- Active stage highlighted in indigo

### Graph Visualization
- All four pipeline stages (ε-NFA, NFA, DFA, Min-DFA) rendered as interactive ReactFlow graphs
- Custom circular nodes with start state arrow (▶) and double-ring for accept states
- Self-loop Bezier edges with correct label placement via EdgeLabelRenderer
- BFS-based automatic layout organizing states by distance from start state
- Draggable nodes, zoom, pan, minimap, and controls
- Animated pulse and ripple ring on highlighted nodes during step navigation

### Construction Step Panel (DFA)
- Every subset construction transition recorded as a numbered step
- Active step shows full algorithmic description:
  `δ({from}, 'sym') = move(...) = {...} → ε-closure = {to}`
- Progress bar, Prev/Next navigation, auto-scroll, completed step checkmarks

### Minimization Step Panel (Min-DFA)
- Each Hopcroft partition refinement split recorded as a step
- Active step shows which group was split and why
- Equivalence class map displayed: `M0 = {q0, q2}`, `M1 = {q1}` etc.
- States reduced count shown: e.g. `4 → 2 states (−2 removed)`

### String Tester
- Test any input string against the active DFA or Min-DFA
- Validates characters against the alphabet before simulation
- Displays ACCEPTED / REJECTED with color-coded result
- Full state path shown as breadcrumb chips
- Path highlighted simultaneously on the graph in amber

---

## Tech Stack

### Frontend Framework
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | Component-based UI and state management |
| **Vite** | 5.x | Development server and production bundler |

### Graph Rendering
| Technology | Version | Purpose |
|---|---|---|
| **@xyflow/react (ReactFlow)** | 12.x | Interactive node-edge graph for all pipeline stages |
| **Custom Node (CustomNode.jsx)** | — | Circular state nodes with animated pulse and ripple |
| **Custom Edge (SelfLoopEdge.jsx)** | — | Bezier self-loop edges with EdgeLabelRenderer |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 3.x | Utility-first CSS for all layout and components |
| **IBM Plex Mono** | Google Fonts | Monospace font for all automata labels and states |
| **DM Sans** | Google Fonts | Sans-serif for UI prose and descriptions |
| **PostCSS + Autoprefixer** | — | CSS processing pipeline |

### Core Algorithms (Pure JavaScript)
| Module | File | Responsibility |
|---|---|---|
| `regexToENFA()` | `src/utils/regexToENFA.js` | Full Thompson's Construction — tokenize, insert concat, shunting-yard postfix, build NFA |
| `validateRegex()` | `src/utils/regexToENFA.js` | Parenthesis and empty input validation |
| `epsilonClosure()` | `src/utils/nfaToDfa.js` | Iterative DFS ε-closure computation |
| `move()` | `src/utils/nfaToDfa.js` | NFA states reachable on a given symbol |
| `subsetConstruction()` | `src/utils/nfaToDfa.js` | BFS-driven NFA → DFA with step recording |
| `removeEpsilonTransitions()` | `src/utils/nfaToDfa.js` | ε-NFA → NFA via closure-based transition recomputation |
| `hopcroftMinimize()` | `src/utils/minimizeDFA.js` | Partition refinement DFA minimization with step recording |
| `nfaToFlowData()` | `src/utils/graphLayout.js` | NFA/ε-NFA → ReactFlow nodes and edges |
| `dfaToFlowData()` | `src/utils/graphLayout.js` | DFA/Min-DFA → ReactFlow nodes and edges with highlights |
| `bfsLayout()` | `src/utils/graphLayout.js` | BFS-based automatic graph layout by state depth |

### Deployment
| Technology | Purpose |
|---|---|
| **Vercel** | Static frontend hosting with automatic GitHub integration |
| **GitHub** | Version control and source hosting |

---

## Project Structure

```
nfa-to-dfa/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
│
└── src/
    ├── main.jsx                    # React entry point
    ├── index.css                   # Global styles, Tailwind, ReactFlow overrides
    ├── App.jsx                     # Root component — pipeline orchestration
    │
    ├── utils/
    │   ├── regexToENFA.js          # Thompson's Construction (Regex → ε-NFA)
    │   ├── nfaToDfa.js             # ε-closure, move, subsetConstruction, removeEpsilon
    │   ├── minimizeDFA.js          # Hopcroft's minimization algorithm
    │   └── graphLayout.js          # BFS layout + ReactFlow data converters
    │
    └── components/
        ├── RegexInput.jsx          # Regex input panel with operator reference
        ├── NFABuilder.jsx          # Manual NFA builder with preset examples
        ├── PipelineBar.jsx         # Top pipeline stage tracker
        ├── GraphView.jsx           # ReactFlow wrapper with provider and controls
        ├── CustomNode.jsx          # Animated circular state node
        ├── SelfLoopEdge.jsx        # Custom Bezier self-loop edge
        ├── StepPanel.jsx           # Subset construction step navigator
        ├── MinStepPanel.jsx        # Hopcroft minimization step navigator
        └── StringTester.jsx        # DFA/Min-DFA string simulator
```

---

## How to Use

### Using Regex Mode
1. Click **✦ Regex** toggle in the top right
2. Type a regex like `(a|b)*ab` or pick a quick example
3. Click **Build ε-NFA** — see the ε-NFA graph
4. Click **→ DFA** — subset construction runs, DFA graph appears
5. Click **Minimize** on the DFA tab — Min-DFA graph and Hopcroft steps appear
6. Use the right panel to step through construction or test a string

### Using NFA Builder Mode
1. Click **⚙ NFA Builder** toggle
2. Add states and alphabet symbols, fill in the transition table
3. Set start and accept states
4. Click **Convert NFA → DFA**
5. Click **Minimize** on the DFA tab
6. Test strings using the bottom-right panel

---

## Project Goals

- Provide a hands-on, visual understanding of the complete formal language pipeline
- Make ε-transitions, dead states, and partition refinement visually explicit
- Eliminate abstraction barriers between theory and computation
- Demonstrate all four algorithms in a single cohesive simulation
- Serve as a reusable educational tool for Theory of Computation courses

---


## Academic Context

> **Course:** Theory of Computation (ToC)
> **Institution:** Indian Institute of Information Technology, Sri City (IIIT Sri City)
> **Concepts Simulated:** Thompson's Construction · Subset Construction · Hopcroft's Minimization


---
