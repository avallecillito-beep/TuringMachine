import {
    renderTape,
    renderMachineStatus,
    renderTrace,
    renderTerminal
} from "./visualizer.js";

export function setupControls(getMachine, initializeMachine) {

    const runButton = document.getElementById("run-btn");
    const resetButton = document.getElementById("reset-btn");

    const stepButton = document.getElementById("step-btn");
    const playButton = document.getElementById("play-btn");
    const pauseButton = document.getElementById("pause-btn");

    const speedInput = document.getElementById("speed");
    const speedValue = document.getElementById("speed-value");

    let intervalId = null;

    function updateDisplay() {

        const machine = getMachine();

        if (!machine) {
            return;
        }

        renderTape(machine);
        renderMachineStatus(machine);
        renderTrace(machine);
        renderTerminal(machine);
    }

    function pause() {

        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }

    }

    function executeStep() {

        const machine = getMachine();

        if (!machine) {
            return;
        }

        machine.step();

        updateDisplay();

        if (
            machine.status === "Accepted" ||
            machine.status === "Rejected" ||
            machine.status === "Error" ||
            machine.status === "Step Limit Reached"
        ) {
            pause();
        }

    }

    function play() {

        const machine = getMachine();

        if (!machine || intervalId !== null) {
            return;
        }

        if (
            ["Accepted", "Rejected", "Error", "Step Limit Reached"]
                .includes(machine.status)
        ) {
            return;
        }

        const speed = Number(speedInput.value);

        const delay = 1000 / Math.max(1, speed);

        intervalId = setInterval(() => {
            executeStep();
        }, delay);

    }

    stepButton.addEventListener("click", () => {

        pause();
        executeStep();

    });

    playButton.addEventListener("click", play);

    pauseButton.addEventListener("click", pause);

    runButton.addEventListener("click", () => {

    pause();

    initializeMachine();

    play();

    });

    resetButton.addEventListener("click", () => {

        pause();

        const machine = getMachine();

        if (!machine) {
            return;
        }

        machine.reset();

        updateDisplay();

    });

    speedInput.addEventListener("input", () => {

        speedValue.textContent = speedInput.value;

        if (intervalId !== null) {
            pause();
            play();
        }

    });

    return { pause };
}
