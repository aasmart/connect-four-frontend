import { useContext, useState } from "react";
import Modal from "../Modal";
import useModal from "@/hooks/modal";

export default function ForfeitButton({
    gameId,
    disabled
}: {
    gameId: string,
    disabled: boolean
}) {
    const confirmForfeit = () => {
        fetch(`api/game/${gameId}/forfeit`, {
            method: "POST"
        }).then(res => {
            if(!res.ok)
                throw new Error();
        })
    }

    const [showForfeitModal, setShowForfeitModal] = useState(false);
    const forfeitModal = useModal(
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
                >
                    Cancel
                </button>
            </Modal.Buttons>
        </>,
        showForfeitModal,
        () => setShowForfeitModal(false)
    )
    const tryForfeitGame = () => {
        setShowForfeitModal(true);
    }
    
    return (
        <>
            <>{forfeitModal}</>
            <button type="submit" 
                    className="basic-button" 
                    id="leave-game" 
                    onClick={tryForfeitGame}
                    disabled={disabled} 
                    data-action="destructive"
            >
                Forfeit Game
            </button>
        </>   
    )
}