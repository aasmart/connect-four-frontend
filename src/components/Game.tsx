'use client'

import Image from 'next/image'
import { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CopyButton } from '@/components/CopyButton';
import { RematchButton } from '@/components/GameComponents/RematchButton';
import { GameState, GameStatus, PieceType, PlayerData, PlayerRole } from '@/@types/Game';
import Modal from '@/components/Modal';
import ExitGameButton from './GameComponents/ExitGameButton';
import LoadingBar from './LoadingBar';
import ForfeitButton from './GameComponents/ForfeitButton';
import useModal from '@/hooks/modal';

export default function Game() {
    const params = useSearchParams();
    const gameId = params.get("id") || "";

    const [player, setPlayer] = useState<PlayerData>({} as PlayerData);
    const [state, setState] = useState<GameState | null>();
    const [remainingTimeoutTime, setRemainingTimeoutTime] = useState<number>(-1);

    const requestRematch = (gameId: string, state: GameState, playerRole: PlayerRole) => {
        let action= "send";
    
        if((state.playerOneRematch && playerRole === "PLAYER_ONE") ||
            (state.playerTwoRematch && playerRole === "PLAYER_TWO")
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

    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const disconnectModal = useModal(
        <>
            <Modal.Body>
                Disconnected from game...
            </Modal.Body>
            <Modal.Buttons>
                <button className="basic-button"
                        onClick={() => window.location.reload() }
                >
                    Reload
                </button>
                <button className="basic-button"
                        onClick={() => window.location.href = "/"}>
                    Quit
                </button>
            </Modal.Buttons>
        </>,
        showDisconnectModal
    );
    const [showFailedConnectModal, setShowFailedConnectModal] = useState(false);
    const failedConnectModal = useModal(
        <>
            <Modal.Body>
                Failed to connect to game...
            </Modal.Body>
            <Modal.Buttons>
                <button className="basic-button"
                        onClick={() => window.location.reload() }
                >
                    Reload
                </button>
                <button className="basic-button"
                        onClick={() => window.location.href = "/"}>
                    Quit
                </button>
            </Modal.Buttons>
        </>,
        showFailedConnectModal
    );
    const [showFailedLoadModal, setShowFailedLoadModal] = useState(false);
    const failedLoadModal = useModal(
        <Modal.Body>
            Failed to fetch player data. Try refreshing the page.
        </Modal.Body>,
        showFailedLoadModal
    );

    useEffect(() => {
        const client = new WebSocket(`ws://${process.env.NEXT_PUBLIC_SERVER_URL}:${process.env.NEXT_PUBLIC_SERVER_PORT}/api/game/${gameId}`);

        client.onclose = () => { setShowDisconnectModal(true); }

        client.onerror = () => { setShowFailedConnectModal(true); }

        client.onopen = () => {
            fetch(`api/game/${gameId}/player-data`).then(res => {
                if(!res.ok)
                    throw new Error();

                return res.json();
            }).then(data => {
                const playerData: PlayerData = JSON.parse(JSON.stringify(data));
                setPlayer(playerData);
            }).catch(err => {
                console.log(err);
                setShowFailedLoadModal(true);
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

        let timeoutUpdateInterval: NodeJS.Timer;
        if(state.disconnectedPlayerTimeout) {
            const playerTimeoutDate = new Date(state.disconnectedPlayerTimeout);

            const updateTimeLeft = () => {
                const timeLeft = new Date(playerTimeoutDate.valueOf() - new Date().valueOf());
                setRemainingTimeoutTime(timeLeft.getSeconds());
            };

            updateTimeLeft();

            timeoutUpdateInterval = setInterval(updateTimeLeft, 1000);
        }

        return () => {
            clearInterval(timeoutUpdateInterval);
        }
    }, [state])

    if(!state) {
        return (
            <div className="flex column centered" style={{margin: "2rem", gap: "2rem"}}>
                <LoadingBar circleSize="3rem"/>
                <h2>Connecting to game. This may take a moment.</h2>
            </div>
        )
    }

    const waitingModal = useModal(
        <>
            <Modal.LoadingBar />
            <Modal.Body>
                {"Waiting for players...\n Game Code:"}
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
        </>,
        state.gameStatus === GameStatus.WAITING_FOR_PLAYERS
    );

    const disconnectForfeitModal = useModal(
        <>
            <Modal.LoadingBar />
            <Modal.Body>
                <strong>
                    Player disconnected
                </strong>
                {
                    "\nThey will automatically forfeit the game if they do not reconnect: \n"
                }
                <strong>
                    {remainingTimeoutTime} {remainingTimeoutTime == 1 ? "second" : "seconds"}.
                </strong>
            </Modal.Body>
        </>,
        state.gameStatus == GameStatus.PLAYER_DISCONNECTED
    );

    const rematchSentModal = useModal(
        <>
            <Modal.LoadingBar />
            <Modal.Body>
                Your rematch request was sent
            </Modal.Body>
            <Modal.Buttons>
                <button className="basic-button"
                        data-action="destructive"
                        type="button"
                        onClick={() => requestRematch(gameId, state, player.playerRole)}
                >   
                    Cancel Rematch Request
                </button>
            </Modal.Buttons>
        </>,
        ((state.playerOneRematch && player.playerRole === "PLAYER_ONE") ||
        (state.playerTwoRematch && player.playerRole === "PLAYER_TWO")) &&
        !state.rematchDenied
    );

    const rematchReceivedModal = useModal(
        <>
            <Modal.Body>
                Your opponent has requested a rematch
            </Modal.Body>
            <Modal.Buttons>
                <button className="basic-button"
                        data-action="normal"
                        type="button"
                        onClick={() => requestRematch(gameId, state, player.playerRole)}
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
        </>,
        ((state.playerOneRematch && player.playerRole === "PLAYER_TWO") 
        || (state.playerTwoRematch && player.playerRole === "PLAYER_ONE")) 
        && !state.rematchDenied
    );

    const rematchDeclinedModal = useModal(
        <>
            <Modal.Body>
                Your opponent declined your rematch request
            </Modal.Body>
            <Modal.Buttons>
                <button className="basic-button"
                        data-action="normal"
                        type="submit"
                        onClick={() => requestRematch(gameId, state, player.playerRole)}
                >   
                    Okay
                </button>
            </Modal.Buttons>
        </>,
        ((state.playerOneRematch && player.playerRole === "PLAYER_ONE") 
        || (state.playerTwoRematch && player.playerRole === "PLAYER_TWO")) 
        && state.rematchDenied
    );

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
        const isTurn = state.isPlayerOneTurn && player.playerRole === "PLAYER_ONE" ||
                        !state.isPlayerOneTurn && player.playerRole === "PLAYER_TWO";

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
            {waitingModal}
            {disconnectForfeitModal}
            {rematchSentModal}
            {rematchReceivedModal}
            {rematchDeclinedModal}
            {disconnectModal}
            {failedLoadModal}
            {failedConnectModal}

            <h2 id="state-title">
            {getTitleString(state, player.playerRole)}
            </h2>
            <div className="flex centered column" style={{"--gap": "1rem"} as React.CSSProperties}>
                <div className="gameBoard">
                    {tiles}
                </div>

                <div className="flex row centered game-buttons" style={{"--gap": "1rem"} as React.CSSProperties}>
                    <RematchButton 
                        gameId={gameId}
                        state={state}
                        playerRole={player.playerRole}
                        requestRematchandler={requestRematch}
                    />
                    {state.gameStatus == GameStatus.ACTIVE || state.gameStatus == GameStatus.PLAYER_DISCONNECTED ?
                        <ForfeitButton 
                            gameId={gameId}
                            disabled={
                                state.gameStatus == GameStatus.PLAYER_DISCONNECTED || player.playerRole === "SPECTATOR"
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

function getTitleString(state: GameState, playerRole: PlayerRole) {
    let title = "";
    switch(state.gameStatus) {
        case GameStatus.ACTIVE:
            if(state.isPlayerOneTurn)
                if(playerRole === "PLAYER_ONE")
                    title = "It's your turn!";
                else
                    title = "It's Player 1's turn!"
            else if(!state.isPlayerOneTurn)
                if(playerRole === "PLAYER_TWO")
                    title = "It's your turn!";
                else
                    title = "It's Player 2's turn!"
            break;
        case GameStatus.PLAYER_ONE_WON:
            if(playerRole === "PLAYER_ONE")
                title = "You won!"
            else if(playerRole === "PLAYER_TWO")
                title = "Player One wins!"
            break;
        case GameStatus.PLAYER_TWO_WON:
            if(playerRole === "PLAYER_TWO")
                title = "You won!"
            else if(playerRole === "PLAYER_ONE")
                title = "Player Two wins!"
            break;
        case GameStatus.PLAYER_ONE_FORFEIT:
            if(playerRole === "PLAYER_TWO")
                title = "You won by forfeit!"
            else if(playerRole === "PLAYER_ONE")
                title = "Player Two wins by forfeit!"
            break;
        case GameStatus.PLAYER_TWO_FORFEIT:
            if(playerRole === "PLAYER_ONE")
                title = "You won by forfeit!"
            else if(playerRole === "PLAYER_TWO")
                title = "Player Two wins by forfeit!"
            break;
        case GameStatus.DRAWN:
            title = "The game has ended in a draw"
            break;
        case GameStatus.WAITING_FOR_PLAYERS:
        case GameStatus.PLAYER_DISCONNECTED:
            title = "Waiting for players to join"
            break;
        case GameStatus.PLAYERS_DISCONNECTED:
            title = "Both players have disconnected from the game";
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