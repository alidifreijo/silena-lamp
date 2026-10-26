// @ts-nocheck
// Silena — 01 Feel. Full-screen pinned manifesto:
//  1. Words switch on one by one as you scroll, like the lamp warming up.
//  2. Images bloom around and over the sentence, each drifting at its own speed, then fade away.
// Colours follow the Silena day/night switch. The eyebrow sits at the nav's height
// (top 32px, left 42px) for as long as the section is pinned.
import { useEffect, useRef, type CSSProperties } from "react"
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion"
import { useSilenaMode } from "./useSilenaMode.js"

// shared Silena palette (same values in every section)
const PALETTE = {
    dark: { text: "rgb(244,233,220)", muted: "rgba(244,233,220,0.6)", glow: "rgba(255,150,40,0.10)" },
    light: { text: "rgb(46,34,22)", muted: "rgba(46,34,22,0.62)", glow: "rgba(255,170,80,0.16)" },
}
const FONT = "'Outfit', sans-serif"
const BALANCE = { textWrap: "balance" } as unknown as CSSProperties
const IMAGES = [1, 2, 3, 4, 5].map((i) => `/images/feel-${i}.jpg`)

// scattered layout (centre x/y in %, width in vw — never smaller than min px on phones, aspect w/h, drift speed)
const SLOTS = [
    { x: 11, y: 28, w: 16, min: 120, r: 0.75, s: 1.1 },
    { x: 79, y: 20, w: 17, min: 130, r: 0.75, s: 0.8 },
    { x: 24, y: 76, w: 17, min: 130, r: 1, s: 1.3 },
    { x: 86, y: 70, w: 19, min: 140, r: 0.75, s: 1.2 },
    { x: 58, y: 86, w: 15, min: 115, r: 0.74, s: 1.0 },
]

function Word({ p, start, end, children }: { p: MotionValue<number>; start: number; end: number; children: string }) {
    const opacity = useTransform(p, [start, end], [0.15, 1])
    return <motion.span style={{ opacity, display: "inline-block", marginRight: "0.26em" }}>{children}</motion.span>
}

function Floating({ p, src, i, slot, boxRef }: { p: MotionValue<number>; src: string; i: number; slot: (typeof SLOTS)[number]; boxRef: (el: HTMLDivElement | null) => void }) {
    const t = 0.5 + i * 0.05
    const opacity = useTransform(p, [t, t + 0.06, 0.86, 0.98], [0, 1, 1, 0])
    const scale = useTransform(p, [t, t + 0.1], [0.9, 1])
    const y = useTransform(p, [t, 1], [`${16 * slot.s}vh`, `${-30 * slot.s}vh`])
    return (
        <motion.div
            ref={boxRef}
            style={{
                position: "absolute",
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `max(${slot.w}vw, ${slot.min}px)`,
                aspectRatio: `${slot.r}`,
                x: "-50%",
                y,
                scale,
                opacity,
                zIndex: 1,
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
        >
            <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </motion.div>
    )
}

export default function SilenaManifesto(props) {
    const {
        eyebrow = "01 — Feel",
        text = "Light doesn’t have to shout. Silena was designed to be felt, not noticed. A warm glow, contained in a soft circular form, bringing calm to the spaces where you slow down.",
        coda = "It doesn’t guide you. It stays with you.",
        scrollLength = 300,
    } = props
    const c = PALETTE[useSilenaMode()]
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
    const p = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.4 })

    const codaOpacity = useTransform(p, [0.4, 0.5], [0, 1])
    const codaY = useTransform(p, [0.4, 0.5], [12, 0])
    const glowScale = useTransform(p, [0, 0.5], [0.6, 1.2])
    const glowOpacity = useTransform(p, [0, 0.35], [0, 1])

    const words = text.split(/\s+/).filter(Boolean)

    // a design-tool selection box that jumps from one image to the next as each one arrives
    const boxes = useRef<(HTMLDivElement | null)[]>([])
    const pinRef = useRef<HTMLDivElement>(null)
    const frameRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLSpanElement>(null)
    useEffect(() => {
        let raf = 0, cur = null, shown = 0
        const tick = () => {
            raf = requestAnimationFrame(tick)
            const fr = frameRef.current, pin = pinRef.current
            if (!fr || !pin) return
            const v = p.get()
            let act = -1
            IMAGES.forEach((_, i) => { if (v >= 0.5 + i * 0.05 + 0.02) act = i })
            const on = act >= 0 && v < 0.86
            shown += ((on ? 1 : 0) - shown) * 0.15
            fr.style.opacity = shown.toFixed(3)
            if (act < 0 || !boxes.current[act]) return
            const a = boxes.current[act].getBoundingClientRect(), b = pin.getBoundingClientRect()
            const t = { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }
            if (!cur) cur = { ...t }
            // it glides over to the new image, a little behind it, like a cursor would
            for (const k of ["x", "y", "w", "h"]) cur[k] += (t[k] - cur[k]) * 0.16
            fr.style.transform = `translate(${cur.x - 6}px,${cur.y - 6}px)`
            fr.style.width = cur.w + 12 + "px"
            fr.style.height = cur.h + 12 + "px"
            if (labelRef.current) labelRef.current.textContent = `Feel · 0${act + 1} / 0${IMAGES.length}`
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [p])
    const span = 0.38

    return (
        <section id="feel" ref={ref} style={{ position: "relative", width: "100%", height: `${scrollLength}vh` }}>
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: "0 56px",
                }}
                className="slm-pin"
                ref={pinRef}
            >
                <motion.div
                    aria-hidden
                    style={{
                        position: "absolute",
                        width: "70vh",
                        height: "70vh",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${c.glow} 0%, transparent 65%)`,
                        scale: glowScale,
                        opacity: glowOpacity,
                    }}
                />
                <span className="section-eyebrow" style={{ color: c.muted }}>
                    {eyebrow}
                </span>

                {IMAGES.map((src, i) => (
                    <Floating key={i} p={p} src={src} i={i} slot={SLOTS[i]} boxRef={(el) => (boxes.current[i] = el)} />
                ))}
                <div className="sel-frame" ref={frameRef} aria-hidden="true">
                    <span className="sel-label" ref={labelRef} />
                    <i className="tl" />
                    <i className="tr" />
                    <i className="bl" />
                    <i className="br" />
                </div>

                <div style={{ position: "relative", zIndex: 2, maxWidth: 1080, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: FONT,
                            fontWeight: 200,
                            fontSize: "clamp(30px, 3.6vw, 58px)",
                            lineHeight: 1.18,
                            letterSpacing: "-0.02em",
                            color: c.text,
                            transition: "color 900ms ease",
                            ...BALANCE,
                        }}
                    >
                        {words.map((w, i) => (
                            <Word key={i} p={p} start={(i / words.length) * span} end={((i + 1) / words.length) * span + 0.02}>
                                {w}
                            </Word>
                        ))}
                    </p>
                    <motion.span
                        style={{
                            fontFamily: FONT,
                            fontWeight: 300,
                            fontSize: 18,
                            lineHeight: 1.5,
                            color: c.muted,
                            opacity: codaOpacity,
                            y: codaY,
                            transition: "color 900ms ease",
                        }}
                    >
                        {coda}
                    </motion.span>
                </div>
            </div>
        </section>
    )
}
