export type ErrorCode = "PlayerNotFound" | "PlayerMatching" | "PlayerInGame" | "GameError"
export type GameRequest =
  | {type: "Message", message: string}
  | {type: "Authorization", message: string, id: number}
  | {type: "MatchingRequest", message?: string, opponent: number}
  | {type: "MatchingResponse", message?: string, accepted: boolean}
  | {type: "ErrorResponse", message: string, code: ErrorCode}
  | {type: "GameMove", message?: string, rowNum: number, colNum: number}
  | {type: "GameUpdate", message: string, turn: number, finished: boolean};

export type Unlocker = () => void;
