// Silena — day/night switch. "Como si encendieras la luz": night is the default.
// The mode lives on <html>/<body> as data-framer-theme ("dark" | "light"); the page colours are CSS
// variables keyed on it (see index.css). The switch remembers the choice (localStorage
// "silena-theme") and broadcasts "silena-theme" so every Silena section follows along.
// When switched by hand, the page colours glide over 900ms, the same time the hero photo takes to
// cross-fade, so background and photo change together.
import { useEffect, useState, startTransition } from "react"
import { motion } from "framer-motion"
import { useSilenaMode } from "./useSilenaMode.js"

const PALETTE = {
    dark: { track: "rgba(30,23,15,0.62)", text: "rgb(244,233,220)", well: "rgba(255,255,255,0.10)" },
    light: { track: "rgba(228,216,199,0.88)", text: "rgb(46,34,22)", well: "rgba(46,34,22,0.10)" },
}
const GLOW = "rgb(240,137,42)"
const DAY_KNOB = "rgb(255,250,242)"
let glideTimer = 0

export function applyMode(mode, glide = false) {
    const html = document.documentElement
    if (glide) {
        html.classList.add("silena-theming")
        clearTimeout(glideTimer)
        glideTimer = window.setTimeout(() => html.classList.remove("silena-theming"), 1000)
    }
    html.setAttribute("data-framer-theme", mode)
    document.body.setAttribute("data-framer-theme", mode)
    html.style.colorScheme = mode
    try {
        window.localStorage.setItem("silena-theme", mode)
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("silena-theme", { detail: mode }))
}

export default function SilenaThemeSwitch({ nightLabel = "Night", dayLabel = "Day" }) {
    const mode = useSilenaMode()

    useEffect(() => {
        // other Silena components can ask for a change
        const onRequest = (e) => applyMode(e.detail === "light" ? "light" : "dark", true)
        window.addEventListener("silena-theme-request", onRequest)
        return () => window.removeEventListener("silena-theme-request", onRequest)
    }, [])

    const isDay = mode === "light"
    const c = PALETTE[mode]
    const knob = 28
    return (
        <motion.button
            className="silena-switch"
            onClick={() => applyMode(isDay ? "dark" : "light", true)}
            role="switch"
            aria-checked={isDay}
            aria-label={isDay ? `Switch to ${nightLabel}` : `Switch to ${dayLabel}`}
            initial={false}
            animate={{ backgroundColor: c.track, color: c.text }}
            transition={{ duration: 0.9 }}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 54,
                padding: "0 20px 0 12px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                minWidth: "max-content",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 300,
                fontSize: 15,
                letterSpacing: "0.01em",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            <motion.span initial={false} animate={{ backgroundColor: c.well }} style={{ position: "relative", width: 56, height: knob + 4, borderRadius: 999, flexShrink: 0 }}>
                <motion.span
                    initial={false}
                    animate={{
                        x: isDay ? 56 - knob - 2 : 2,
                        backgroundColor: isDay ? DAY_KNOB : GLOW,
                        boxShadow: isDay ? "0 0 0px 0px rgba(240,137,42,0)" : "0 0 16px 3px rgba(240,137,42,0.6)",
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    style={{ position: "absolute", top: 2, left: 0, width: knob, height: knob, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(60,40,20,0.3)" }} />
                </motion.span>
            </motion.span>
            <span className="silena-switch-lbl" style={{ width: "max-content", minWidth: 40, textAlign: "left" }}>
                {isDay ? dayLabel : nightLabel}
            </span>
        </motion.button>
    )
}
