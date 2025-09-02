export type ErrorCode = "PlayerNotFound" | "PlayerMatching" | "PlayerInGame" | "GameError"
export type GameRequest =
  | {type: "Message", message: string}
  | {type: "Authorization", message: string, id: number}
  | {type: "MatchingRequest", message?: string, opponent: number}
  | {type: "MatchingResponse", accepted: boolean, message?: string}
  | {type: "ErrorResponse", message: string, code: ErrorCode}
  | {type: "GameMove", message?: string, rowNum: number, colNum: number}
  | {type: "GameUpdate", message: string, turn: number, finished: boolean};
