import { GameState, GameStatus, PlayerRole } from "@/@types/Game";
import { useContext, useEffect } from "react";
import Modal from "../Modal";

export function RematchButton({
    gameId,
    state,
    playerRole,
    requestRematchandler
}: {
    gameId: string,
    state: GameState,
    playerRole: PlayerRole,
    requestRematchandler: (gameId: string, state: GameState, playerRole: PlayerRole) => void
}) {
    const isDisabled = state.gameStatus == GameStatus.ACTIVE ||
        state.gameStatus == GameStatus.WAITING_FOR_PLAYERS ||
        !state.playerOneConnected ||
        !state.playerTwoConnected ||
        state.rematchDenied

    return (
        <button type="submit" 
                className="basic-button" 
                id="play-again" 
                onClick={() => requestRematchandler(gameId, state, playerRole)} 
                disabled={isDisabled}
                data-action="normal"
        >
            Request Rematch
        </button>
    )
}