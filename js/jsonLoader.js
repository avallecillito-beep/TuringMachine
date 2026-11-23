
export async function readMachineFile(file) {

    if (!file) {
        throw new Error("Please select a JSON file.");
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
        throw new Error("The selected file must be a JSON file.");
    }

    const content = await file.text();

    let config;

    try {
        config = JSON.parse(content);
    } catch {
        throw new Error("Invalid JSON syntax.");
    }

    return config;
}


export function validateMachineConfig(config) {

    if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Machine configuration must be an object.");
    }

    const requiredFields = [
        "states",
        "inputAlphabet",
        "tapeAlphabet",
        "transitions",
        "startState",
        "acceptState",
        "rejectState",
        "blank"
    ];

    for (const field of requiredFields) {
        if (!(field in config)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    const isStringArray = value =>
        Array.isArray(value) &&
        value.every(item => typeof item === "string" && item.length > 0);

    if (!isStringArray(config.states) || config.states.length === 0) {
        throw new Error("States must be a non-empty array of strings.");
    }

    if (!isStringArray(config.inputAlphabet) ||
        !isStringArray(config.tapeAlphabet)) {
        throw new Error("Alphabets must be arrays of strings.");
    }

    const unique = values => new Set(values).size === values.length;

    if (!unique(config.states) ||
        !unique(config.inputAlphabet) ||
        !unique(config.tapeAlphabet)) {
        throw new Error("Duplicate states or alphabet symbols are not allowed.");
    }

    const states = new Set(config.states);
    const inputAlphabet = new Set(config.inputAlphabet);
    const tapeAlphabet = new Set(config.tapeAlphabet);

    if (!states.has(config.startState) ||
        !states.has(config.acceptState) ||
        !states.has(config.rejectState)) {
        throw new Error("Start, accept and reject states must be declared.");
    }

    if (new Set([
        config.startState,
        config.acceptState,
        config.rejectState
    ]).size !== 3) {
        throw new Error("Start, accept and reject states must be distinct.");
    }

    if (typeof config.blank !== "string" ||
        config.blank.length !== 1 ||
        !tapeAlphabet.has(config.blank)) {
        throw new Error("Blank must be a single tape alphabet symbol.");
    }

    for (const symbol of inputAlphabet) {
        if (!tapeAlphabet.has(symbol) || symbol === config.blank) {
            throw new Error(`Invalid input alphabet symbol: ${symbol}`);
        }
    }

    for (const symbol of tapeAlphabet) {
        if (symbol.length !== 1) {
            throw new Error("Tape symbols must contain exactly one character.");
        }
    }

    if (!config.transitions ||
        typeof config.transitions !== "object" ||
        Array.isArray(config.transitions)) {
        throw new Error("Transitions must be an object.");
    }

    for (const [state, rules] of Object.entries(config.transitions)) {

        if (!states.has(state)) {
            throw new Error(`Unknown transition state: ${state}`);
        }

        if (state === config.acceptState || state === config.rejectState) {
            throw new Error(`Halting state cannot have transitions: ${state}`);
        }

        if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
            throw new Error(`Invalid transition rules for: ${state}`);
        }

        for (const [read, transition] of Object.entries(rules)) {

            if (!tapeAlphabet.has(read)) {
                throw new Error(`Unknown read symbol: ${read}`);
            }

            if (!transition ||
                typeof transition !== "object" ||
                Array.isArray(transition)) {
                throw new Error(`Invalid transition in state: ${state}`);
            }

            if (!tapeAlphabet.has(transition.write)) {
                throw new Error(`Invalid write symbol: ${transition.write}`);
            }

            if (!["L", "R", "S"].includes(transition.move)) {
                throw new Error(`Invalid movement: ${transition.move}`);
            }

            if (!states.has(transition.nextState)) {
                throw new Error(`Unknown next state: ${transition.nextState}`);
            }
        }
    }

    return true;
}
