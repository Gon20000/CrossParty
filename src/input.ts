import { createInterface } from "readline/promises";
import { errorMark2 } from "./styles.ts";
import type { GameRequest } from "./types.ts";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Aborter {
  #controller : AbortController;

  constructor() {
    this.#controller = new AbortController();
  }

  get signal() { return this.#controller.signal; }

  renew() {
    this.#controller.abort();
    this.#controller = new AbortController();
  }
}

const locker = () => {
  // store any kind of data listeners attached to stdin (readline one and potentially others)
  const inputListeners = process.stdin.listeners("data");

  // Remove them to stop listening for data
  process.stdin.removeAllListeners("data");

  // Note: readline discards input when no listeners are attached,
  // so we don’t need a dummy 'data' listener (consumer) here.

  return () => {
    for (const listener of inputListeners) {
      process.stdin.on("data", listener);
    }
  };
};

const ask = async (q : string, aborter : Aborter) => {
  try {
    aborter.renew();
    const res = await rl.question(q, {signal: aborter.signal});
    return res;
  }
  catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      return null;

    throw error; // Rethrow any other error
  }
};

const askYesNo = async (q : string, aborter : Aborter) => {
  const positives = ["yes", "y"];
  const negatives = ["no", "n"];
  const confirmation = "\nType yes/no or y/n to proceed: ";
  const ans = (await ask(q + confirmation, aborter))?.trim();

  if (!ans)
    return null;

  if (positives.includes(ans))
    return true;
  else if (negatives.includes(ans))
    return false;
  else {
    console.log(errorMark2, "Incorrect answer!");
    return askYesNo(q, aborter);
  }
};

// put high = -1 to get any Number
const askNum = async (q : string, aborter : Aborter, low : number = -1, high : number = -1) => {
  const append = high === -1
    ? "Please enter a number: "
    : `Please enter a number between ${low} and ${high}: `;

  // Number() already trims the string
  const input = await ask(`${q}\n${append}`, aborter);
  if (input === null) return null;

  const ans = Number(input);
  if (!Number.isInteger(ans) || (high !== -1 && (ans < low || ans > high))) {
    console.log(errorMark2, `Invalid number ${input}!`);
    return askNum(q, aborter, low, high);
  }

  return ans;
};

const getMove = async (aborter : Aborter) => {
  const rowNum = await askNum("Which row do you want to play the move on?", aborter, 1, 3);
  const abortedRes = {rowNum: null, colNum: null};

  if (rowNum === null)
    return abortedRes;

  const colNum = await askNum("Which column do you want to play the move on?", aborter, 1, 3);
  if (colNum === null)
    return abortedRes;

  return {rowNum, colNum};
};

const exit = () => rl.close();

// Validate the request (input) from the server/client
const parseRequest = (req : string) => {
  try {
    const res = JSON.parse(req);
    if (!("type" in res) || typeof(res.type) !== "string") return null;
    return res as GameRequest;
  }
  catch (_) {
    // Invalid JSON
    return null;
  }
};

export {
  Aborter,
  ask,
  askNum,
  askYesNo,
  exit,
  getMove,
  locker,
  parseRequest,
};

