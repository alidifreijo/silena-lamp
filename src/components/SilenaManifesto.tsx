// @ts-nocheck
// Silena — 01 Feel. Full-screen pinned manifesto:
//  1. Words switch on one by one as you scroll, like the lamp warming up.
//  2. Images bloom around and over the sentence, each drifting at its own speed, then fade away.
// Colours follow the Silena day/night switch. The eyebrow sits at the nav's height
// (top 32px, left 42px) for as long as the section is pinned.
import { useRef, type CSSProperties } from "react"
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

// scattered layout (centre x/y in %, width in vw — never smaller than min px on phones, aspect w/h, drift speed):
// the photos drift up and pass over the words
const SLOTS = [
    { x: 11, y: 28, w: 16, min: 96, r: 0.75, s: 1.1 },
    { x: 79, y: 20, w: 17, min: 104, r: 0.75, s: 0.8 },
    { x: 24, y: 76, w: 17, min: 100, r: 1, s: 1.3 },
    { x: 86, y: 70, w: 19, min: 110, r: 0.75, s: 1.2 },
    { x: 58, y: 86, w: 15, min: 92, r: 0.74, s: 1.0 },
]

function Word({ p, start, end, children }: { p: MotionValue<number>; start: number; end: number; children: string }) {
    const opacity = useTransform(p, [start, end], [0.15, 1])
    return <motion.span style={{ opacity, display: "inline-block", marginRight: "0.26em" }}>{children}</motion.span>
}

// each photo switches on by itself: a warm halo behind it blooms as it arrives, as if the lamp
// lit it, and settles to a faint glow
function Floating({ p, src, i, slot }: { p: MotionValue<number>; src: string; i: number; slot: (typeof SLOTS)[number] }) {
    const t = 0.5 + i * 0.05
    const opacity = useTransform(p, [t, t + 0.06, 0.86, 0.98], [0, 1, 1, 0])
    const scale = useTransform(p, [t, t + 0.1], [0.94, 1])
    const y = useTransform(p, [t, 1], [`${16 * slot.s}vh`, `${-30 * slot.s}vh`])
    const halo = useTransform(p, [t, t + 0.05, t + 0.14], [0, 1, 0.3])
    const haloScale = useTransform(p, [t, t + 0.05, t + 0.14], [0.7, 1.08, 1])
    const lit = useTransform(p, [t, t + 0.05, t + 0.14], [0.55, 1.12, 1])
    const filter = useTransform(lit, (v) => `brightness(${v.toFixed(3)}) saturate(${(0.7 + v * 0.3).toFixed(3)})`)
    return (
        <motion.div
            className="slm-photo"
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
            }}
        >
            <motion.div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: "-28%",
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(255,196,128,0.38), rgba(255,170,90,0.14) 55%, rgba(255,170,90,0) 100%)",
                    filter: "blur(14px)",
                    opacity: halo,
                    scale: haloScale,
                }}
            />
            <motion.img
                src={src}
                alt=""
                loading="lazy"
                style={{ position: "relative", width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 6, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", filter }}
            />
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
    // the words wait until the lamp has come down from the photo, so it never crosses them
    const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] })
    const wordsIn = useTransform(enter, [0.8, 1], [0, 1])

    const codaOpacity = useTransform(p, [0.4, 0.5], [0, 1])
    const codaY = useTransform(p, [0.4, 0.5], [12, 0])
    const glowScale = useTransform(p, [0, 0.5], [0.6, 1.2])
    const glowOpacity = useTransform(p, [0, 0.35], [0, 1])

    const words = text.split(/\s+/).filter(Boolean)

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
                    <Floating key={i} p={p} src={src} i={i} slot={SLOTS[i]} />
                ))}

                <motion.div className="slm-words" style={{ position: "relative", zIndex: 2, maxWidth: 1080, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 48, marginTop: "-6vh", opacity: wordsIn }}>
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
                </motion.div>
            </div>
        </section>
    )
}
