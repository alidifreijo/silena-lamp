import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    build: { chunkSizeWarningLimit: 800 },
    resolve: {
        // the components were first written for Framer; "framer" resolves to a small local shim
        alias: { framer: fileURLToPath(new URL("./src/framer.js", import.meta.url)) },
    },
})
