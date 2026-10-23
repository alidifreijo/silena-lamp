// The nav: fixed at the top. Links to the three chapters in the middle, the day/night switch and
// the bag on the right.
import SilenaThemeSwitch from "./SilenaThemeSwitch.jsx"
import SilenaBag from "./SilenaBag.tsx"

function scrollToChapter(k) {
    let top = null
    if (k === "rituals") {
        // skip the hand-over from the room and land on the first mood
        const rit = document.querySelector(".slx")
        if (rit) top = window.scrollY + rit.getBoundingClientRect().top + window.innerHeight * 0.95
    } else {
        const el = document.getElementById(k)
        if (el) top = window.scrollY + el.getBoundingClientRect().top
    }
    if (top == null) return
    if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.6 })
    else window.scrollTo({ top, behavior: "smooth" })
}

const LINKS = [
    ["place", "Your place"],
    ["rituals", "Rituals"],
    ["shop", "Shop"],
]

export default function Nav() {
    return (
        <nav className="nav" aria-label="Silena">
            <span className="nav-spacer" />
            <div className="nav-pill">
                {LINKS.map(([k, l]) => (
                    <a
                        key={k}
                        href={`#${k}`}
                        onClick={(e) => {
                            e.preventDefault()
                            scrollToChapter(k)
                        }}
                    >
                        {l}
                    </a>
                ))}
            </div>
            <div className="nav-theme">
                <SilenaThemeSwitch />
                <SilenaBag />
            </div>
        </nav>
    )
}
