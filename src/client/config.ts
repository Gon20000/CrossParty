import { readFile, writeFile } from "fs/promises";
import { errorMark2 } from "../styles.ts";

type Config = {"url": string};

export const readConfig = async () => {
  try {
    const fileContent = await readFile("./config.json", { encoding: "utf8" });
    return JSON.parse(fileContent) as Config;
  }
  catch (_) {
    // fs.readFile uses cwd to resolve paths and so do I!
    throw new Error('Failed to load the required files. Please run the app using "npm start"');
  }
};

export const writeConfig = async (data : Config) => {
  try {
    await writeFile("./config.json", JSON.stringify(data));
  }
  catch (_) {
    // It's assumed that readConfig is ran first so it's not a cwd problem
    // Therefore, it's fine to just alert the user
    console.warn(errorMark2, "Failed to write the game link to memory.");
  }
};
