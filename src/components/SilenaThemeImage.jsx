// Silena — the hero photo. Night and day are stacked with exactly the same framing (same fit and
// focus, so nothing jumps) and cross-fade in step with the page colours (both take 900ms).
// Each has a twin without the lamp: when the 3D lamp lifts off the wall (HeroLamp sets
// --hero-empty), the wall it leaves is empty, so there are never two lamps.
import { useSilenaMode } from "./useSilenaMode.js"

export default function SilenaThemeImage({ day = "/images/hero-day.jpg", night = "/images/hero-night.jpg" }) {
    const isDay = useSilenaMode() === "light"
    const empty = { opacity: "var(--hero-empty, 0)", transition: "none" }
    return (
        <div className="hero-photo" aria-hidden="true">
            <img className="silena-hero-img" src={night} alt="" fetchpriority="high" />
            <img className="silena-hero-img" src={night.replace(".jpg", "-empty.jpg")} alt="" loading="lazy" style={empty} />
            <img className="silena-hero-img" src={day} alt="" style={{ opacity: isDay ? 1 : 0 }} />
            <img className="silena-hero-img" src={day.replace(".jpg", "-empty.jpg")} alt="" loading="lazy" style={isDay ? empty : { opacity: 0, transition: "none" }} />
        </div>
    )
}
