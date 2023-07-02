'use client'

import Image from 'next/image'
import { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CopyButton } from '@/components/CopyButton';
import { RematchButton } from '@/components/GameComponents/RematchButton';
import { GameState, GameStatus, PieceType } from '@/@types/Game';
import Modal from '@/components/Modal';
import { ModalContext } from './DialogLayout';
import ExitGameButton from './GameComponents/ExitGameButton';
import LoadingBar from './LoadingBar';
import ForfeitButton from './GameComponents/ForfeitButton';

export default function Game() {
    const params = useSearchParams();
    const gameId = params.get("id") || "";

    const [player, setPlayer] = useState<PlayerData>({} as PlayerData);
    const [isPlayerOne, setIsPlayerOne] = useState<boolean>(false);
    const [state, setState] = useState<GameState | null>();

    const modalContext = useContext(ModalContext);

    const requestRematch = (gameId: string, state: GameState, isPlayerOne: boolean) => {
        let action= "send";
    
        if((state.playerOneRematch && isPlayerOne) ||
            (state.playerTwoRematch && !isPlayerOne)
        ) {
            action = "withdraw";
        }
    
        fetch(`api/game/${gameId}/rematch-request/${action}`, {
            method: "POST"
        }).then(res => {
            if(!res.ok)
                throw new Error();
        }).catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        const client = new WebSocket(`ws://${process.env.SITE_URL}/api/game/${gameId}`);

        client.onclose = () => {
            modalContext?.setContent(
                <>
                    <Modal.Body>
                        Disconnected from game...
                    </Modal.Body>
                </>
            )
            modalContext?.setIsVisibile(true);
        }

        client.onerror = () => {
            modalContext?.setContent(
                <>
                    <Modal.Body>
                        Failed to connect to game...
                    </Modal.Body>
                </>
            )
            modalContext?.setIsVisibile(true);
        }

        client.onopen = () => {
            console.log("Connected")

            fetch(`api/game/${gameId}/player-data`).then(res => {
                if(!res.ok)
                    throw new Error();

                return res.json();
            }).then(data => {
                const playerData: PlayerData = JSON.parse(JSON.stringify(data));
                setPlayer(playerData);
                setIsPlayerOne(playerData.playerRole == "PLAYER_ONE");
            }).catch(err => {
                console.log(err);
                modalContext?.setContent(
                    <Modal.Body>
                        Failed to fetch player data. Attempt refreshing the page.
                    </Modal.Body>
                )
                modalContext?.setIsVisibile(true);
            });
        }

        client.onmessage = (e) => {
            try {
                const newState: GameState = JSON.parse(e.data);
                setState(newState);
            } catch (e) {
                console.log(e)
            }
        }

        return () => {
          client.close();
        }
    }, []);
    

    useEffect(() => {
        if(!state)
            return () => {};

        if(state.gameStatus == GameStatus.WAITING_FOR_PLAYERS) {
            modalContext?.setContent(
                <>
                    <Modal.LoadingBar />
                    <Modal.Body>
                        {"Waiting for players...\n Join Code:"}
                        <CopyButton 
                            content={state.joinCode}
                            className={"join-code"}
                        />
                    </Modal.Body>
                    <Modal.Buttons>
                        <ExitGameButton 
                            disabled={false}
                        />
                    </Modal.Buttons>
                </>
            )
            modalContext?.setIsVisibile(true);
        } else if(state.gameStatus == GameStatus.PLAYER_DISCONNECTED) {
            modalContext?.setContent(
                <>
                    <Modal.LoadingBar />
                    <Modal.Body>
                        Waiting for players to reconnect...
                    </Modal.Body>
                </>
            )
            modalContext?.setIsVisibile(true);
        } else if(
            ((state.playerOneRematch && isPlayerOne) ||
            (state.playerTwoRematch && !isPlayerOne)) &&
            !state.rematchDenied
        ) {
            modalContext?.setContent(
                <>
                    <Modal.LoadingBar />
                    <Modal.Body>
                        Your rematch request was sent
                    </Modal.Body>
                    <Modal.Buttons>
                        <button className="basic-button"
                                data-action="destructive"
                                type="button"
                                onClick={() => requestRematch(gameId, state, isPlayerOne)}
                        >   
                            Cancel Rematch Request
                        </button>
                    </Modal.Buttons>
                </>
            );
            modalContext?.setIsVisibile(true);
        } else if((state.playerOneRematch || state.playerTwoRematch) && !state.rematchDenied) {
            modalContext?.setContent(
                <>
                    <Modal.Body>
                        Your opponent has requested a rematch
                    </Modal.Body>
                    <Modal.Buttons>
                        <button className="basic-button"
                                data-action="normal"
                                type="button"
                                onClick={() => requestRematch(gameId, state, isPlayerOne)}
                        >   
                            Accept Rematch
                        </button>
                        <button className="basic-button"
                                data-action="destructive"
                                type="button"
                                onClick={() => {
                                    fetch(`api/game/${gameId}/rematch-request/reject`, {
                                        method: "POST"
                                    }).then(res => {
                                        if(!res.ok)
                                            throw new Error();
                                    })
                                }}
                        >   
                            Reject Rematch
                        </button>
                    </Modal.Buttons>
                </>
            );
            modalContext?.setIsVisibile(true);
        } else if(
            ((state.playerOneRematch && isPlayerOne) || (state.playerTwoRematch && !isPlayerOne)) &&
            state.rematchDenied
        ) {
            modalContext?.setContent(
                <>
                    <Modal.Body>
                        Your opponent declined your rematch request
                    </Modal.Body>
                    <Modal.Buttons>
                        <button className="basic-button"
                                data-action="normal"
                                type="submit"
                                onClick={() => requestRematch(gameId, state, isPlayerOne)}
                        >   
                            Okay
                        </button>
                    </Modal.Buttons>
                </>
            );
            modalContext?.setIsVisibile(true);
        } else {
            modalContext?.setIsVisibile(false);
        }

        return () => {}
    }, [state])

    if(!state) {
        return (
            <div className="flex column centered" style={{margin: "2rem", gap: "2rem"}}>
                <LoadingBar circleSize="3rem"/>
                <h2>Connecting to game. This may take a moment.</h2>
            </div>
        )
    }

    // function reset() {
    //   setDoReset(true)
    //   const resetDelay = 1000 +
    //     (rows - Math.floor(pieces.findIndex(e => e != GameState.none) / columns)) * rowResetDelay

    //   setTimeout(() => {
    //     setDoReset(false)
    //     setPieces(Array(rows * columns).fill(Piece.empty))
    //     setGameState(GameState.none)
    //     setIsRedTurn(true)
    //   }, resetDelay)
    // }

    const tiles = state?.gameTiles.map((tile, index) => {
        const pieceType = PieceType[tile.pieceType];
        const hasPiece = tile.pieceType != PieceType.EMPTY;
        const isTurn = state.isPlayerOneTurn && isPlayerOne ||
                        !state.isPlayerOneTurn && !isPlayerOne;

        const fall = hasPiece ? "fall" : "";
        const piece = hasPiece ? pieceType.toLowerCase() : "";
        const canPlace = tile.canPlace && isTurn ? "canPlace" : "";

        return <button className={`gameTile ${fall} ${piece} ${canPlace}`}
                        disabled={!tile.canPlace || !isTurn}
                        key={index}
                        onClick={() => placePiece(index, gameId)}

        ></button>
    });

    return (
        <>
            <h2 id="state-title">
            {getTitleString(state, isPlayerOne)}
            </h2>
            <div className="flex centered column" style={{"--gap": "1rem"} as React.CSSProperties}>
                <div className="gameBoard">
                    {tiles}
                </div>

                <div className="flex row centered game-buttons" style={{"--gap": "1rem"} as React.CSSProperties}>
                    <RematchButton 
                        gameId={gameId}
                        state={state}
                        isPlayerOne={isPlayerOne}
                        requestRematchandler={requestRematch}
                    />
                    {state.gameStatus == GameStatus.ACTIVE || state.gameStatus == GameStatus.PLAYER_DISCONNECTED ?
                        <ForfeitButton 
                            gameId={gameId}
                            disabled={
                                state.gameStatus == GameStatus.PLAYER_DISCONNECTED
                            }
                        /> :
                        <ExitGameButton 
                            disabled={ state.gameStatus == GameStatus.WAITING_FOR_PLAYERS }
                        />   
                    }
                </div>
            </div>
        </>
    )
}

