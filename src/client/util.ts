import type { WebSocket } from "ws";
import { askYesNo, askNum, getMove, type Aborter } from "../input.ts";
import { errorMark } from "../styles.ts";
import type { GameRequest } from "../types.ts";

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
    default:
      console.log(req.message);
      await init(ws, id, aborter);
      break;
  }
};

export {
  init,
  playMove,
  handleError,
};
