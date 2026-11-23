
import { TuringMachine } from "./turingMachine.js";
import { renderTape, renderMachineStatus} from "./visualizer.js";
import { setupControls } from "./controls.js";

let presets = {};

let machine = null;

const defaultInputs = {
    binary: "1011",
    addition: "111011",
    multiplication: "11101111"
};

const machineOptions = document.querySelectorAll(
    'input[name="machine"]'
);

const inputString = document.getElementById("input_string");

async function loadPresets() {

    try {

        const response = await fetch("./presets.json");

        if (!response.ok) {
            throw new Error("Unable to load presets.json");
        }

        presets = await response.json();

        console.log("Presets loaded successfully:", presets);

    } catch (error) {

        console.error("Error loading presets:", error.message);

    }
}


function getSelectedMachine() {

    const selected = document.querySelector(
        'input[name="machine"]:checked'
    );

    return selected ? selected.value : null;
}


function initializeMachine() {

    const selectedMachine = getSelectedMachine();

    if (!selectedMachine) {
        console.error("No machine selected");
        return;
    }

    const config = presets[selectedMachine];

    if (!config) {
        console.error("Machine configuration not found");
        return;
    }

    const input = inputString.value.trim();

    try {

        machine = new TuringMachine(config, input);
        const maxStepsInput = document.getElementById("max-steps");

        const maxSteps = Number(maxStepsInput.value);

        if (!Number.isInteger(maxSteps) || maxSteps < 1) {
            throw new Error("Max Steps must be a positive integer");
        }

        machine.maxSteps = maxSteps;

        renderTape(machine);
        renderMachineStatus(machine);

        console.log("Machine initialized:", config.name);
        console.log("Input:", input);

    } catch (error) {

        console.error("Initialization error:", error.message);

    }
}


async function main() {

    await loadPresets();

    const selected = getSelectedMachine();

    if (selected && defaultInputs[selected]) {
        inputString.value = defaultInputs[selected];
    }

    initializeMachine();

    const controls = setupControls(
        () => machine,
        initializeMachine
    );

    machineOptions.forEach(option => {

        option.addEventListener("change", () => {

            controls.pause();

            const selected = getSelectedMachine();

            inputString.value = defaultInputs[selected];

            initializeMachine();

        });

    });

}

main();

