import { useEffect, useState } from "react";

export function CopyButton({
    content,
    className
}: {
    content: string,
    className: string
}) {
    const canCopy = window.isSecureContext && navigator.clipboard;
    const [copied, setCopied] = useState(false);

    const copyToClippboard = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true)
        }, () => {
            console.log("Couldn't copy join code to clipboard");
        })
    };

    useEffect(() => {
        if(!copied)
            return;
        const copyTimer = setTimeout(() => {
            setCopied(false);
        }, 1500);

        return () => clearTimeout(copyTimer);
    }, [copied])

    return (
        <button 
            className={`${className} copy-button`} 
            type="button"
            title={canCopy ? "Copy to clipboard" : ""}
            data-can-copy={canCopy}
            data-copied={copied}
            onClick={canCopy ? copyToClippboard : () => {}}
        >
            {content}
        </button>
    )
}