import { useContext } from "react";
import Modal from "../Modal";
import { ModalContext } from "../DialogLayout";

export default function ForfeitButton({
    gameId,
    disabled
}: {
    gameId: string,
    disabled: boolean
}) {
    const modalContext = useContext(ModalContext);

    const tryForfeitGame = () => {
        const confirmForfeit = () => {
            fetch(`api/game/${gameId}/forfeit`, {
                method: "POST"
            }).then(res => {
                if(!res.ok)
                    throw new Error();
            })
        }

        modalContext?.setContent(
            <>
                <Modal.Body>
                    Are you sure you want to forfeit the game?
                </Modal.Body>
                <Modal.Buttons>
                    <button className="basic-button"
                            data-action="destructive"
                            onClick={confirmForfeit}
                    >
                        Confirm
                    </button>
                    <button className="basic-button"
                            data-action="normal"
                            onClick={() => { modalContext?.setIsVisibile(false); }}
                    >
                        Cancel
                    </button>
                </Modal.Buttons>
            </>
        )
        modalContext?.setIsVisibile(true);
    }
    
    return (
        <button type="submit" 
                className="basic-button" 
                id="leave-game" 
                onClick={tryForfeitGame}
                disabled={disabled} 
                data-action="destructive"
        >
            Forfeit Game
        </button>
    )
}