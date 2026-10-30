// @ts-nocheck
// Silena — 04 Make it yours. The buying section: the real lamp in 3D (SilenaLamp3D) that you can
// turn all the way round by dragging and see on the wall or on a table, the two glass colours,
// price, quantity and "Add to bag", then the technical details: three key figures, a dimension
// drawing (front and side, both to scale) and the full spec sheet.
// The bag itself is SilenaBag (nav button + drawer); both share the bag through localStorage and
// window events. Concept project based on IKEA VARMBLIXT: figures from the product page.
import { useEffect, useRef, useState } from "react"
import { FINISHES, readBag, writeBag, swatch, eur } from "./SilenaBag.tsx"
import { loadThree, makeRealLamp } from "./SilenaLamp3D.tsx"
import { useSilenaMode } from "./useSilenaMode.js"

const FONT = "'Outfit', sans-serif"
const PAL = {
    dark: { ink: "#F4E9DC", muted: "rgba(244,233,220,.6)", line: "rgba(244,233,220,.16)", line2: "rgba(244,233,220,.3)", stage: "#2E2418", cta: "#F4E9DC", ctaInk: "#261E13", mount: "#3A2F22" },
    light: { ink: "#2E2216", muted: "rgba(46,34,22,.62)", line: "rgba(46,34,22,.14)", line2: "rgba(46,34,22,.28)", stage: "#E3D6C4", cta: "#2E2216", ctaInk: "#F4E9DC", mount: "#D3C3AC" },
}
const FIGS = [
    ["The shade", "30 cm", "A soft disc of glass that spreads a halo onto the wall around it."],
    ["The glow", "180 lm", "Enough to warm a corner, never enough to fill a room."],
    ["The life", "25,000 h", "Roughly twenty years of evenings, at three hours a night."],
]
const SPECS = [
    ["Size", [["Diameter", "30 cm"], ["Depth", "12 cm"], ["Centre hole", "about Ø 6 cm"], ["Cable", "1.9 m"], ["Packed", "34 × 13 × 36 cm · 2.26 kg"]]],
    ["Light", [["Source", "Integrated LED"], ["Output", "180 lm"], ["Power", "3 W"], ["Colour", "Warm to cool white, plus the full colour spectrum (white glass)"], ["Dimming", "With the remote included, or the app"], ["Lifetime", "25,000 h · about 20 years at 3 h a night"], ["Energy class", "G"]]],
    ["Smart home", [["Connects with", "Matter over Thread"], ["Needs", "A Thread border router (such as a smart home hub) for the app"], ["In the box", "Remote control"]]],
    ["Materials & care", [["Shade", "Glass"], ["Base and cover", "ABS plastic"], ["Wall plate", "Steel, powder coated"], ["Care", "Wipe with a dry cloth"]]],
]
const DOWNLOADS = ["Product sheet · PDF", "Assembly guide · PDF", "3D model · OBJ"]
// the lamp seen from the side, to the same scale as the front view (30 cm = 220 px, so 12 cm ≈ 88 px):
// the real glass profile, flat against the wall on the left
const SIDE = "M399.1,90.6 L401.8,75.2 L397.9,60.9 L388.1,49.9 L374.3,43.3 L360,40 L345.7,41.7 L332.5,47.7 L323.7,58.7 L319.3,75.2 L318.2,99.4 L318.2,200.6 L319.3,224.8 L323.7,241.3 L332.5,252.3 L345.7,258.4 L360,260 L374.3,256.7 L388.1,250.1 L397.9,239.1 L401.8,224.8 L399.1,209.4 Z"

// the shop lamp keeps a touch of the illustration's grain and satin finish
const REST = 0.3

