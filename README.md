# Interactive Multi-Interface Turing Machine Simulator

**Theory of Computation — Final Project | Fall 2026 -- Alexis Vallecillo , Brandon Cano**

## Project Overview

For this final project, we developed an interactive Turing Machine simulator in JavaScript. our goal was to connect the theoretical 7-tuple definition of a Turing Machine with a working program that reads symbols, follows transition rules, changes states, and moves a tape head. The simulator has a browser-based graphical interface and an independent Node.js command-line interface (CLI). we used ChatGPT as a learning and programming assistant while building, debugging, and testing the project; the design decisions and implementation were developed through an iterative student-led process.

## Requirements and Features

- Configurable deterministic, single-tape Turing Machine engine
- JSON-based definitions with validation
- Binary Increment, Unary Addition, and Unary Multiplication presets
- Browser GUI with tape visualization, head position, machine information, playback controls, and execution trace
- Node.js CLI with automatic and step-by-step execution, ASCII tape view, and custom JSON loading
- Configurable maximum-step limit to prevent unlimited execution
- Regression tests for expected outputs, input validation, reset, and step limits

## Setup

**Requirements:** A modern web browser and Node.js for CLI/tests. No external npm dependencies are required for the engine.

1. Download or clone the complete project folder.
2. Keep `index.html`, `presets.json`, `package.json`, `CSS/`, `JS/`, and `CLI/` in their original relative locations.
3. For the web interface, open `index.html` in a browser. If browser security blocks loading local JSON files, serve the folder with a local HTTP server, such as VS Code Live Server.
4. For the CLI, open a terminal in the project root and run: npm run cli
   Alternatively: `node CLI/terminal.js`.

## Architecture

```text
TuringMachine/
├── index.html
├── package.json
├── presets.json
├── CSS/
│   └── styles.css
├── js/
│   ├── turingMachine.js
│   ├── main.js
│   ├── visualizer.js
│   ├── controls.js
│   ├── jsonLoader.js
│   
└── CLI/
    └── terminal.js
```

## Formal Turing Machine Model

The simulator represents a deterministic Turing Machine as **M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)**:

- `Q`: finite set of states (`states`)
- `Σ`: input alphabet (`inputAlphabet`)
- `Γ`: tape alphabet (`tapeAlphabet`)
- `δ`: transition function (`transitions`)
- `q₀`: starting state (`startState`)
- `q_accept`: accepting state (`acceptState`)
- `q_reject`: rejecting state (`rejectState`)

The blank symbol is stored separately as `blank`. The tape uses a JavaScript `Map`, which permits positive and negative cell positions. A rule reads a symbol, writes another symbol, moves **L**, **R**, or **S** (stay), and enters the next state.

## Defining Custom Transition Tables

Create a JSON file with all required fields. For example, this machine accepts after scanning a binary string to the first blank:

```json
{
  "name": "Binary Scanner",
  "description": "Scans a binary string and accepts at the first blank.",
  "states": ["q0", "q_accept", "q_reject"],
  "inputAlphabet": ["0", "1"],
  "tapeAlphabet": ["0", "1", "_"],
  "blank": "_",
  "startState": "q0",
  "acceptState": "q_accept",
  "rejectState": "q_reject",
  "transitions": {
    "q0": {
      "0": {"write": "0", "move": "R", "nextState": "q0"},
      "1": {"write": "1", "move": "R", "nextState": "q0"},
      "_": {"write": "_", "move": "S", "nextState": "q_accept"}
    }
  }
}
```

**How to interpret a rule:** When the machine is in `q0` and reads `1`, it writes `1`, moves right, and remains in `q0`.

**Validation rules:** Every referenced state must exist; every read/write symbol must belong to the tape alphabet; the input alphabet must be contained in the tape alphabet; the blank must not be an input symbol; moves must be `L`, `R`, or `S`; start, accept, and reject states must be distinct; and halting states must not define outgoing transitions. Missing transitions cause an execution error rather than an invented next step.

**To load:** Use **Select JSON File → Load JSON** in the web interface, or choose **Load Custom JSON** in the CLI and enter the file path. Enter an input using only symbols from `inputAlphabet`.

## What I Learned Alexis

This project helped me understand how a formal computational model becomes executable software. I practiced designing transition tables, debugging state changes, working with JavaScript modules and JSON, and separating a reusable engine from different user interfaces. I also learned that testing edge cases is just as important as demonstrating successful inputs.

## AI Assistance and Attribution

I used **OpenAI ChatGPT (GPT-6)** as a programming tutor and development assistant during the project. Its assistance included explanations of Turing Machine concepts, suggestions for organizing the JavaScript files, examples of CLI integration, debugging guidance for a Windows path-capitalization error, CSS layout refinements, and proposed regression tests. I reviewed, adapted, and tested the suggestions in my own project environment. AI-generated suggestions were not treated as evidence of successful execution until tested.

**Suggested citation (APA-style):** OpenAI. (2026). *ChatGPT (GPT-6)* [Large language model]. https://chatgpt.com/

**AI-use note:** OpenAI ChatGPT was consulted during development conversations in November 2026 for explanations, code examples, debugging, and documentation support.

## Acknowledgment

**Thank you, Mrs. Tania**, for encouraging us to improve and push ourselves every day. Your support and expectations motivated us to keep learning, face difficult challenges, and put more effort into our work. This project represents not only what we learned about the Theory of Computation, but also the progress I have made as a student. I truly appreciate your dedication and encouragement.

## Reference

OpenAI. (2026). *ChatGPT (GPT-6)* [Large language model]. https://chatgpt.com/
