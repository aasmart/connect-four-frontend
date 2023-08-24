import Modal, { ModalComponent } from "@/components/Modal";
import { ReactNode, useState } from "react";

export default function useModal(
    modalChildren: JSX.Element,
    shown: boolean,
    modalCloseCallback?: () => void
) {
    return (
        <Modal isVisible={shown} closeCallback={modalCloseCallback ?? (() => {})}>
            {modalChildren}
        </Modal>
    );
}