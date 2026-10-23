// Silena — the hero photo. Night and day are stacked with exactly the same framing (same fit and
// focus, so nothing jumps) and cross-fade in step with the page colours (both take 900ms).
import { useSilenaMode } from "./useSilenaMode.js"

export default function SilenaThemeImage({ day = "/images/hero-day.jpg", night = "/images/hero-night.jpg" }) {
    const isDay = useSilenaMode() === "light"
    return (
        <div className="hero-photo" aria-hidden="true">
            <img className="silena-hero-img" src={night} alt="" fetchpriority="high" />
            <img className="silena-hero-img" src={day} alt="" style={{ opacity: isDay ? 1 : 0 }} />
        </div>
    )
}
