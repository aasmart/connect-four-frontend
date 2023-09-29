import { useEffect, useRef } from "react";

export default function useWebsocket(
    url: string,
    onOpen: () => void,
    onMessage: (message: MessageEvent<any>) => void,
    onClose: () => void,
    onError: () => void
): ((message: any) => void) {
    const client = useRef<WebSocket | null>(null);

    useEffect(() => {
        client.current = new WebSocket(url);
        client.current.onopen = onOpen;
        client.current.onmessage = onMessage;
        client.current.onclose = onClose;
        client.current.onerror = onError;

        const currentClient = client.current;

        return () => currentClient.close();
    }, []);

    return (message: any) => {
        if(client.current) {
            client.current.send(message);
        }
    };
}