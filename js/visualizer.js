
export function renderTape(machine) {

    const tapeContainer = document.getElementById("tape-content");

    if (!tapeContainer || !machine) {
        return;
    }

    tapeContainer.replaceChildren();

    const positions = [...machine.tape.keys()];

    const minPosition = Math.min(
        0,
        machine.head,
        ...positions
    ) - 2;

    const maxPosition = Math.max(
        0,
        machine.head,
        ...positions
    ) + 2;

    for (let i = minPosition; i <= maxPosition; i++) {

        const cellWrapper = document.createElement("div");
        cellWrapper.classList.add("tape-cell-wrapper");

        const cell = document.createElement("div");
        cell.classList.add("tape-cell");

        const symbol = machine.tape.get(i) ?? machine.blank;
        cell.textContent = symbol;

        if (i === machine.head) {

            cell.classList.add("active");

            const headIndicator = document.createElement("div");
            headIndicator.classList.add("head-indicator");
            headIndicator.textContent = "▲";

            cellWrapper.appendChild(cell);
            cellWrapper.appendChild(headIndicator);

        } else {

            cellWrapper.appendChild(cell);

        }

        tapeContainer.appendChild(cellWrapper);
    }
}


export function renderMachineStatus(machine) {

    if (!machine) {
        return;
    }

    const currentState = document.getElementById("current-state");
    const stepCount = document.getElementById("step-count");
    const status = document.getElementById("status");

    currentState.textContent = machine.currentState;
    stepCount.textContent = machine.steps;
    status.textContent = machine.status;
}


export function renderTrace(machine) {

    const traceBody = document.getElementById("trace-body");

    if (!traceBody || !machine) {
        return;
    }

    // Clear previous execution records
    traceBody.innerHTML = "";

    // Create a row for every executed transition
    for (const entry of machine.history) {

        const row = document.createElement("tr");

        const values = [
            entry.step,
            entry.currentState,
            entry.read,
            entry.write,
            entry.move,
            entry.nextState
        ];

        for (const value of values) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        }

        traceBody.appendChild(row);
    }
}


export function renderTerminal(machine) {

    const terminal = document.getElementById("terminal-content");

    if (!terminal || !machine) {
        return;
    }

    const positions = [...machine.tape.keys()];

    const minPosition = Math.min(
        0,
        machine.head,
        ...positions
    ) - 2;

    const maxPosition = Math.max(
        0,
        machine.head,
        ...positions
    ) + 2;

    const tapeSymbols = [];
    const tapePositions = [];

    for (let i = minPosition; i <= maxPosition; i++) {

        const symbol = machine.tape.get(i) ?? machine.blank;

        tapeSymbols.push(symbol);
        tapePositions.push(i);
    }

    // Use equal-width columns for alignment
    const cellWidth = Math.max(
        3,
        ...tapePositions.map(position => String(position).length)
    );

    const formatCell = value =>
        String(value).padStart(cellWidth, " ");

    const positionLine = tapePositions.map(formatCell).join(" ");
    const tapeLine = tapeSymbols.map(formatCell).join(" ");

    const headIndex = machine.head - minPosition;

    const pointerOffset =
        headIndex * (cellWidth + 1) +
        cellWidth - 1;

    const pointerLine = " ".repeat(pointerOffset) + "^";

    terminal.textContent =
`State: ${machine.currentState}
Status: ${machine.status}
Step: ${machine.steps}
Head Position: ${machine.head}

Position: ${positionLine}
Tape:     ${tapeLine}
          ${pointerLine}`;
}
