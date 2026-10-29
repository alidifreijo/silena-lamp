// A rail on the right: one segment per chapter (01 Feel, 02 The place to be, 03 Light Rituals,
// 04 Make it yours), each with its number, filling as you move through it, so the long pinned
// stretches never feel endless. Each segment takes you to its chapter; its name shows on hover.
// Hidden on the opening screen.
import { useEffect, useRef } from "react"

const CHAPTERS = [
    ["#feel", "01", "Feel"],
    ["#place", "02", "Your place"],
    [".slx", "03", "Light rituals"],
    ["#shop", "04", "Shop"],
]

function go(sel) {
    const el = document.querySelector(sel)
    if (!el) return
    // Light Rituals starts under the room: land on its first mood
    const top = window.scrollY + el.getBoundingClientRect().top + (sel === ".slx" ? window.innerHeight * 0.95 : 0)
    if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.6 })
    else window.scrollTo({ top, behavior: "smooth" })
}

export default function Progress() {
    const ref = useRef(null)
    useEffect(() => {
        const root = ref.current
        const fills = [...root.querySelectorAll(".rail-fill")], segs = [...root.querySelectorAll(".rail-seg")]
        let raf = 0
        const tick = () => {
            raf = requestAnimationFrame(tick)
            const y = window.scrollY, vh = window.innerHeight
            const tops = CHAPTERS.map(([s]) => {
                const el = document.querySelector(s)
                return el ? el.getBoundingClientRect().top + y : Infinity
            })
            const end = document.documentElement.scrollHeight - vh
            let cur = -1
            tops.forEach((t, i) => {
                const a = t, b = i < tops.length - 1 ? tops[i + 1] : end
                const k = Math.min(1, Math.max(0, (y - a) / Math.max(1, b - a)))
                fills[i].style.transform = `scaleY(${k.toFixed(4)})`
                if (y >= a - 2) cur = i
            })
            segs.forEach((s, i) => s.classList.toggle("on", i === cur))
            const show = y > vh * 0.6
            root.style.opacity = show ? "1" : "0"
            root.style.visibility = show ? "visible" : "hidden"
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [])
    return (
        <nav className="rail" ref={ref} aria-label="Chapters">
            {CHAPTERS.map(([sel, n, name]) => (
                <button type="button" className="rail-seg" key={n} onClick={() => go(sel)} aria-label={`${n} ${name}`}>
                    <span className="rail-name">{name}</span>
                    <span className="rail-n">{n}</span>
                    <span className="rail-track">
                        <span className="rail-fill" />
                    </span>
                </button>
            ))}
        </nav>
    )
}
