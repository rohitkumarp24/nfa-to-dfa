# NFA → DFA Converter — Subset Construction Visualizer

---

## Problem Statement

Understanding the theoretical foundations of computation — particularly the behavior of finite automata — is a core challenge in computer science education. While Nondeterministic Finite Automata (NFA) offer a compact and expressive way to describe languages, real-world machines are deterministic in nature. The mathematical process of converting an NFA into an equivalent Deterministic Finite Automaton (DFA) using the **Subset Construction Algorithm** is a fundamental yet cognitively demanding concept for students and learners.

Traditional classroom instruction presents this algorithm through static diagrams and textbook examples, offering little interactivity or step-by-step transparency. This project addresses that gap by building a fully interactive, browser-based simulation platform that allows users to **define custom NFAs, execute the subset construction algorithm in real time, visualize both automata as dynamic graphs, and trace input strings through the resulting DFA** — all within a single, cohesive interface.

---

## About the Project

**NFA → DFA Converter** is an educational simulation tool developed as part of the **Theory of Computation (ToC). The application simulates the Subset Construction Algorithm — a formal method that transforms any Nondeterministic Finite Automaton (NFA), including those with epsilon (ε) transitions, into an equivalent Deterministic Finite Automaton (DFA) that recognizes the same language.

The platform focuses on three core principles: **correctness** of the algorithm, **clarity** of visualization, and **depth** of step-by-step explanation — making it a practical tool for both learning and demonstration.

---

## Key Concepts Simulated

| Concept | Description |
|---|---|
| **Epsilon Closure (ε-closure)** | Computes all states reachable from a set of states via ε-transitions using iterative DFS |
| **Move Function (δ)** | Computes the set of NFA states reachable from a given set on a specific input symbol |
| **Subset Construction** | Converts an NFA to a DFA by treating sets of NFA states as individual DFA states |
| **Dead / Trap State (∅)** | Handles cases where no NFA states are reachable, creating an explicit dead state |
| **DFA Acceptance** | A constructed DFA state is accepting if any of its constituent NFA states is an accept state |
| **String Simulation** | Traces any input string through the constructed DFA state by state |

---

## Identified Actors & Roles

### 1. Student / Learner
- Define a custom NFA through an interactive builder
- Observe both the NFA and DFA rendered as interactive graphs
- Step through the subset construction algorithm one transition at a time
- Test arbitrary input strings against the constructed DFA
- Understand each step through detailed algorithmic descriptions

### 2. Instructor / Educator
- Use the preloaded sample NFA for quick in-class demonstrations
- Project the visual graph during lectures to explain ε-closure and move operations
- Walk through construction steps to show how DFA states emerge from NFA state subsets
- Use the string tester to demonstrate acceptance and rejection with path highlighting

---

## Features

### NFA Builder
- Add and remove states dynamically with real-time graph updates
- Define the input alphabet (Σ) with custom symbols
- Set the start state and one or more accept states via radio buttons and checkboxes
- Fill in the full transition function (δ) through an editable table — comma-separated targets only
- Define ε-transitions (epsilon transitions) per state in a dedicated column
- Load a built-in sample NFA instantly for demonstration

### NFA Graph View
- Real-time interactive graph rendered using ReactFlow
- Custom circular nodes with visual indicators: start arrow (▶), double ring for accept states
- Self-loop edges rendered with correct curved Bezier paths and proper label placement
- BFS-based automatic layout that organizes states by distance from the start state
- Draggable nodes for manual repositioning

### DFA Conversion (Subset Construction)
- Correct implementation of ε-closure using iterative depth-first search
- Move function computing reachable states for each input symbol
- Full subset construction with explicit dead state (∅) generation where required
- Each DFA state correctly labeled as a set of NFA states it represents
- Accept states of the DFA automatically determined from constituent NFA accept states

### DFA Graph View
- Dynamically rendered DFA graph after conversion
- Highlighted nodes and edges corresponding to the currently selected construction step (purple glow)
- Yellow highlighted path when a string is being tested through the DFA
- Dead state (∅) styled distinctly in muted gray
- State count, accept state count, and dead state count displayed in the tab bar

