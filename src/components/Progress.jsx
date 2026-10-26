// A thin rail on the right edge: one segment per chapter (01 Feel, 02 The place to be,
// 03 Light Rituals, 04 Make it yours), filling as you move through it, so the long pinned
// stretches never feel endless. Hidden on the opening screen.
import { useEffect, useRef } from "react"

const CHAPTERS = [
    ["#feel", "01"],
    ["#place", "02"],
    [".slx", "03"],
    ["#shop", "04"],
]

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
            root.style.opacity = y > vh * 0.6 ? "1" : "0"
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [])
    return (
        <div className="rail" ref={ref} aria-hidden="true">
            {CHAPTERS.map(([, n]) => (
                <div className="rail-seg" key={n}>
                    <span className="rail-n">{n}</span>
                    <span className="rail-track">
                        <span className="rail-fill" />
                    </span>
                </div>
            ))}
        </div>
    )
}
