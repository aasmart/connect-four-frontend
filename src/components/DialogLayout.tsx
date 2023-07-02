"use client"

import { Dispatch, SetStateAction, createContext, useState } from "react"
import Modal from "./Modal";

export const ModalContext = createContext<ModalData | null>(null);

type ModalData = {
    isVisible: boolean,
    setIsVisibile: Dispatch<SetStateAction<boolean>>,
    content: JSX.Element | null,
    setContent: Dispatch<SetStateAction<JSX.Element | null>>
  }

export function DialogLayout({
    children
}: {
    children: React.ReactNode
}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
    
    return (
        <ModalContext.Provider value={{
            isVisible: modalVisible,
            setIsVisibile: setModalVisible,
            content: modalContent,
            setContent: setModalContent
        }}>
            <Modal isVisible={modalVisible}>
                {modalContent}
            </Modal>
            {children}
        </ModalContext.Provider>
    )
}