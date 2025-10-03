/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		exclude: ["tests/**", "**node_modules**"],
		globals: true,
		environment: "jsdom",
	},
});