const CSS = `
.sls{position:relative;width:100%;box-sizing:border-box;padding:120px clamp(42px,6vw,96px) 120px 42px;font-family:${FONT};font-weight:300}
.sls *{box-sizing:border-box}
.sls-in{max-width:1360px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:64px;align-items:start}
.sls-stage{position:sticky;top:96px;aspect-ratio:1/1;max-height:calc(100vh - 120px);width:100%;border-radius:28px;overflow:hidden;transition:background .9s}
.sls-stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:pan-y}
.sls-stage canvas:active{cursor:grabbing}
.sls-mount{position:absolute;z-index:3;bottom:16px;left:16px;display:flex;gap:4px;padding:4px;border-radius:999px;transition:background .9s}
.sls-mount button{border:0;background:none;border-radius:999px;padding:9px 16px;font:300 15px ${FONT};cursor:pointer;transition:background .3s,color .3s}
.sls-buy{display:flex;flex-direction:column;gap:28px;padding-top:12px}
.sls-h{margin:0;font-weight:200;font-size:clamp(48px,6vw,96px);line-height:.95;letter-spacing:-.03em}
.sls-eb{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:400}
.sls-opt{display:flex;flex-direction:column;gap:12px;padding-top:22px}
.sls-sw{width:44px;height:44px;border-radius:50%;padding:4px;background:none;cursor:pointer}
.sls-sw i{display:block;width:100%;height:100%;border-radius:50%}
.sls-qty{display:flex;align-items:center;border-radius:999px;height:56px}
.sls-qty button{width:48px;height:100%;border:0;background:none;cursor:pointer;font-size:20px}
.sls-add{flex:1;height:56px;border:0;border-radius:999px;font:400 15px ${FONT};cursor:pointer;transition:transform .2s}
.sls-add:active{transform:scale(.98)}
.sls-perks{list-style:none;margin:0;padding:0;display:grid;gap:10px;font-size:15px}
.sls-perks li{display:flex;gap:10px;align-items:baseline}
.sls-perks li::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.7;flex:none;transform:translateY(-2px)}
.sls-specs{max-width:1360px;margin:96px auto 0;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:64px;align-items:start}
.sls-specs h3{margin:12px 0 0;font-weight:200;font-size:clamp(32px,3.4vw,52px);line-height:1.05;letter-spacing:-.02em;text-wrap:balance}
.sls-figs{max-width:1360px;margin:96px auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px;padding-top:28px}
.sls-figs div{display:flex;flex-direction:column;gap:12px}
.sls-figs b{font-weight:100;font-size:clamp(48px,5.4vw,88px);line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.sls-figs p{margin:0;font-size:16px;line-height:1.5;max-width:30ch}
.sls details summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:22px 0;font-size:19px}
.sls details summary::-webkit-details-marker{display:none}
.sls details summary i{width:20px;height:20px;position:relative;flex:none}
.sls details summary i::before,.sls details summary i::after{content:"";position:absolute;left:3px;right:3px;top:9px;height:1px;background:currentColor;transition:transform .3s}
.sls details summary i::after{transform:rotate(90deg)}
.sls details[open] summary i::after{transform:rotate(0)}
.sls dl{display:grid;grid-template-columns:minmax(0,180px) minmax(0,1fr);gap:12px 24px;margin:0 0 26px;font-size:15px}
.sls dd{margin:0;font-variant-numeric:tabular-nums}
.sls-dl{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 14px}
.sls-dl button{background:none;border-radius:999px;padding:10px 16px;font:300 14px ${FONT};cursor:pointer}
.sls button:focus-visible,.sls summary:focus-visible{outline:2px solid #F0892A;outline-offset:3px;border-radius:6px}
@media (max-width:900px){.sls{padding:110px 20px 96px}.sls-in,.sls-specs{grid-template-columns:minmax(0,1fr);gap:36px}.sls-stage{position:relative;top:0}.sls dl{grid-template-columns:minmax(0,120px) minmax(0,1fr)}.sls-figs{grid-template-columns:minmax(0,1fr);gap:28px;margin-top:72px}.sls-specs{margin-top:64px}}
`

