import { GameState, GameStatus } from "@/@types/Game";
import { useContext } from "react";
import { ModalContext } from "../DialogLayout";
import Modal from "../Modal";

export default function ExitGameButton({
    disabled
}: {
    disabled: boolean
}) {
    const modalContext = useContext(ModalContext);

    const exitGame = () => {
        window.location.href = `/`;
        return;
    }
    
    return (
        <button type="submit" 
                className="basic-button" 
                id="leave-game" 
                onClick={exitGame}
                disabled={disabled} 
                data-action="destructive"
        >
            Exit Game
        </button>
    )
}