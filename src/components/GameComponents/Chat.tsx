import { Message } from "@/@types/Game";
import { FormEvent, FormEventHandler, useEffect, useRef } from "react";

export function Chat({
    sendMessageHandle,
    messages
}: {
    sendMessageHandle: (message: any) => void,
    messages: Message[]
}) {
    const messageList = useRef<HTMLUListElement>(null);

    const sendMessage = (event: FormEvent) => {
        event.preventDefault();

        const data = new FormData(event.target as HTMLFormElement);
        let contents = data.get("contents")?.toString() || "";

        (event.target as HTMLFormElement).reset();

        const message: Message = {
            userId: "",
            contents: contents
        }

        sendMessageHandle(JSON.stringify(message));

        return true;
    }

    const messageItems = messages.map(message => {
        return <MessageListItem name={message.userId} contents={message.contents}/>
    });

    
    useEffect(() => {
        messageList.current?.scrollTo(0, messageList.current?.scrollHeight);
    })

    return (
        <div className="chat">
            <ul className="chat__messages" ref={messageList}>
                {messageItems}
            </ul>
            <form onSubmit={sendMessage}>
                <input type="text" placeholder="Type your message..." id="contents" name="contents"/>
            </form>
        </div>
    );
}

function MessageListItem({
    name,
    contents
}: {
    name: string,
    contents: string
}) {
    return (
        <li className="chat__message">
            <p><span className="chat__message-name">[{name}]:</span> {contents}</p>
        </li>
    )
}