function getTitleString(state: GameState, isPlayerOne: boolean) {
    let title = "";
    switch(state.gameStatus) {
        case GameStatus.ACTIVE:
            if(state.isPlayerOneTurn)
                if(isPlayerOne)
                    title = "It's your turn!";
                else
                    title = "It's Player 1's turn!"
            else if(!state.isPlayerOneTurn)
                if(!isPlayerOne)
                    title = "It's your turn!";
                else
                    title = "It's Player 2's turn!"
            break;
        case GameStatus.PLAYER_ONE_WON:
            if(isPlayerOne)
                title = "You won!"
            else
                title = "Player One wins!"
            break;
        case GameStatus.PLAYER_TWO_WON:
            if(!isPlayerOne)
                title = "You won!"
            else
                title = "Player Two wins!"
            break;
        case GameStatus.PLAYER_ONE_FORFEIT:
            if(!isPlayerOne)
                title = "You won by forfeit!"
            else
                title = "Player Two wins by forfeit!"
            break;
        case GameStatus.PLAYER_TWO_FORFEIT:
            if(isPlayerOne)
                title = "You won by forfeit!"
            else
                title = "Player Two wins by forfeit!"
            break;
        case GameStatus.DRAWN:
            title = "The game has ended in a draw"
            break;
        case GameStatus.WAITING_FOR_PLAYERS:
        case GameStatus.PLAYER_DISCONNECTED:
            title = "Waiting for players to join"
            break;
        default:
            title = "Unknown state"
            break;
    }

    return title
}

function placePiece(index: number, gameId: string) {
    fetch(`api/game/${gameId}/play-piece/${index}`, {
        method: "POST"
    }).then(res => {
        if(!res.ok)
            throw new Error();
    })
}

interface PlayerData {
  playerRole: string
}