### Step-by-Step Panel
- Every transition computed during subset construction is recorded as a numbered step
- Each step displays: source DFA state, input symbol, resulting DFA state
- Expanded active step shows the full algorithmic description:
  `δ({from}, 'sym') = move({from}, 'sym') = {...} → ε-closure = {to}`
- Previous and Next navigation buttons with keyboard-friendly step jumping
- Scrollable list with auto-scroll to the current step
- Progress bar tracking how far through the construction you are
- Completed steps marked with a checkmark (✓)

### String Tester
- Input any string and run it through the constructed DFA
- Validates characters against the alphabet before simulation
- Displays ACCEPTED or REJECTED result with color-coded feedback
- Shows the full state path taken as breadcrumb chips
- Path highlighted simultaneously on the DFA graph with amber-colored nodes and edges
- Displays the exact reason for rejection (invalid symbol, no transition, non-accept state)

### General UI
- Full dark-mode interface with a professional monospace aesthetic
- Three-panel layout: NFA Builder | Graph Canvas | Step Panel + String Tester
- Tab switching between NFA Graph and DFA Graph without losing state
- MiniMap for large automata navigation
- Zoom and pan controls on the graph canvas
- Custom scrollbars, smooth transitions, and responsive layout

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
| **@xyflow/react (ReactFlow)** | 12.x | Interactive node-edge graph rendering for NFA and DFA |
| **Custom Node Types** | — | Circular state nodes with start/accept indicators |
| **Custom Edge Types** | — | Self-loop Bezier edges with `EdgeLabelRenderer` |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 3.x | Utility-first CSS framework for layout and components |
| **IBM Plex Mono** | Google Fonts | Monospace font for all automata labels, states, transitions |
| **DM Sans** | Google Fonts | Clean sans-serif for UI prose and descriptions |
| **PostCSS + Autoprefixer** | — | CSS processing pipeline for Tailwind |

### Core Algorithm 
| Module | Location | Responsibility |
|---|---|---|
| `epsilonClosure()` | `src/utils/nfaToDfa.js` | Iterative DFS to compute ε-closure of a state set |
| `move()` | `src/utils/nfaToDfa.js` | Compute NFA states reachable on a given symbol |
| `subsetConstruction()` | `src/utils/nfaToDfa.js` | Full BFS-driven subset construction returning DFA + steps |
| `nfaToFlowData()` | `src/utils/graphLayout.js` | Converts NFA data model to ReactFlow nodes and edges |
| `dfaToFlowData()` | `src/utils/graphLayout.js` | Converts DFA data model with highlight/path support |
| `bfsLayout()` | `src/utils/graphLayout.js` | BFS-based automatic graph layout by state distance |

### Deployment
| Technology | Purpose |
|---|---|
| **Vercel** | Static frontend deployment with automatic GitHub integration |
| **GitHub** | Version control and source hosting |

---

---

## Getting Started


## How to Use

1. **Define your NFA** in the left panel — add states, symbols, set start and accept states, and fill in the transition table including ε-transitions
2. Click **⚡ Convert NFA → DFA** to run the subset construction algorithm
3. Switch to the **DFA Graph** tab to see the constructed automaton
4. Use the **Step Panel** on the right to navigate through each construction step — the corresponding DFA states will highlight on the graph
5. Enter any input string in the **String Tester** and click Run — the path through the DFA is shown on the graph and as breadcrumb chips

---

## Project Goals

- Provide a hands-on, visual understanding of the Subset Construction Algorithm
- Eliminate abstraction barriers between theoretical automata and their computational behavior
- Make ε-transitions and dead state generation visually explicit and easy to follow
- Serve as a reusable educational tool for Theory of Computation courses
- Demonstrate how nondeterminism can be formally eliminated through algorithmic construction


---

## Academic Context

> **Course:** Theory of Computation (ToC)
> **Institution:** Indian Institute of Information Technology, Sri City
> **Concept Simulated:** Subset Construction Algorithm (NFA → DFA Conversion)

---
