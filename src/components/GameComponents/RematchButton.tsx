import { GameState, GameStatus } from "@/@types/Game";
import { useContext, useEffect } from "react";
import { ModalContext } from "../DialogLayout";
import Modal from "../Modal";

export function RematchButton({
    gameId,
    state,
    isPlayerOne,
    requestRematchandler
}: {
    gameId: string,
    state: GameState,
    isPlayerOne: boolean,
    requestRematchandler: (gameId: string, state: GameState, isPlayerOne: boolean) => void
}) {
    const modalContext = useContext(ModalContext);

    const isDisabled = state.gameStatus == GameStatus.ACTIVE ||
        state.gameStatus == GameStatus.WAITING_FOR_PLAYERS ||
        !state.playerOneConnected ||
        !state.playerTwoConnected ||
        state.rematchDenied

    return (
        <button type="submit" 
                className="basic-button" 
                id="play-again" 
                onClick={() => requestRematchandler(gameId, state, isPlayerOne)} 
                disabled={isDisabled}
                data-action="normal"
        >
            Request Rematch
        </button>
    )
}