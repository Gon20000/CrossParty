import type { WebSocket } from "ws";
import { ask, askYesNo, askNum, getMove, type Aborter} from "../input.ts";
import { readConfig, writeConfig } from "./config.ts";
import { errorMark, errorMark2 } from "../styles.ts";
import type { GameRequest } from "../types.ts";

const config = await readConfig();

const init = async (ws : WebSocket, id : number, aborter: Aborter) => {
  const ans = await askYesNo("Do you want to match against another player?", aborter);
  // question aborted
  if (ans === null)
    return;

  if (!ans)
    ws.close();
  else {
    let playerId : number | null;

    do {
      playerId = await askNum("Please enter the ID of the player you wish to duel!", aborter);
      // question aborted
      if (playerId === null)
        return;
      else if (playerId === id)
        console.log(errorMark, "You can't match against yourself!");
    } while (playerId === id); // The player sent his own id

    const req : GameRequest = {type: "MatchingRequest", opponent: playerId};
    ws.send(JSON.stringify(req));
  }
};

// Allow the client to choose a move and send it to the server
const playMove =  async (ws : WebSocket, aborter : Aborter) => {
  const {rowNum, colNum} = await getMove(aborter);
  // Aborted in case the other player abandons the game
  if (rowNum === null)
    return;

  const req : GameRequest = {type: "GameMove", rowNum, colNum};
  ws.send(JSON.stringify(req));
};

const handleError = async (ws : WebSocket, id : number, req : GameRequest, aborter: Aborter) => {
  if (req.type !== "ErrorResponse")
    throw new Error("Impossible call for the function, please contact the game owner.");

  switch (req.code) {
    case "GameError":
      console.log(req.message);
      await playMove(ws, aborter);
      break;
    case "BadRequest":
      console.error(req.message);
      break;
    default:
      console.log(req.message);
      await init(ws, id, aborter);
      break;
  }
};

const validateURL = (url : string) => {
  return /^https?:\/\//.test(url) && URL.canParse(url);
};

const promptURL = async (aborter : Aborter) => {
  const prompt = "Enter the game link you received from your friend (press enter to use the previous link): ";
  let url = await ask(prompt, aborter);

  // prompt aborted by the user
  if (url === null)
    return null;

  // remove trailing/leading spaces for validation
  url = url.trim();

  if (url === "") {
    if (!config.url) {
      console.error(errorMark2, "Couldn't retrieve the last game link, please try entering a new one.");
      return promptURL(aborter);
    }

    url = config.url;
  }

  if (!validateURL(url)) {
    console.error(errorMark2, "Invalid URL, Please make sure it starts with http:// or https://");
    return promptURL(aborter);
  }

  await writeConfig({url});
  return url;
};

export {
  init,
  playMove,
  handleError,
  promptURL,
};
