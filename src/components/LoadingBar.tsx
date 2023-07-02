export default function LoadingBar({
    circleSize = "4rem"
}: {
    circleSize: string
}) {
    return  (
        <div className="loading-bar">
            <span style={{"--animation-delay": "0ms", "--color": "red", "--size": circleSize} as React.CSSProperties}></span>
            <span style={{"--animation-delay": "250ms", "--color": "gold", "--size": circleSize} as React.CSSProperties}></span>
            <span style={{"--animation-delay": "500ms", "--color": "red", "--size": circleSize} as React.CSSProperties}></span>
        </div>
    )
}