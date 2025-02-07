
# Canvas Comments

This project allows users to place comments on an interactive, draggable image canvas. Built with **React, TypeScript, and Liveblocks**, it supports real-time collaboration.


## Getting Started

### Run Locally

Clone the repository and install dependencies:

```bash
git clone {git url}
cd canvas-comments
npm install
```

### Set Up Liveblocks

1. Create an account on [Liveblocks](https://liveblocks.io/dashboard)
2. Copy your **secret API key** from the [Liveblocks Dashboard](https://liveblocks.io/dashboard/apikeys)
3. Create a `.env.local` file in the root directory and add:

```bash
LIVEBLOCKS_SECRET_KEY=your-secret-key
```

### Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

<details><summary>Read more</summary>

To deploy on [Vercel](https://vercel.com), use the following command:

```bash
npx vercel
```

Make sure to set your `LIVEBLOCKS_SECRET_KEY` in Vercel's environment variables.

</details>

## Develop on CodeSandbox

<details><summary>Read more</summary>

Fork [this example](https://codesandbox.io/s/github/your-repo/canvas-comments) on CodeSandbox and add `LIVEBLOCKS_SECRET_KEY` as a [secret](https://codesandbox.io/docs/secrets).

</details>

## Features
- 🖼️ **Draggable & Zoomable Image Canvas**
- 💬 **Commenting System with User Avatars**
- 🔄 **Real-time Collaboration with Liveblocks**
- 🖱️ **Edge Detection for Comment Popups**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

