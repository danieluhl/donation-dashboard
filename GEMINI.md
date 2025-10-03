# Project Overview

This is a real-time donation dashboard built with React, TypeScript, Vite, and Tailwind CSS. It uses `@tanstack/react-query` for state management and connects to a WebSocket server to receive and display donation messages in real-time. The project is set up with a minimal Vite template and includes the React Compiler.

## Key Technologies

*   **Frontend Framework:** React with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **State Management:** @tanstack/react-query
*   **Real-time Communication:** WebSocket API
*   **Schema Validation:** Zod

## Architecture

The application's main component is `Dashboard`, which uses the `useSocket` hook to establish a WebSocket connection to `ws://localhost:4000`. The `useSocket` hook handles incoming messages, validates them using a Zod schema, and updates the `@tanstack/react-query` cache. The `Dashboard` component then subscribes to the query cache and re-renders whenever new data is available.

# Building and Running

## Prerequisites

*   Node.js and pnpm

## Installation

```bash
pnpm install
```

## Running the Development Server

```bash
pnpm dev
```

This will start the Vite development server, and the application will be available at `http://localhost:5173` by default.

## Building for Production

```bash
pnpm build
```

This will create a production-ready build in the `dist` directory.

## Running Tests

```bash
pnpm test
```

This will run the tests using Vitest.

# Development Conventions

*   **Path Aliases:** The project uses the `@` alias for the `src` directory.
*   **Linting:** The project uses Biome for linting. You can run the linter with `pnpm lint` and fix linting issues with `pnpm lint:fix`.
*   **State Management:** The project uses `@tanstack/react-query` for managing server state. The `useSocket` hook is responsible for updating the query cache with data received from the WebSocket.
