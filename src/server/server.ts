import { WebSocketServer } from "ws";
import { authorize, send, sendError, sendMessage, updateGame, handleMove, abortGame } from "./util.ts";
import { Player } from "../game.ts";
import type { GameRequest } from "../types.ts";
import { parseRequest } from "../input.ts";

const server = new WebSocketServer({ port: 5050 });
console.log("Server up!");

// Keep track of the id of the next player
let userCount = 0;

const players = new Map<number, Player>();
const matchingRequests = new Map<number, number>();

// Emitted whenever a client connects with the server
server.on("connection", (ws, _) => {
  const id = ++userCount;

  const player = new Player(id, ws);
  players.set(id, player);
  authorize(player);

  ws.on("message", (data) => {
    // UNCOMMENT for debugging
    // console.debug("Message from client:", data.toString());

    const req = parseRequest(data.toString());
    if (!req) {
      sendError(ws, "BadRequest");
      return;
    }

    switch (req.type) {
      case "MatchingRequest": {
        const opponent = players.get(req.opponent);

        if (!opponent)
          sendError(ws, "PlayerNotFound");
        // player is already matching against another player/ teams against himself
        else if (opponent.matching || opponent.id === id)
          sendError(ws, "PlayerMatching");
        else if (opponent.inGame)
          sendError(ws, "PlayerInGame");
        else {
          player.matchingOpponent = opponent.id;
          opponent.matchingOpponent = id;
          sendMessage(ws, "Waiting for the player's response!");
          const oppReq : GameRequest =
                  {
                    type: "MatchingRequest",
                    opponent: id,
                    message: `${player} wants to play against you, do you accept?`
                  };

          send(opponent.ws, oppReq);
          matchingRequests.set(opponent.id, id);
        }
      }
        break;
      case "MatchingResponse": {
        const opponentId = player.matchingOpponent;

        // Defensive scenario
        if (!opponentId) {
          sendError(ws, "PlayerNotFound");
          return;
        }

        const opponent : Player = players.get(opponentId)!;
        const {accepted} = req;

        // after this request ends - regardless of its accepted state - they won't be matching
        player.matchingOpponent = null;
        opponent.matchingOpponent = null;
        matchingRequests.delete(id);

        const res : GameRequest = {
          ...req, // same request state but different message
          message: accepted
            ? `Your request was accepted, the match is about to start!`
            : `Your request was rejected.`
        };

        send(opponent.ws, res);

        if (accepted) {
          // Note that inGame is handled internally
          // opponent is the one who sent the first request so they get X
          opponent.startGame(player);
          updateGame(player, opponent);
        }
      }
        break;
      case "GameMove": {
        // Handle if opponent doesn't exist (defensive scenario)
        if (!player.opponent) {
          sendError(ws, "PlayerNotFound");
          return;
        }

        if (!player.game || player.game.currentTurn !== id) {
          sendError(ws, "BadRequest");
          return;
        }

        const {rowNum, colNum} = req;
        handleMove(player, player.opponent, rowNum, colNum);
      }
        break;
      default:
        console.error(`Received an impossible request from ${player}!!!`);
        break;
    }
  });

  ws.on("error", console.error);

  ws.on("close", () => {
    console.log(`${player} has left.`);

    if (player.inGame)
      abortGame(player);
    else if (player.matching) {
      // close any matching requests and reject any sent ones
      const opponentId = player.matchingOpponent!;
      const opponent = players.get(opponentId)!;

      player.matchingOpponent = null;
      opponent.matchingOpponent = null;

      if (matchingRequests.has(id)) {
        const req : GameRequest =
            {type: "MatchingResponse", message: "Your request was rejected.", accepted: false};

        send(opponent.ws, req);
        matchingRequests.delete(id);
      }
      else {
        const req : GameRequest =
            {type: "MatchingResponse", message: "Player has aborted the request.", accepted: false};

        send(opponent.ws, req);
        matchingRequests.delete(opponentId);
      }
    }

    players.delete(id);
  });
});
