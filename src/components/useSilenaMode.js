// The site's day/night mode ("dark" | "light"), read from <body data-framer-theme> and kept in sync
// with the switch in the nav (it broadcasts "silena-theme").
import { useEffect, useState, startTransition } from "react"

const read = () => (typeof document !== "undefined" && document.documentElement.getAttribute("data-framer-theme") === "light" ? "light" : "dark")

export function useSilenaMode() {
    const [mode, setMode] = useState(read)
    useEffect(() => {
        const sync = () => startTransition(() => setMode(read()))
        sync()
        window.addEventListener("silena-theme", sync)
        return () => window.removeEventListener("silena-theme", sync)
    }, [])
    return mode
}
