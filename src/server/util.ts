import type { WebSocket } from "ws";
import { styleText } from "util";
import { Game, type Player } from "../game.ts";
import { serverMark, errorMark, xMark, oMark } from "../styles.ts";
import type { ErrorCode, GameRequest } from "../types.ts";

const send = (ws : WebSocket, req : GameRequest) => {
  req.message = `${serverMark} ${req.message}`;
  ws.send(JSON.stringify(req));
};

const authorize = (player : Player) => {
  const req : GameRequest = {type: "Authorization",
    message: `Welcome ${player}, please remember your ID!`, id: player.id};
  send(player.ws, req);

  console.log(`${player} is successfully connected!`);
};

const sendMessage = (ws : WebSocket, message : string) => {
  const req : GameRequest = {type: "Message", message};
  send(ws, req);
};

const sendError = (ws : WebSocket, code : ErrorCode, msg? : string) => {
  const messages : {[Code in ErrorCode]?: string} = {
    "PlayerNotFound": "This player doesn't exist, please double check their ID!",
    "PlayerInGame": "This player is currently in a game, please try another ID.",
    "PlayerMatching": "This player is currently matching, please try again later."
  };

  const message = messages[code] || msg;
  if (!message)
    throw new Error("Invalid error code!");

  const req : GameRequest = {type: "ErrorResponse", message: `${errorMark} ${message}`, code};
  ws.send(JSON.stringify(req));
};

// update the clients with new moves
const updateGame = async (player : Player, opponent : Player) => {
  const game = player.game;
  if (!game)
    return;

  // swap players to make sure "player" references the current player
  if (game.currentTurn !== player.id)
    [player, opponent] = [opponent, player];

  let msg;

  switch (game.winner) {
    case Game.BLANK:
      msg = "It's a tie";
      break;
    case "X":
      msg = `${xMark}wins.`;
      break;
    case "O":
      msg = `${oMark}wins`;
      break;
    default:
      msg = `It's ${player}'s turn!`;
      break;
  }

  const req : GameRequest = {
    type: "GameUpdate",
    message: `${game.getGrid()}\n${serverMark} ${styleText("bold", msg)}`,
    turn: game.currentTurn,
    finished: game.finished,
  };

  player.ws.send(JSON.stringify(req));
  opponent.ws.send(JSON.stringify(req));
};

const handleMove = async (player : Player, opponent : Player, rowNum : number, colNum : number) => {
  const game = player.game;
  if (!game)
    throw new Error("Game doesn't exist!");

  if (game.currentTurn === opponent.id)
    // swap both players to maintain the logic
    [player, opponent] = [opponent, player];

  try {
    const res = game.applyMove(rowNum, colNum);
    updateGame(player, opponent);

    if (res !== null)
      player.endGame();
  }
  catch (error) {
    if (error.name !== "GameError")
      throw error;

    sendError(player.ws, "GameError", error.message);
  }
};

const abortGame = async (player : Player) => {
  const {game, opponent} = player;
  if (!game || !opponent)
    return;

  // turn should be as if this player has played his move (for lock mechanism)
  const turn = game.currentTurn === player.id ? opponent.id : player.id;
  const req : GameRequest = {type: "GameUpdate", finished: true, turn,
    message: `${player} has abandoned the game, you win.`};

  send(opponent.ws, req);
  player.endGame();
};

export {
  abortGame,
  authorize,
  handleMove,
  send,
  sendError,
  sendMessage,
  updateGame,
};
