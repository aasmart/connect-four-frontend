"use client"

import { FormEvent, useContext, useEffect, useRef } from "react"
import Modal from "./Modal";
import { ModalContext } from "./DialogLayout";

type Game = {
    id: number
}

export function GameForm({
    
}: {

}) {
    const joinCodeInput = useRef<HTMLInputElement | null>(null);
    const errorMessage = useRef<HTMLElement | null>(null);

    const modalContent = useContext(ModalContext);

    const createFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        fetch(`/api/game`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            }
        }).then(res => {
            if(!res.ok) {
                console.log(res);
                throw new Error();
            }

            return res.json();
        }).then(data => {
            const game = data as Game;
            window.location.href = `/game/?id=${game.id}`
        }).catch(err => {
            console.log(err);
            modalContent?.setIsVisibile(false);
        });

        modalContent?.setContent(<>
            <Modal.LoadingBar />
            <Modal.Body>Creating game...</Modal.Body>
        </>)
        modalContent?.setIsVisibile(true);

        return false;
    }

    const joinFormSubmit = (e: FormEvent) => {
        e.preventDefault();
    
        const formData = new FormData(e.target as HTMLFormElement);
        const joinCode = formData.get("join-code");

        fetch(`/api/game/join?join-code=${joinCode ?? -1}`, {
            method: "POST",
            headers: {
                Accept: "application/json"
            }
        }).then(res => {
            if(!res.ok) {
                return res.text().then(text => {
                    throw new Error(text);
                });
            }

            return res.json();
        }).then(data => {
            const game = data as Game;
            joinCodeInput?.current?.toggleAttribute("aria-invalid", false);

            window.location.href = `game?id=${game.id}`
        }).catch(err => {
            joinCodeInput?.current?.toggleAttribute("aria-invalid", true);
            if(errorMessage.current)
                errorMessage.current.innerText = err.message;

            modalContent?.setIsVisibile(false);
        });

        modalContent?.setContent(<>
            <Modal.LoadingBar />
            <Modal.Body>Searching for game...</Modal.Body>
        </>)
        modalContent?.setIsVisibile(true);

        return false;
    }

    const joinCodeInteract = () => {
        joinCodeInput?.current?.toggleAttribute("aria-invalid", false);
        if(errorMessage.current)
            errorMessage.current.innerText = "";
    }

    return (
        <div className="game-form">
        <form action="/api/game" method="post" onSubmit={createFormSubmit}>
            <h3>Create New Game</h3>
            <button className="basic-button">
                Create Game
            </button>
        </form>

        <form id="join-game" action="/api/game/join" method="get" onSubmit={joinFormSubmit}>
            <h3>Join Existing Game</h3>
            <label>
                Join Code:
                <input type="text"
                       name="join-code"
                       id="join-code"
                       aria-errormessage="join-code-error"
                       placeholder="123456"
                       ref={joinCodeInput}
                       onChange={joinCodeInteract}
                       onKeyUp={joinCodeInteract}
                       required />
                <strong id="join-code-error" ref={errorMessage}></strong>
            </label>
            <button type="submit" className="basic-button">
                Join Game
            </button>
        </form>
    </div>
    )
}