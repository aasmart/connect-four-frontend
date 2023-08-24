import React, { FC, FunctionComponent, ReactElement, ReactNode, useEffect, useRef } from "react"
import LoadingBar from "./LoadingBar";

type ChildrenProps = React.PropsWithChildren<{
    children: React.ReactNode
}>

type FunctionalComponentWithChildren = React.FC<ChildrenProps>;

type ModalFunctionalComponent = React.FC<ChildrenProps & React.PropsWithChildren<{
    isVisible: boolean,
    closeCallback: () => void
}>>;

type ButtonsComponent = FunctionalComponentWithChildren;
type LoadingBarComponent = FunctionComponent;
type BodyComponent = FunctionalComponentWithChildren;
export type ModalComponent = ModalFunctionalComponent & {
    Body: BodyComponent;
    LoadingBar: LoadingBarComponent;
    Buttons: ButtonsComponent;
}

const Modal: ModalComponent = ({
    children, 
    isVisible,
    closeCallback
}: {
    children: React.ReactNode, 
    isVisible: boolean,
    closeCallback: () => void
}): JSX.Element => {
    const dialog = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        if(isVisible)
            dialog?.current?.showModal();
        else
            dialog?.current?.close();
    }, [isVisible]);

    useEffect(() => {
        dialog?.current?.addEventListener("close", closeCallback);
    }, []);

    return (
        <dialog id="popup" ref={dialog}>
            <form method="dialog">
                {children}
            </form>
        </dialog>
    );
} 

const Body: BodyComponent = ({children}: {children: React.ReactNode}): JSX.Element => (
    <div id="popup-body">
        <p>
            {children}
        </p>
    </div>
);

const DialogLoadingBar: LoadingBarComponent = (): JSX.Element => {
    return  <LoadingBar circleSize="2rem"/>
}

const Buttons: ButtonsComponent = ({children}: {children: React.ReactNode}): JSX.Element => {
    return (
        <div id="popup-buttons" className="flex row centered" style={{"--gap": "1rem"} as React.CSSProperties}>
            {children}
        </div>
    )
}

Modal.Body = Body;
Modal.LoadingBar = DialogLoadingBar;
Modal.Buttons = Buttons;

export default Modal;
