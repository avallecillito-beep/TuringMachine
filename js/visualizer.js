
export function renderTape(machine) {

    const tapeContainer = document.getElementById("tape-content");

    if (!tapeContainer || !machine) {
        return;
    }

    tapeContainer.innerHTML = "";

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

        const cell = document.createElement("div");

        cell.classList.add("tape-cell");

        const symbol = machine.tape.get(i) ?? machine.blank;

        cell.textContent = symbol;

        if (i === machine.head) {
            cell.classList.add("active");
        }

        tapeContainer.appendChild(cell);
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

