
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFile } from "node:fs/promises";
import { TuringMachine } from "../js/turingMachine.js";

// Create the terminal input/output interface
const rl = readline.createInterface({
    input,
    output
});

// Resolve paths relative to this file
const presetsPath = new URL("../presets.json", import.meta.url);

// Terminal menu options
const machineOptions = {
    "1": "binary",
    "2": "addition",
    "3": "multiplication"
};

// Check if the machine has stopped
function isHalted(machine) {
    return [
        "Accepted",
        "Rejected",
        "Error",
        "Step Limit Reached"
    ].includes(machine.status);
}

// Load the existing machine presets
async function loadPresets() {
    const content = await readFile(presetsPath, "utf8");
    return JSON.parse(content);
}

// Display the main menu
function showMenu() {
    console.log("\n========================================");
    console.log("       TURING MACHINE SIMULATOR");
    console.log("========================================");

    console.log("\nSelect a Turing Machine:\n");

    console.log("1. Binary Increment");
    console.log("2. Unary Addition");
    console.log("3. Unary Multiplication");
    console.log("4. Load Custom JSON");
    console.log("5. Exit");
}

// Display a window around the tape head
function displayTape(machine, radius = 8) {
    const positions = [...machine.tape.keys()];

    const minPosition = Math.min(
        machine.head - radius,
        ...positions,
        0
    );

    const maxPosition = Math.max(
        machine.head + radius,
        ...positions,
        0
    );

    // Keep the display compact for long tapes
    const start = Math.max(minPosition, machine.head - radius);
    const end = Math.min(maxPosition, machine.head + radius);

    const cells = [];
    const pointer = [];

    for (let i = start; i <= end; i++) {
        cells.push(machine.tape.get(i) ?? machine.blank);
        pointer.push(i === machine.head ? "^" : " ");
    }

    console.log("\nTape:");
    console.log(cells.join(" "));
    console.log(pointer.join(" "));
    console.log(`Head position: ${machine.head}`);
}

// Display the current machine information
function displayMachine(machine) {
    console.log("\n----------------------------------------");
    console.log(`State:  ${machine.currentState}`);
    console.log(`Steps:  ${machine.steps}`);
    console.log(`Status: ${machine.status}`);

    displayTape(machine);
}

// Display a transition returned by step()
function displayTransition(entry) {
    console.log("\nTransition executed:");
    console.log(`Step:       ${entry.step}`);
    console.log(`From state: ${entry.currentState}`);
    console.log(`Read:       ${entry.read}`);
    console.log(`Write:      ${entry.write}`);
    console.log(`Move:       ${entry.move}`);
    console.log(`Next state: ${entry.nextState}`);
}

// Ask the user for an input string
async function askInput(config) {
    while (true) {
        const value = await rl.question(
            "\nEnter input string: "
        );

        // Empty strings are valid for some Turing Machines
        const invalidSymbols = [...value].filter(
            symbol => !config.inputAlphabet.includes(symbol)
        );

        if (invalidSymbols.length === 0) {
            return value;
        }

        console.log(
            `Invalid input. Allowed symbols: ${config.inputAlphabet.join(", ")}`
        );
    }
}

// Ask the user for the execution limit
async function askMaxSteps() {
    while (true) {
        const answer = await rl.question(
            "\nMaximum steps [10000]: "
        );

        if (answer.trim() === "") {
            return 10000;
        }

        const value = Number(answer.trim());

        if (Number.isSafeInteger(value) && value > 0) {
            return value;
        }

        console.log("Please enter a positive integer.");
    }
}

// Execute all transitions automatically
function runAutomatically(machine) {
    console.log("\nRunning machine...");

    const result = machine.run();

    console.log("\n========== EXECUTION RESULT ==========");
    displayMachine(machine);

    console.log(`\nFinal status: ${result.status}`);
    console.log(`Final tape:   ${getFinalTape(machine)}`);
    console.log(`Total steps:  ${result.steps}`);
    console.log(`Final state:  ${result.state}`);
}

// Execute transitions one at a time
async function runStepByStep(machine) {
    console.log("\nStep-by-step execution");
    console.log("Press Enter for the next transition.");
    console.log("Type q to return to the main menu.");

    displayMachine(machine);

    while (!isHalted(machine)) {
        const answer = await rl.question(
            "\nNext step [Enter / q]: "
        );

        if (answer.trim().toLowerCase() === "q") {
            console.log("\nExecution interrupted by user.");
            return;
        }

        const entry = machine.step();

        if (entry) {
            displayTransition(entry);
        } else if (machine.status === "Error") {
            console.log(
                "\nNo transition is defined for the current state and symbol."
            );
        }

        displayMachine(machine);
    }

    console.log("\n========== EXECUTION FINISHED ==========");
    console.log(`Status: ${machine.status}`);
    console.log(`Steps:  ${machine.steps}`);
}

// Ask which execution mode to use
async function chooseExecutionMode(machine) {
    while (true) {
        console.log("\nExecution Mode:");
        console.log("1. Run automatically");
        console.log("2. Step by step");
        console.log("3. Return to main menu");

        const choice = (
            await rl.question("\nSelect mode: ")
        ).trim();

        switch (choice) {
            case "1":
                runAutomatically(machine);
                return;

            case "2":
                await runStepByStep(machine);
                return;

            case "3":
                return;

            default:
                console.log("Invalid execution mode.");
        }
    }
}

// Initialize a real Turing Machine
async function initializeMachine(config) {
    console.log("\n----------------------------------------");
    console.log(`Selected Machine: ${config.name ?? "Custom Machine"}`);
    console.log("----------------------------------------");

    if (config.description) {
        console.log(config.description);
    }

    const inputString = await askInput(config);
    const maxSteps = await askMaxSteps();

    // Reuse the same engine as the web interface
    const machine = new TuringMachine(config, inputString);

    // The engine currently expects maxSteps to be assigned
    machine.maxSteps = maxSteps;

    console.log("\nMachine initialized successfully!");
    displayMachine(machine);

    await chooseExecutionMode(machine);
}

// Load a custom machine from a JSON file
async function loadCustomMachine() {
    const path = (
        await rl.question("\nEnter JSON file path: ")
    ).trim();

    if (!path) {
        console.log("No file path provided.");
        return;
    }

    // Supports relative and absolute paths
    const fileContent = await readFile(path, "utf8");
    const config = JSON.parse(fileContent);

    await initializeMachine(config);
}

// Main application
async function main() {
    const presets = await loadPresets();

    let running = true;

    while (running) {
        showMenu();

        const choice = (
            await rl.question("\nEnter your choice: ")
        ).trim();

        try {
            if (machineOptions[choice]) {
                const key = machineOptions[choice];
                const config = presets[key];

                if (!config) {
                    throw new Error(`Preset not found: ${key}`);
                }

                await initializeMachine(config);

            } else if (choice === "4") {
                await loadCustomMachine();

            } else if (choice === "5") {
                console.log("\nExiting simulator...");
                running = false;

            } else {
                console.log("\nInvalid choice. Please try again.");
            }

        } catch (error) {
            console.log(`\nError: ${error.message}`);
        }
    }
}

// Start the application
try {
    await main();
} catch (error) {
    console.error("CLI Error:", error.message);
    process.exitCode = 1;
} finally {
    rl.close();
}

function getFinalTape(machine) {
    const positions = [...machine.tape.keys()].sort((a, b) => a - b);

    return positions
        .map(position => machine.tape.get(position))
        .filter(symbol => symbol !== machine.blank)
        .join("");
}