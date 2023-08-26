interface GameState {
    gameTiles: GameTile[]
    isPlayerOneTurn: boolean
    gameStatus: GameStatus,
    playerOneRematch: boolean,
    playerTwoRematch: boolean,
    joinCode: string,
    playerOneConnected: boolean,
    playerTwoConnected: boolean,
    rematchDenied: boolean
    disconnectedPlayerTimeout: string
}

enum PieceType {
    RED,
    YELLOW,
    EMPTY
}
  
enum GameStatus {
    ACTIVE,
    DRAWN,
    WON,
    PLAYER_ONE_WON,
    PLAYER_TWO_WON,
    WAITING_FOR_PLAYERS,
    PLAYER_DISCONNECTED,
    PLAYER_ONE_FORFEIT,
    PLAYER_TWO_FORFEIT,
    PLAYERS_DISCONNECTED,
}
  
interface GameTile {
    pieceType: number,
    canPlace: boolean
}

type PlayerRole =
    "PLAYER_ONE" |
    "PLAYER_TWO" |
    "SPECTATOR"

interface PlayerData {
    playerRole: PlayerRole
}

export { type GameState, PieceType, GameStatus, type GameTile, type PlayerData, type PlayerRole}