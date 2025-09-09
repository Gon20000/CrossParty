import type { WebSocket } from "ws";
import { oMark, oMark2, xMark, xMark2 } from "./styles.ts";
import { styleText } from "node:util";

type Players = {"X" : number, "O" : number};
class GameError extends Error {
  code : string;

  constructor(code : string, message : string) {
    super(message);
    this.name = "GameError";
    this.code = code;
  }
}

class Game {
  static BLANK = ".";
  #size = 3; // To avoid magic numbers and basically futureproofing
  #turnCount = 0;
  #grid = Array.from({length: this.#size}, () => Array(this.#size).fill(Game.BLANK));
  #players : Players; // symbol: playerID
  #lastMove = [-1, -1];
  winner : string | null = null;

  // default constructor
  constructor(players : Players) {
    this.#players = players;
  }

  get currentTurn() : number {
    return this.#turnCount % 2 ? this.#players["O"] : this.#players["X"];
  }

  get finished() : boolean { return this.winner !== null; }

  #empty(cell : string) { return cell === Game.BLANK; }

  // Check whehter a row is filled with X or O
  #checkRow(rowNum: number) {
    const firstElement = this.#grid[rowNum][0];

    // if the first element is empty, then it can't be a winning row
    if (this.#empty(firstElement))
      return Game.BLANK;

    // Match every other element with the first element
    for (let i = 1; i < this.#size; ++i)
      if (this.#grid[rowNum][i] !== firstElement)
        return Game.BLANK;

    return firstElement;
  }

  #checkColumn(colNum : number) {
    const firstElement = this.#grid[0][colNum];

    // if the first element is empty, then it can't be a winning column
    if (this.#empty(firstElement))
      return Game.BLANK;

    // Match every other element with the first element
    for (let i = 1; i < this.#size; ++i)
      if (this.#grid[i][colNum] !== this.#grid[0][colNum])
        return Game.BLANK;

    return firstElement;
  }

  #checkMainDiagonal(rowNum : number, colNum : number) {
    if (rowNum !== colNum)
      return Game.BLANK;

    const firstElement = this.#grid[0][0];

    // if the first element is empty, then it can't be a winning diagonal
    if (this.#empty(firstElement))
      return Game.BLANK;

    // Match every other element with the first element
    for (let i = 1; i < this.#size; ++i)
      if (this.#grid[i][i] !== firstElement)
        return Game.BLANK;
    return firstElement;
  }

  #checkOtherDiagonal(rowNum : number, colNum : number) {
    if (rowNum + colNum !== this.#size - 1)
      return Game.BLANK;

    const firstElement = this.#grid[0][this.#size - 1];

    // if the first element is empty, then it can't be a winning diagonal
    if (this.#empty(firstElement))
      return Game.BLANK;

    // Match every other element with the first element
    for (let i = 1; i < this.#size; ++i)
      if (this.#grid[i][this.#size - 1 - i] !== firstElement)
        return Game.BLANK;
    return firstElement;
  }

  #checkWin(rowNum : number, colNum : number) {
    // If no player has reached the 3rd move (for a 3x3 grid), the game goes on
    if (Math.ceil(this.#turnCount / 2.0) < this.#size)
      return;

    const results = [
      this.#checkRow(rowNum),
      this.#checkColumn(colNum),
      this.#checkMainDiagonal(rowNum, colNum),
      this.#checkOtherDiagonal(rowNum, colNum)
    ];

    const found = results.find(result => result !== Game.BLANK);
    if (found)
      this.winner = found;
    // GAME OVER - draw
    else if (this.#turnCount === this.#size ** 2)
      this.winner = Game.BLANK;
  }

  applyMove(rowNum : number, colNum : number) {
    if (Math.min(rowNum, colNum) < 1 || Math.max(rowNum, colNum) > this.#size)
      throw new GameError("OUT_OF_BOUNDS", `Invalid coordinates for a ${this.#size}x${this.#size} grid`);

    if (!this.#empty(this.#grid[--rowNum][--colNum]))
      throw new GameError("USED_CELL", "Can't play a move on a non-empty cell!");

    // handle the move
    this.#grid[rowNum][colNum] = this.currentTurn === this.#players["X"] ? "X" : "O";
    ++this.#turnCount;
    this.#lastMove = [rowNum, colNum];
    this.#checkWin(rowNum, colNum);

    return this.winner;
  }

  getGrid() {
    const renderCell = (cell : string, last : boolean) => {
      if (last)
        return cell === "X" ? xMark2 : oMark2;

      if (cell === "X") return xMark;
      else if (cell === "O") return oMark;

      // the rest have the padding
      return ` ${styleText("bold", cell)} `;
    };

    let res = "";
    for (let i = 0; i < this.#size; i++) {
      const row = this.#grid[i].map((cell, j) =>
        renderCell(cell, this.#lastMove[0] === i && this.#lastMove[1] === j)).join("│");
      res += `\n\t${row}`;
      if (i < this.#size - 1) res += "\n\t───┼───┼───";
    }

    // this excessive padding is because of weird bugs on windows
    return `\n\n${res}\n\n`;
  }
};

class Player {
  #id : number;
  game : Game | null = null;
  opponent : Player | null = null;
  // ID for the opponent you're matching with
  matchingOpponent : number | null = null;
  ws : WebSocket;

  constructor(id : number, ws : WebSocket) {
    this.#id = id;
    this.ws = ws;
  }

  get id() {
    return this.#id;
  }

  get matching() {
    return this.matchingOpponent !== null;
  }

  get inGame() {
    return this.game !== null;
  }

  startGame(player : Player) {
    this.game = new Game({"X": this.id, "O": player.id});
    player.game = this.game;
    player.opponent = this;
    this.opponent = player;
  }

  endGame() {
    const {opponent} = this;
    // If there's no opponent, then the opponent called endGame() himself
    if (!this.game || !opponent)
      return;

    this.game = null;
    opponent.game = null;
    this.opponent = null;
    opponent.opponent = null;
  }

  toString() {
    return styleText("bold", `Player#${this.id}`);
  }
}

export {
  Player,
  Game
};

