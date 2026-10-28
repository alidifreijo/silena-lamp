// The end of the page: a last quiet line, the chapters, the credits, and SILENA spread across the
// bottom as a signature. The lamp button takes you back to the start.
import { useLayoutEffect, useRef } from "react"
import Letters, { WORD_WIDTH } from "./Letters.jsx"

const CHAPTERS = [
    ["feel", "Feel"],
    ["place", "Your place"],
    ["rituals", "Light rituals"],
    ["shop", "Shop"],
]

function go(k) {
    let top = 0
    if (k === "rituals") {
        const r = document.querySelector(".slx")
        if (r) top = window.scrollY + r.getBoundingClientRect().top + window.innerHeight * 0.95
    } else if (k !== "top") {
        const el = document.getElementById(k)
        if (el) top = window.scrollY + el.getBoundingClientRect().top
    }
    if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.8 })
    else window.scrollTo({ top, behavior: "smooth" })
}

export default function Footer() {
    const ref = useRef(null)
    // SILENA as wide as the footer
    useLayoutEffect(() => {
        const fit = () => {
            const el = ref.current
            if (!el) return
            el.style.setProperty("--foot-z", (el.clientWidth / (WORD_WIDTH + 170)).toFixed(4))
        }
        fit()
        window.addEventListener("resize", fit)
        return () => window.removeEventListener("resize", fit)
    }, [])
    // the chapter rail steps aside once the footer is on screen
    const footRef = useRef(null)
    useLayoutEffect(() => {
        const el = footRef.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(([e]) => document.documentElement.classList.toggle("in-foot", e.isIntersecting), { rootMargin: "0px 0px -30% 0px" })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    const link = (k, l) => (
        <a
            key={k}
            href={`#${k}`}
            onClick={(e) => {
                e.preventDefault()
                go(k)
            }}
        >
            {l}
        </a>
    )
    return (
        <footer className="foot" ref={footRef}>
            <div className="foot-top">
                <p className="foot-line">It doesn’t guide you. It stays with you.</p>
                <button type="button" className="foot-up" onClick={() => go("top")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="10.5" r="7.5" />
                        <circle cx="12" cy="10.5" r="2" />
                        <path d="M12 18v4" />
                    </svg>
                    Back to the top
                </button>
            </div>
            <div className="foot-cols">
                <div>
                    <p className="label">Chapters</p>
                    <nav aria-label="Chapters">{CHAPTERS.map(([k, l]) => link(k, l))}</nav>
                </div>
                <div>
                    <p className="label">The lamp</p>
                    <p>Designed by Maria Escarmiento</p>
                    <p className="foot-muted">Based on IKEA VARMBLIXT</p>
                </div>
                <div>
                    <p className="label">This site</p>
                    <p>Concept and design by Álida Díaz de Freijo</p>
                    <p className="foot-links">
                        <a href="https://alidadiazdefreijo.framer.website/" target="_blank" rel="noreferrer">Portfolio</a>
                        <a href="https://www.linkedin.com/in/alidadiazdefreijo/" target="_blank" rel="noreferrer">LinkedIn</a>
                    </p>
                </div>
            </div>
            <div className="foot-sign" ref={ref}>
                <Letters as="div" className="silena-word foot-word" hidden />
            </div>
            <div className="foot-base">
                <span>A concept site, not affiliated with IKEA.</span>
                <span>© 2026</span>
            </div>
        </footer>
    )
}
