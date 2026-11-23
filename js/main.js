import { TuringMachine } from "./turingMachine.js";
import {renderTape, renderMachineStatus, renderTrace, renderTerminal} from "./visualizer.js";
import { setupControls } from "./controls.js";
import {readMachineFile, validateMachineConfig} from "./jsonLoader.js";

let presets = {};
let machine = null;
let customConfig = null;

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

    const config = customConfig ?? presets[selectedMachine];

    if (!config) {
        console.error("Machine configuration not found");
        return false;
    }

    const input = inputString.value.trim();

    try {

        for (const symbol of input) {

            if (!config.inputAlphabet.includes(symbol)) {
                throw new Error(`Invalid input symbol: ${symbol}. Allowed symbols: ${config.inputAlphabet.join(", ")}`);
            }

        }

        const maxStepsInput = document.getElementById("max-steps");
        const maxSteps = Number(maxStepsInput.value);

        if (!Number.isInteger(maxSteps) || maxSteps < 1) {
            throw new Error("Max Steps must be a positive integer");
        }

        machine = new TuringMachine(config, input);

        machine.maxSteps = maxSteps;

        // 8. Update all visualizations
        renderTape(machine);
        renderMachineStatus(machine);
        renderTrace(machine);
        renderTerminal(machine);

        console.log(
            "Machine initialized:",
            config.name ?? "Unnamed Machine"
        );

        console.log("Input:", input);

        return true;

    } catch (error) {

        machine = null;

        console.error("Initialization error:", error.message);

        alert(error.message);

        return false;
    }
}



async function loadCustomMachine(pauseExecution) {

    const fileInput = document.getElementById("json-file");
    const file = fileInput.files[0];

    try {

        const config = await readMachineFile(file);

        validateMachineConfig(config);

        pauseExecution();

        customConfig = config;

        console.log(
            "Custom machine loaded:",
            config.name ?? "Unnamed Machine"
        );

        initializeMachine();

    } catch (error) {

        console.error("Custom JSON error:", error.message);

        alert(error.message);

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
    
    const loadButton = document.getElementById("load-btn");

    loadButton.addEventListener("click", () => {
        loadCustomMachine(controls.pause);
    });

    machineOptions.forEach(option => {

        option.addEventListener("change", () => {

            controls.pause();

            customConfig = null;

            const selected = getSelectedMachine();

            inputString.value = defaultInputs[selected];

            initializeMachine();

        });

    });
}


main();

