export class TuringMachine {

    constructor(config, input = "") {

        this.states = config.states;
        this.inputAlphabet = config.inputAlphabet;
        this.tapeAlphabet = config.tapeAlphabet;
        this.transitions = config.transitions;

        this.startState = config.startState;
        this.acceptState = config.acceptState;
        this.rejectState = config.rejectState;
        this.blank = config.blank;

        this.tape = new Map();
        this.head = 0;
        this.currentState = this.startState;
        this.steps = 0;
        this.status = "Ready";
        this.maxSteps = 10000;

        this.validateConfig();
        this.validateInput(input);
        this.history = [];
        this.initialInput = input;
        this.loadTape(input);
    }


    loadTape(input) {

        this.validateInput(input);

        this.tape.clear();

        for (let i = 0; i < input.length; i++) {
            this.tape.set(i, input[i]);
        }

        this.head = 0;
        this.currentState = this.startState;
        this.steps = 0;
        this.status = "Ready";
    }

    readSymbol() {
        return this.tape.get(this.head) ?? this.blank;
    }

    validateInput(input) {

        for (const symbol of input) {

            if (!this.inputAlphabet.includes(symbol)) {
                throw new Error(
                    `Invalid input symbol: ${symbol}. Allowed symbols: ${this.inputAlphabet.join(", ")}`
                );
            }

        }

        return true;
    }

    step() {

        if (
            this.status === "Accepted" ||
            this.status === "Rejected" ||
            this.status === "Error" ||
            this.status === "Step Limit Reached"
        ) {
            return null;
        }

        if (this.steps >= this.maxSteps) {
            this.status = "Step Limit Reached";
            return null;
        }

        const symbol = this.readSymbol();

        const transition = this.transitions[this.currentState]?.[symbol];

        if (!transition) {
            this.status = "Error";
            console.error("Undefined transition:", this.currentState, symbol);
            return null;
        }

        const previousState = this.currentState;
        const previousHead = this.head;

        this.tape.set(this.head, transition.write);

        if (transition.move === "R") {
            this.head++;
        } else if (transition.move === "L") {
            this.head--;
        }

        this.currentState = transition.nextState;

        this.steps++;

        if (this.currentState === this.acceptState) {
            this.status = "Accepted";
        } else if (this.currentState === this.rejectState) {
            this.status = "Rejected";
        } else {
            this.status = "Running";
        }
        if (
            this.status === "Running" &&
            this.steps >= this.maxSteps
        ) {
            this.status = "Step Limit Reached";
        }

                
        const traceEntry = {
            step: this.steps,
            currentState: previousState,
            read: symbol,
            write: transition.write,
            move: transition.move,
            nextState: this.currentState,
            headBefore: previousHead,
            headAfter: this.head,
            tape: new Map(this.tape)
        };

        this.history.push(traceEntry);

        return traceEntry;

    }

    run() {

        while (
            this.status !== "Accepted" &&
            this.status !== "Rejected" &&
            this.status !== "Error" &&
            this.status !== "Step Limit Reached"
        ) {

            if (this.steps >= this.maxSteps) {
                this.status = "Step Limit Reached";
                break;
            }

            this.step();
        }

        return {
            status: this.status,
            steps: this.steps,
            state: this.currentState
        };
    }


    reset() {

        this.loadTape(this.initialInput);
        this.history = [];

    }

    validateConfig() {

        const states = this.states;
        const tapeAlphabet = this.tapeAlphabet;
        const inputAlphabet = this.inputAlphabet;

        if (!Array.isArray(states) || states.length === 0) {
            throw new Error("Invalid states");
        }

        if (new Set(states).size !== states.length) {
            throw new Error("Duplicate states");
        }

        if (!Array.isArray(inputAlphabet) ||
            !Array.isArray(tapeAlphabet)) {
            throw new Error("Invalid alphabets");
        }

        if (new Set(tapeAlphabet).size !== tapeAlphabet.length ||
            new Set(inputAlphabet).size !== inputAlphabet.length) {
            throw new Error("Duplicate alphabet symbols");
        }

        for (const symbol of inputAlphabet) {
            if (!tapeAlphabet.includes(symbol)) {
                throw new Error("Input symbol missing from tape alphabet");
            }
        }

        for (const state of [
            this.startState,
            this.acceptState,
            this.rejectState
        ]) {
            if (!states.includes(state)) {
                throw new Error(`Undefined state: ${state}`);
            }
        }

        if (this.startState === this.acceptState ||
            this.startState === this.rejectState ||
            this.acceptState === this.rejectState) {
            throw new Error("Start, accept and reject states must be different");
        }

        if (!tapeAlphabet.includes(this.blank) ||
            inputAlphabet.includes(this.blank)) {
            throw new Error("Invalid blank symbol");
        }

        if (!this.transitions ||
            typeof this.transitions !== "object" ||
            Array.isArray(this.transitions)) {
            throw new Error("Invalid transitions");
        }

        for (const state of Object.keys(this.transitions)) {

            if (!states.includes(state)) {
                throw new Error(`Unknown transition state: ${state}`);
            }

            if (state === this.acceptState ||
                state === this.rejectState) {
                throw new Error("Halting states cannot have transitions");
            }

            const rules = this.transitions[state];

            if (!rules || typeof rules !== "object" ||
                Array.isArray(rules)) {
                throw new Error(`Invalid rules for ${state}`);
            }

            for (const symbol of Object.keys(rules)) {

                const rule = rules[symbol];

                if (!tapeAlphabet.includes(symbol)) {
                    throw new Error(`Invalid read symbol: ${symbol}`);
                }

                if (!rule || typeof rule !== "object" ||
                    Array.isArray(rule)) {
                    throw new Error("Invalid transition rule");
                }

                if (!tapeAlphabet.includes(rule.write)) {
                    throw new Error(`Invalid write symbol: ${rule.write}`);
                }

                if (!["L", "R", "S"].includes(rule.move)) {
                    throw new Error(`Invalid movement: ${rule.move}`);
                }

                if (!states.includes(rule.nextState)) {
                    throw new Error(
                        `Invalid next state: ${rule.nextState}`
                    );
                }
            }
        }

        return true;
    }

}
