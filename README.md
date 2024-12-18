## Getting Started

First, create a file named `.env.local` inside of the project's root folder. Then, paste the following code into it:
```
SERVER_PORT=8080
SERVER_PROTOCOL=http://
SERVER_URL=localhost
NEXT_PUBLIC_SERVER_PORT=$SERVER_PORT
NEXT_PUBLIC_SERVER_PROTOCOL=$SERVER_PROTOCOL
NEXT_PUBLIC_SERVER_URL=$SERVER_URL
```

Afterwards, the frontend can be ran using one of the following:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demonstration of the Website
https://github.com/user-attachments/assets/9cfac8e2-c33c-4ad4-ac5f-97724640b6e5

This demonstration lacks the chat feature, which was added later
