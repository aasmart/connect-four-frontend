import { Dispatch, SetStateAction, createContext } from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Modal from '@/components/Modal'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Connect Four',
    description: 'Generated by create next app',
}

async function sessionHandshake() {
    await fetch("/api", {
        credentials: "include",
        headers: {
            Accept: "application/json"
        },
        method: 'GET',
    }).then(res => {
        console.log(res)
    }).catch(err => {
        console.log(err);
    })
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await sessionHandshake();

    return (
      <html lang="en">
          <body className={inter.className}>
                {children}
            </body>
      </html>
    )
}
