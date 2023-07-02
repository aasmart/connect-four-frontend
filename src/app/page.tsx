import { DialogLayout } from "@/components/DialogLayout"
import { GameForm } from "@/components/GameForm"
import Modal from "@/components/Modal"
import Title from "@/components/Title"

export default async function Home() {
    return (
        <DialogLayout>
            <main>
                <Title />
                <GameForm />
            </main>
        </DialogLayout>
    )
}