// @ts-nocheck
// Silena — bag. A round icon button for the nav (same height as the day/night switch, no label,
// so the switch stays the one thing that stands out) with a small item count, and the bag drawer
// that slides in from the right. Each line shows the real lamp in 3D (rendered once per glass
// colour, then kept as an image).
// The bag lives in this browser (localStorage "silena-bag-v1") and is shared with the shop
// section through window events:
//   "silena-bag"       → the bag changed (anyone can dispatch it after writing)
//   "silena-bag-open"  → open the drawer
// Concept project: checkout shows a note instead of taking payment.
import { useEffect, useState, startTransition, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { lampThumb } from "./SilenaLamp3D.tsx"
import { useSilenaMode } from "./useSilenaMode.js"

export const BAG_KEY = "silena-bag-v1"
// glass colours: tint = switched off, core/rim = lit from inside (VARMBLIXT white and amber)
export const FINISHES = [
    { id: "white", name: "White", price: 59.99, tint: "#EEEAE3", core: "#FBF0DD", rim: "#E9CBA0", sw: "radial-gradient(circle at 40% 35%, #ffffff, #F1ECE4 60%, #D9D1C4)" },
    { id: "amber", name: "Amber", price: 49.99, tint: "#E2742A", core: "#FFD7A0", rim: "#E3651B", sw: "radial-gradient(circle at 40% 35%, #FFC98A, #E87A2C 60%, #B4521C)" },
]
export const swatch = (f) => f.sw
export const eur = (n: number) => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
export function readBag(): { id: string; qty: number }[] {
    try {
        const b = JSON.parse(window.localStorage.getItem(BAG_KEY) || "[]")
        // drop glass colours that no longer exist
        return Array.isArray(b) ? b.filter((i) => FINISHES.some((f) => f.id === i.id)) : []
    } catch (e) {
        return []
    }
}
export function writeBag(b) {
    try {
        window.localStorage.setItem(BAG_KEY, JSON.stringify(b))
    } catch (e) {}
    window.dispatchEvent(new Event("silena-bag"))
}

const PAL = {
    dark: { btn: "rgba(30,23,15,0.62)", ink: "rgb(244,233,220)", muted: "rgba(244,233,220,.6)", line: "rgba(244,233,220,.16)", line2: "rgba(244,233,220,.3)", panel: "#2E2418", stage: "#3a2e20", cta: "#F4E9DC", ctaInk: "#261E13", count: "rgb(244,233,220)", countInk: "#261E13" },
    light: { btn: "rgba(228,216,199,0.88)", ink: "rgb(46,34,22)", muted: "rgba(46,34,22,.62)", line: "rgba(46,34,22,.14)", line2: "rgba(46,34,22,.28)", panel: "#E9DECF", stage: "#D9CAB4", cta: "#2E2216", ctaInk: "#F4E9DC", count: "rgb(46,34,22)", countInk: "#F4E9DC" },
}
const FONT = "'Outfit', sans-serif"

export default function SilenaBag(props) {
    const { title = "Your bag", empty = "Your bag is empty. Silena is waiting on the wall.", checkoutNote = "This is a concept: checkout is not connected." } = props
    const c = PAL[useSilenaMode()]
    const [bag, setBag] = useState([])
    const [open, setOpen] = useState(false)
    const [bump, setBump] = useState(false)
    const [note, setNote] = useState("")
    const [thumbs, setThumbs] = useState<Record<string, string>>({})

    useEffect(() => {
        let prev = -1
        const sync = () => {
            const b = readBag()
            const n = b.reduce((s, i) => s + i.qty, 0)
            if (prev >= 0 && n > prev) {
                setBump(true)
                setTimeout(() => setBump(false), 350)
            }
            prev = n
            setBag(b)
        }
        const onOpen = () => setOpen(true)
        const onKey = (e) => e.key === "Escape" && setOpen(false)
        sync()
        window.addEventListener("silena-bag", sync)
        window.addEventListener("storage", sync)
        window.addEventListener("silena-bag-open", onOpen)
        window.addEventListener("keydown", onKey)
        return () => {
            window.removeEventListener("silena-bag", sync)
            window.removeEventListener("storage", sync)
            window.removeEventListener("silena-bag-open", onOpen)
            window.removeEventListener("keydown", onKey)
        }
    }, [])

    // render the 3D thumbnails the bag needs (once per colour)
    useEffect(() => {
        bag.forEach((it) => {
            if (thumbs[it.id]) return
            const f = FINISHES.find((x) => x.id === it.id)
            if (!f) return
            lampThumb(f)
                .then((url) => setThumbs((t) => ({ ...t, [f.id]: url })))
                .catch(() => {})
        })
    }, [bag])

    const count = bag.reduce((s, i) => s + i.qty, 0)
    const sub = bag.reduce((s, i) => s + (FINISHES.find((f) => f.id === i.id)?.price || 0) * i.qty, 0)
    const change = (idx, d) => {
        const b = readBag()
        if (!b[idx]) return
        b[idx].qty = Math.min(9, b[idx].qty + d)
        if (b[idx].qty < 1) b.splice(idx, 1)
        writeBag(b)
    }
    const remove = (idx) => {
        const b = readBag()
        b.splice(idx, 1)
        writeBag(b)
    }

    const btn: CSSProperties = {
        position: "relative",
        width: 54,
        height: 54,
        padding: 0,
        borderRadius: "50%",
        border: "none",
        background: c.btn,
        color: c.ink,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        fontFamily: FONT,
        flex: "none",
        transition: "background .9s, color .9s",
    }
    const qtyBtn: CSSProperties = { width: 34, height: "100%", border: 0, background: "none", color: c.ink, cursor: "pointer", fontSize: 16 }

    const drawer =
        typeof document !== "undefined"
            ? createPortal(
                  <div className={"slbag" + (open ? " on" : "")} aria-hidden={!open}>
                      <style>{`
.slbag .scrim{position:fixed;inset:0;background:rgba(10,7,4,.45);opacity:0;pointer-events:none;transition:opacity .4s;z-index:1000}
.slbag .panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:1001;transform:translateX(100%);visibility:hidden;transition:transform .55s cubic-bezier(.22,.61,.36,1),background .6s,visibility 0s .55s;display:flex;flex-direction:column;box-sizing:border-box;padding:calc(24px + env(safe-area-inset-top,0px)) max(24px,env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) 24px;font-family:${FONT};font-weight:300}
.slbag.on .scrim{opacity:1;pointer-events:auto}.slbag.on .panel{transform:none;visibility:visible;transition:transform .55s cubic-bezier(.22,.61,.36,1),background .6s}
.slbag .thumb img{width:100%;height:100%;object-fit:contain;display:block;animation:slbagIn .5s ease both}
@keyframes slbagIn{from{opacity:0;transform:scale(.9) rotate(-8deg)}to{opacity:1;transform:none}}
.slbag button:focus-visible,.silena-bag-btn:focus-visible{outline:2px solid #F0892A;outline-offset:3px}
@media (prefers-reduced-motion:reduce){.slbag .panel,.slbag .scrim{transition:none}.slbag .thumb img{animation:none}}
`}</style>
                      <div className="scrim" onClick={() => setOpen(false)} />
                      <aside className="panel" aria-label={title} style={{ background: c.panel, color: c.ink }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: `1px solid ${c.line}` }}>
                              <span style={{ fontSize: 24 }}>{title}</span>
                              <button type="button" aria-label="Close bag" onClick={() => setOpen(false)} style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${c.line2}`, background: "none", color: c.ink, cursor: "pointer", fontSize: 16 }}>
                                  ✕
                              </button>
                          </div>
                          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                              {bag.length === 0 ? (
                                  <p style={{ margin: "auto", textAlign: "center", color: c.muted, fontSize: 16, lineHeight: 1.6, maxWidth: "24ch" }}>{empty}</p>
                              ) : (
                                  bag.map((it, idx) => {
                                      const f = FINISHES.find((x) => x.id === it.id) || FINISHES[0]
                                      return (
                                          <div key={it.id} style={{ display: "grid", gridTemplateColumns: "88px minmax(0,1fr) auto", gap: 16, padding: "20px 0", borderBottom: `1px solid ${c.line}`, alignItems: "center" }}>
                                              <div className="thumb" style={{ width: 88, height: 88, borderRadius: 18, background: c.stage, padding: 4, boxSizing: "border-box", display: "grid", placeItems: "center" }}>
                                                  {thumbs[f.id] ? (
                                                      <img src={thumbs[f.id]} alt={`Silena, ${f.name} glass`} />
                                                  ) : (
                                                      <span style={{ width: 54, height: 54, borderRadius: "50%", background: swatch(f), position: "relative", display: "block" }}>
                                                          <span style={{ position: "absolute", inset: "40%", borderRadius: "50%", background: c.stage }} />
                                                      </span>
                                                  )}
                                              </div>
                                              <div>
                                                  <div style={{ fontWeight: 400 }}>Silena</div>
                                                  <div style={{ color: c.muted, fontSize: 13 }}>{f.name} glass</div>
                                                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${c.line2}`, borderRadius: 999, height: 36, width: "max-content", marginTop: 8 }}>
                                                      <button type="button" aria-label="One less" style={qtyBtn} onClick={() => change(idx, -1)}>
                                                          −
                                                      </button>
                                                      <span style={{ minWidth: 20, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{it.qty}</span>
                                                      <button type="button" aria-label="One more" style={qtyBtn} onClick={() => change(idx, 1)}>
                                                          +
                                                      </button>
                                                  </div>
                                                  <button type="button" onClick={() => remove(idx)} style={{ border: 0, background: "none", color: c.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0, marginTop: 6, fontFamily: FONT }}>
                                                      Remove
                                                  </button>
                                              </div>
                                              <span style={{ alignSelf: "start", fontVariantNumeric: "tabular-nums" }}>{eur(f.price * it.qty)}</span>
                                          </div>
                                      )
                                  })
                              )}
                          </div>
                          {bag.length > 0 && (
                              <div style={{ paddingTop: 18, display: "grid", gap: 10, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Subtotal</span>
                                      <span>{eur(sub)}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", color: c.muted }}>
                                      <span>Delivery</span>
                                      <span>Free</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, paddingTop: 10, borderTop: `1px solid ${c.line}` }}>
                                      <span>Total</span>
                                      <span>{eur(sub)}</span>
                                  </div>
                              </div>
                          )}
                          {note && <p style={{ margin: "14px 0 0", fontSize: 13, color: c.muted, textAlign: "center" }}>{note}</p>}
                          <button
                              type="button"
                              disabled={!bag.length}
                              onClick={() => setNote(checkoutNote)}
                              style={{ marginTop: 14, height: 56, border: 0, borderRadius: 999, background: c.cta, color: c.ctaInk, fontSize: 15, fontWeight: 400, fontFamily: FONT, cursor: bag.length ? "pointer" : "default", opacity: bag.length ? 1 : 0.4 }}
                          >
                              Checkout
                          </button>
                      </aside>
                  </div>,
                  document.body
              )
            : null

    return (
        <>
            <button type="button" className="silena-bag-btn" aria-label={count ? `Open bag, ${count} items` : "Open bag"} title="Bag" onClick={() => setOpen(true)} style={btn}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5.5 8.5h13l-1 11.2a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3z" />
                    <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
                </svg>
                {count > 0 && (
                    <span
                        className="silena-bag-count"
                        style={{
                            position: "absolute",
                            top: 9,
                            right: 8,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            background: c.count,
                            color: c.countInk,
                            fontSize: 10,
                            fontWeight: 500,
                            lineHeight: "16px",
                            textAlign: "center",
                            padding: "0 4px",
                            boxSizing: "border-box",
                            fontVariantNumeric: "tabular-nums",
                            transform: bump ? "scale(1.35)" : "scale(1)",
                            transition: "transform .35s cubic-bezier(.34,1.56,.64,1), background .9s, color .9s",
                        }}
                    >
                        {count}
                    </span>
                )}
            </button>
            {drawer}
        </>
    )
}
