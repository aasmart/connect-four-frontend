import { GameForm } from "@/components/GameForm"
import Title from "@/components/Title"

export default async function Home() {
    return (
        <main>
            <Title />
            <GameForm />
        </main>
    )
}