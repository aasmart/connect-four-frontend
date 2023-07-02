import { DialogLayout, ModalContext } from "@/components/DialogLayout";
import Game from "@/components/Game";
import Title from "@/components/Title";

export default function App() {
  return (
    <DialogLayout>
      <main>
        <Title />
        <Game />
      </main>
    </DialogLayout>
  )
}