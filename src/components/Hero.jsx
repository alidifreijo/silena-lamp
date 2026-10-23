// The opening screen: the photo (day or night), SILENA as wide as the screen allows, and the two
// small texts at the top, mirrored left and right.
import { useLayoutEffect } from "react"
import SilenaThemeImage from "./SilenaThemeImage.jsx"
import Letters, { WORD_WIDTH } from "./Letters.jsx"

// SILENA at 80% of the width the screen allows (minus the side margins), so the photo shows
// around it, and never too tall
function sizeTitle() {
    const w = window.innerWidth, h = window.innerHeight, pad = w <= 640 ? 16 : 42
    const z = Math.max(0.2, 0.8 * Math.min((w - 2 * pad) / WORD_WIDTH, (h * 0.52) / 262))
    document.documentElement.style.setProperty("--silena-title-z", z.toFixed(4))
}

export default function Hero() {
    useLayoutEffect(() => {
        sizeTitle()
        window.addEventListener("resize", sizeTitle)
        return () => window.removeEventListener("resize", sizeTitle)
    }, [])
    return (
        <header className="hero">
            <SilenaThemeImage />
            <div className="hero-center">
                <Letters />
                <p className="label">A quiet object of light</p>
            </div>
            <div className="hero-text hero-credit">
                <p className="label">Designed by</p>
                <p className="body">Maria Escarmiento</p>
            </div>
            <div className="hero-text hero-note">
                <p className="label">2025</p>
                <p className="body">A soft glow for the corners where you slow down</p>
            </div>
        </header>
    )
}
