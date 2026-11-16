
import { readFileSync } from "node:fs";
import { TuringMachine } from "./turingMachine.js";

// Read the presets file
const file = readFileSync("./presets.json", "utf8");

// Convert JSON text into a JavaScript object
const presets = JSON.parse(file);

// Select Binary Increment
const config = presets.multiplication;

// Create the machine
const machine = new TuringMachine(config, "110111");

// Run the machine
console.log("Machine:", config.name);
console.log("Input: 110111");

console.log("\n=== EXECUTION ===");
console.log(machine.run());

// Show final result
console.log("\n=== RESULT ===");
console.log("Final State:", machine.currentState);
console.log("Status:", machine.status);
console.log("Steps:", machine.steps);

// Show tape contents
const output = [...machine.tape.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(entry => entry[1])
    .join("")
    .replace(/^_+|_+$/g, "");

console.log("Output:", output);

// Show execution trace
console.log("\n=== EXECUTION TRACE ===");

for (const entry of machine.history) {
    console.log(
        `Step ${entry.step}:`,
        `${entry.currentState} |`,
        `Read: ${entry.read} |`,
        `Write: ${entry.write} |`,
        `Move: ${entry.move} |`,
        `Next: ${entry.nextState}`
    );
}