export default function SilenaShop(props) {
    const {
        eyebrow = "04 — Make it yours",
        title = "Silena",
        intro = "A soft disc of opal glass that lights a corner, not a room. Hang it on the wall or lay it on a table.",
        specsTitle = "Small enough for a shelf, bright enough for a corner.",
        perk1 = "Free delivery in 3–5 working days",
        perk2 = "30 days to change your mind",
        perk3 = "2-year guarantee, 5 years on the LED",
    } = props
    const mode = useSilenaMode()
    const c = PAL[mode]
    const inkRef = useRef(c.ink)
    inkRef.current = c.ink
    const [fin, setFin] = useState(FINISHES[0])
    const [qty, setQty] = useState(1)
    const [mount, setMount] = useState("wall")
    const [added, setAdded] = useState("")
    const [dlNote, setDlNote] = useState(false)
    const canvas = useRef<HTMLCanvasElement>(null)
    const lamp = useRef(null)

    useEffect(() => {
        if (!canvas.current) return
        let alive = true
        loadThree()
            .then((THREE) => {
                if (!alive || !canvas.current) return
                lamp.current = makeRealLamp(THREE, canvas.current, { mount, paint: REST, glass: 1 })
                lamp.current.colors(fin)
                // Light Rituals lands its lamp right here: hold still, facing you, until it has
                const rit = document.querySelector(".slx")
                if (rit && !landed && rit.getBoundingClientRect().bottom > window.innerHeight) {
                    lamp.current.hold()
                    lamp.current.paint(0.6)
                }
            })
            .catch(() => {})
        let landed = false, praf = 0
        // it arrives with some of Light Rituals' painted grain and clears into glass over ~2.5 s
        const clearPaint = (from) => {
            cancelAnimationFrame(praf)
            const t0 = performance.now()
            const step = (t) => {
                const k = Math.min(1, (t - t0) / 2600), e = 1 - Math.pow(1 - k, 3)
                lamp.current?.paint(from + (REST - from) * e)
                if (k < 1) praf = requestAnimationFrame(step)
            }
            praf = requestAnimationFrame(step)
        }
        const onLanded = (e) => {
            landed = !!e.detail
            if (!lamp.current) return
            if (landed) {
                lamp.current.release()
                clearPaint(0.6)
            } else {
                cancelAnimationFrame(praf)
                lamp.current.hold()
                lamp.current.paint(0.6)
            }
        }
        window.addEventListener("silena-lamp-landed", onLanded)
        return () => {
            alive = false
            window.removeEventListener("silena-lamp-landed", onLanded)
            lamp.current?.dispose()
            lamp.current = null
        }
    }, [])
    // once the shop reaches the nav, a soft veil sits behind it so nothing collides with it
    useEffect(() => {
        const sec = document.getElementById("shop")
        if (!sec) return
        const de = document.documentElement
        const on = () => {
            const r = sec.getBoundingClientRect()
            de.classList.toggle("in-shop", r.top < 60 && r.bottom > 100)
        }
        on()
        window.addEventListener("scroll", on, { passive: true })
        return () => {
            window.removeEventListener("scroll", on)
            de.classList.remove("in-shop")
        }
    }, [])
    useEffect(() => lamp.current?.colors(fin), [fin])
    useEffect(() => lamp.current?.mount(mount), [mount])

    function add() {
        const b = readBag()
        const it = b.find((i) => i.id === fin.id)
        if (it) it.qty = Math.min(9, it.qty + qty)
        else b.push({ id: fin.id, qty })
        writeBag(b)
        setAdded(`Added: Silena, ${fin.name.toLowerCase()} glass`)
        setTimeout(() => setAdded(""), 2600)
        setTimeout(() => window.dispatchEvent(new Event("silena-bag-open")), 500)
    }

    const muted = { color: c.muted }
    const t = { fill: "currentColor", stroke: "none", fontFamily: "Outfit", textAnchor: "middle" }
    return (
        <section id="shop" className="sls" style={{ color: c.ink }}>
            <style>{CSS}</style>
            <div className="sls-in">
                <div className="sls-stage" style={{ background: c.stage }}>
                    <div className="sls-mount" role="group" aria-label="See it" style={{ background: c.mount }}>
                        {[
                            ["wall", "On the wall"],
                            ["table", "On a table"],
                        ].map(([k, l]) => (
                            <button key={k} type="button" aria-pressed={mount === k} onClick={() => setMount(k)} style={mount === k ? { background: c.cta, color: c.ctaInk } : { color: c.muted }}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <canvas ref={canvas} aria-label="Silena lamp, drag to turn it all the way round" />
                    <p style={{ position: "absolute", right: 22, bottom: 30, margin: 0, textAlign: "right", fontSize: 14, pointerEvents: "none", ...muted }}>Drag to turn it 360°</p>
                </div>

                <div className="sls-buy">
                    <span className="sls-eb" style={muted}>
                        {eyebrow}
                    </span>
                    <h2 className="sls-h">{title}</h2>
                    <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, maxWidth: "38ch", ...muted }}>{intro}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 30, fontVariantNumeric: "tabular-nums" }}>
                        <span>{eur(fin.price)}</span>
                        <small style={{ fontSize: 13, ...muted }}>VAT included</small>
                    </div>
                    <div className="sls-opt" style={{ borderTop: `1px solid ${c.line}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: 15 }}>Glass</span>
                            <span className="sls-eb" style={muted}>
                                {fin.name}
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 12 }} role="group" aria-label="Glass colour">
                            {FINISHES.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    className="sls-sw"
                                    aria-label={`${f.name} glass`}
                                    aria-pressed={fin.id === f.id}
                                    onClick={() => setFin(f)}
                                    style={{ border: `1px solid ${fin.id === f.id ? c.ink : c.line2}`, boxShadow: fin.id === f.id ? `0 0 0 1px ${c.ink}` : "none" }}
                                >
                                    <i style={{ background: swatch(f) }} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="sls-opt" style={{ borderTop: `1px solid ${c.line}` }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <div className="sls-qty" style={{ border: `1px solid ${c.line2}` }} aria-label="Quantity">
                                <button type="button" aria-label="One less" style={{ color: c.ink }} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                                    −
                                </button>
                                <span style={{ minWidth: 24, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{qty}</span>
                                <button type="button" aria-label="One more" style={{ color: c.ink }} onClick={() => setQty((q) => Math.min(9, q + 1))}>
                                    +
                                </button>
                            </div>
                            <button type="button" className="sls-add" onClick={add} style={{ background: c.cta, color: c.ctaInk }}>
                                Add to bag · {eur(fin.price * qty)}
                            </button>
                        </div>
                        <p aria-live="polite" style={{ margin: 0, minHeight: 18, fontSize: 13, ...muted }}>
                            {added}
                        </p>
                        <ul className="sls-perks" style={muted}>
                            <li>{perk1}</li>
                            <li>{perk2}</li>
                            <li>{perk3}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="sls-figs" style={{ borderTop: `1px solid ${c.line}` }}>
                {FIGS.map(([l, v, d]) => (
                    <div key={l}>
                        <span className="sls-eb" style={muted}>
                            {l}
                        </span>
                        <b>{v}</b>
                        <p style={muted}>{d}</p>
                    </div>
                ))}
            </div>

            <div className="sls-specs">
                <div>
                    <span className="sls-eb" style={muted}>
                        Technical details
                    </span>
                    <h3>{specsTitle}</h3>
                    <figure style={{ margin: "32px 0 0", maxWidth: 460, ...muted }} aria-label="Dimensions: 30 cm across, 12 cm deep, hole about 6 cm">
                        <svg viewBox="0 0 460 300" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: "100%", height: "auto", display: "block" }}>
                            <circle cx="150" cy="150" r="110" />
                            <circle cx="150" cy="150" r="22" />
                            <path d="M40 272 H260 M40 266 V278 M260 266 V278" />
                            <text x="150" y="292" fontSize="13" {...t}>
                                Ø 30 cm
                            </text>
                            <path d="M128 150 H172" strokeDasharray="2 3" />
                            <text x="150" y="190" fontSize="11" {...t}>
                                Ø 6 cm
                            </text>
                            <path d="M312 28 V272" strokeDasharray="2 4" opacity=".6" />
                            <path d={SIDE} />
                            <path d="M318 131 H401 M318 169 H401" strokeDasharray="2 3" opacity=".7" />
                            <path d="M318 272 H402 M318 266 V278 M402 266 V278" />
                            <text x="360" y="292" fontSize="13" {...t}>
                                12 cm
                            </text>
                            <text x="360" y="24" fontSize="11" {...t}>
                                side
                            </text>
                            <text x="150" y="24" fontSize="11" {...t}>
                                front
                            </text>
                        </svg>
                    </figure>
                </div>
                <div style={{ borderTop: `1px solid ${c.line}` }}>
                    {SPECS.map(([h, rows], i) => (
                        <details key={h} name="sls-specs" open={i === 0} style={{ borderBottom: `1px solid ${c.line}` }}>
                            <summary>
                                {h}
                                <i />
                            </summary>
                            <dl>
                                {rows.map(([k, v]) => [
                                    <dt key={k + "t"} style={muted}>
                                        {k}
                                    </dt>,
                                    <dd key={k + "d"}>{v}</dd>,
                                ])}
                            </dl>
                        </details>
                    ))}
                    <details name="sls-specs" style={{ borderBottom: `1px solid ${c.line}` }}>
                        <summary>
                            Downloads
                            <i />
                        </summary>
                        <div className="sls-dl">
                            {DOWNLOADS.map((d) => (
                                <button key={d} type="button" onClick={() => setDlNote(true)} style={{ border: `1px solid ${c.line2}`, color: c.ink }}>
                                    {d}
                                </button>
                            ))}
                        </div>
                        <p style={{ margin: "0 0 26px", fontSize: 13, ...muted }}>{dlNote ? "Concept project: the files are not available." : " "}</p>
                    </details>
                </div>
            </div>
        </section>
    )
}
