import { WebSocket } from "ws";
import { Aborter, askYesNo, locker, exit } from "../input.ts";
import { handleError, init, playMove } from "./util.ts";
import { banner, errorMark } from "../styles.ts";
import type { GameRequest, Unlocker } from "../types.ts";

// Replace this with the url you got from the server owner
const url = "http://localhost:5050";

const ws = new WebSocket(url.replace("http", "ws"));

let unlock : Unlocker;
const aborter = new Aborter();
let id : number;

ws.on("open", async () => {
  console.log(banner);
});

ws.on("message", async (data) => {
  const req : GameRequest = JSON.parse(data.toString());

  switch (req.type) {
    case "Authorization":
      console.log(req.message);
      id = req.id;
      await init(ws, id, aborter);
      break;
    case "Message":
      console.log(req.message);
      break;
    case "MatchingRequest": {
      // A matching request will always have a message from the server
      const accepted = await askYesNo(req.message!, aborter);

      // The player aborts the game (Ctrl + C) so the question gets aborted
      if (accepted === null)
        return;

      const res : GameRequest = {type: "MatchingResponse", accepted};
      ws.send(JSON.stringify(res));

      if (accepted)
        console.log("Successfully sent the request to the server, get ready!");
      else {
        console.log("Successfully rejected the request.");
        await init(ws, id, aborter);
      }
    }
      break;
    case "MatchingResponse": {
      // In case the client is actually matching and the other player aborts the game
      aborter.renew();

      console.log(req.message);
      if (!req.accepted)
        await init(ws, id, aborter);
      else
        unlock = locker();
    }
      break;
    case "GameUpdate":
      console.log(req.message);
      if (req.finished) {
        // last player to move has had this chat unlocked already
        if (req.turn === id)
          unlock();
        await init(ws, id, aborter);
        return;
      }

      if (req.turn === id) {
        unlock();
        await playMove(ws, aborter);
      }
      else
        unlock = locker();

      break;
    case "ErrorResponse":
      await handleError(ws, id, req, aborter);
      break;
    default:
      console.error(errorMark, "Unhandled request");
      break;
  }
});

ws.on("close", () => {
  console.log("bye");
  exit();
});

ws.on("error", console.error);
