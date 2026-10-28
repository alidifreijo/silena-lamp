// @ts-nocheck
// Silena — "02 · The place to be". A painted isometric room with four touch points:
// the bookshelf (the reader), the sofa (the storyteller), the table (the host) and the
// record player (the dreamer). Tapping one transforms the room around that person and
// places the Silena lamp, in perspective, where that person would use it.
// Entry (pinned on desktop, same scroll length as Light Rituals): the room's outlines are drawn,
// then painted; the furniture falls in as a line drawing and gets painted on the way down. The
// drawing glides with a little inertia. When the room is complete the scroll pauses for a moment
// (first time only) and the touch points pulse. It never takes itself apart again.
// Soft sketch guides (the walls' and floor's edges, carried past the room) are drawn first.
// The drawing and behaviour live in SilenaRoomCore.tsx; this file holds the props, page layout
// and the entry. Day/night follows the site switch in the nav (SilenaThemeSwitch).
import { useEffect, useRef, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"
import { CSS, mount } from "./SilenaRoomCore.tsx"

/* layout tweaks for the page (kept here so they are quick to change) */
const LAYOUT =
    /* larger, airier text column */
    /* the text keeps its distance from the drawing, whatever the screen */
    ".slr .slr-wrap{grid-template-columns:minmax(0,400px) minmax(0,1fr);gap:clamp(56px,7vw,150px);padding:72px clamp(56px,6vw,120px) 32px}" +
    ".slr .slr-h{font-size:clamp(40px,4.6vw,76px);line-height:1.02;margin:0 0 32px}" +
    ".slr .lead{font-size:19px;line-height:1.6;max-width:32ch}" +
    ".slr .card .n{font-size:clamp(28px,2.6vw,38px);gap:14px;margin:0 0 16px}" +
    ".slr .card .l{font-size:19px;line-height:1.6;margin:0 0 20px;max-width:34ch}" +
    ".slr .card .r{font-size:14px;line-height:1.5}" +
    /* a bigger house; its sketch guides may run past the drawing, the section clips them */
    ".slr{overflow:clip}.slr svg{width:100%;margin:0 auto;max-height:calc(100vh - 64px);overflow:visible;color:var(--ink)}" +
    /* ...but they stop short of the text column */
    ".slr .stage{clip-path:inset(-40vh -50vw -40vh -24px)}" +
    "@media (max-width:860px){.slr .stage{clip-path:none}}" +
    ".slr .slr-guide{fill:none;stroke-width:1.1px;opacity:.34;vector-effect:non-scaling-stroke;stroke-linecap:round}.slr .slr-guide2{opacity:.16;stroke-width:.9px}" +
    /* the dreamer's touch point sits beside the record, not on it */
    ".slr .spot[data-k=\"dreamer\"]{margin:-30px 0 0 34px}" +
    /* shared Silena palette: same background and text as the rest of the page */
    ".slr{--bgN:#261E13!important;--bgD:#D8CAB6!important;--ink:#F4E9DC;--muted:rgba(244,233,220,.6)}" +
    ".slr[data-mode=\"day\"]{--ink:#2E2216;--muted:rgba(46,34,22,.62)}" +
    /* the page background switches at once, so the room's background does too (no lighter box) */
    ".slr{transition:color .6s ease!important}.slr svg{transition:none!important}" +
    /* the persona card takes the place of the intro line (no empty gap) and answers the tap straight away */
    ".slr .slr-text{display:grid;grid-template-columns:minmax(0,1fr)}" +
    ".slr .slr-h{grid-row:1}.slr .lead,.slr .card{grid-row:2;grid-column:1;align-self:start}" +
    ".slr .card{margin-top:0;transition:opacity .7s ease,transform .9s cubic-bezier(.22,.61,.36,1)}" +
    /* day/night lives only in the nav */
    ".slr .tools{display:none}" +
    /* entry: touch points, window light and small animations wait until the room is built */
    ".slr .spots .spot{transition:opacity .6s ease,transform .6s cubic-bezier(.34,1.56,.64,1),background .4s,border-color .4s,width .3s,height .3s}" +
    ".slr.asm:not(.spots-on) .spots .spot{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,0deg)) scale(.6);pointer-events:none}" +
    ".slr #slr-anim,.slr #slr-shaft,.slr #slr-patch{transition:opacity .8s ease}" +
    ".slr.asm #slr-anim,.slr.asm #slr-shaft,.slr.asm #slr-patch{opacity:0}" +
    /* pinned while it builds (desktop) */
    ".slr-pin{position:sticky;top:0}" +
    "@media (max-width:860px){.slr-pin{position:relative}.slr .slr-wrap{grid-template-columns:minmax(0,1fr);padding:150px 20px 40px;gap:28px}.slr .slr-h{font-size:40px;margin-bottom:20px}.slr .lead,.slr .card .l{font-size:17px}.slr svg{width:100%}}" +
    /* the eyebrow lives outside the room and sticks at the nav's height */
    ".slr .eyebrow{display:none}" +
    ".slr-eb{position:sticky;top:32px;height:0;z-index:5;pointer-events:none}" +
    ".slr-eb span{position:absolute;left:42px;top:0;font:400 12px/14px 'Outfit',ui-sans-serif,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,233,220,.6);transition:color .6s ease;white-space:nowrap}" +
    "body[data-framer-theme=\"light\"] .slr-eb span{color:rgba(46,34,22,.62)}" +
    /* entry: line-drawing twins of the pieces, and the touch points' first pulse */
    ".slr .slr-sk,.slr .slr-sk *{fill:none!important;stroke:var(--ink)!important;stroke-width:1.25px!important;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}" +
    /* the touch points are painted pools of light, in each person's colour, with the room's grain.
       Their names show for a moment the first time (and on hover), right where the eye already is */
    ".slr .spots .spot{--rot:0deg;--pc:#FFD6A0;width:54px!important;height:46px!important;border:0!important;background:none!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;overflow:visible;display:block}" +
    ".slr .spots .spot[data-k=reader]{--pc:#FFB066}.slr .spots .spot[data-k=storyteller]{--pc:#FFD199}.slr .spots .spot[data-k=host]{--pc:#FFCF8F}.slr .spots .spot[data-k=dreamer]{--pc:#C9B8EC}" +
    ".slr .spots .spot::before{content:'';position:absolute;inset:0;border-radius:54% 46% 58% 42% / 48% 56% 44% 52%;" +
    "background:radial-gradient(closest-side,color-mix(in srgb,var(--pc) 35%,#fff) 0,color-mix(in srgb,var(--pc) 80%,transparent) 30%,color-mix(in srgb,var(--pc) 30%,transparent) 62%,transparent 100%);" +
    "filter:blur(2px);mix-blend-mode:screen;animation:slrBreath 4.2s ease-in-out infinite;transition:opacity .6s ease}" +
    ".slr[data-mode=day] .spots .spot::before{mix-blend-mode:normal;background:radial-gradient(closest-side,#fff 0,color-mix(in srgb,var(--pc) 85%,#fff) 30%,color-mix(in srgb,var(--pc) 40%,transparent) 62%,transparent 100%)}" +
    ".slr .spots .spot::after{content:'';position:absolute;inset:4px;border-radius:50%;opacity:.5;mix-blend-mode:multiply;pointer-events:none;" +
    "background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .55 0 0 0 0 .42 0 0 0 0 .3 0 0 0 1.6 -.55'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)'/%3E%3C/svg%3E\");" +
    "-webkit-mask:radial-gradient(closest-side,#000 30%,transparent);mask:radial-gradient(closest-side,#000 30%,transparent)}" +
    ".slr .spots .spot:nth-child(2)::before{animation-delay:-1s}.slr .spots .spot:nth-child(3)::before{animation-delay:-2.1s}.slr .spots .spot:nth-child(4)::before{animation-delay:-3.2s}" +
    "@keyframes slrBreath{0%,100%{transform:scale(.9);opacity:.8}50%{transform:scale(1.08);opacity:1}}" +
    ".slr .spots .spot i{display:none!important}" +
    ".slr .spots .spot:hover,.slr .spots .spot:focus-visible{transform:translate(-50%,-50%) scale(1.25);outline:none}" +
    /* the chosen one steps back: its lamp is lit there now */
    ".slr .spots .spot.cur::before{opacity:.35;animation:none}" +
    /* the name: plain painted-world text, no chip */
    ".slr .spots .spot b{left:calc(100% + 2px)!important;padding:0!important;background:none!important;border:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;" +
    "font:300 16px/1.2 var(--font)!important;letter-spacing:.01em!important;color:var(--ink)!important;text-shadow:0 0 14px var(--bg),0 0 4px var(--bg);transition:opacity .8s ease!important}" +
    ".slr .spots .spot.left b{left:auto!important;right:calc(100% + 2px)!important}" +
    ".slr .spots.ping .spot b,.slr .spots .spot.say b{opacity:1;transition-duration:.4s!important}" +
    ".slr .spots .spot.cur:not(.say) b{opacity:0!important}" +
    ".slr .spots.ping .spot::before{animation:slrBurst 1.4s ease-out 3}" +
    "@keyframes slrBurst{0%{transform:scale(.9)}35%{transform:scale(1.4);opacity:1}100%{transform:scale(.95);opacity:.85}}" +
    /* while it builds, the drawing settles in (a slow zoom), so every bit of scroll shows something */
    ".slr .stage{transform-origin:50% 60%;will-change:transform}"

/* ---------- entry: the room is drawn, then painted, as you scroll ----------
   1. Structure: the outlines of the walls, floor and window draw themselves like pencil lines.
   2. The structure gets painted: a rough brush wipe fills each plane.
   3. Furniture falls in as a line drawing and gets painted on the way down.
   4. When everything has landed the touch points, window light and small animations appear.
   Progress follows the scroll (pinned on desktop) and never goes backwards. */
function assemble(host, root, pinVh, opts) {
    opts = opts || {}
    const NS = "http://www.w3.org/2000/svg"
    const svg = root.querySelector("svg")
    const paint = svg && svg.querySelector('g[filter*="slr-paint"]')
    if (!paint) return () => {}
    const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild)
    const pieces = [...paint.children].filter((el) => !el.classList.contains("set") && !el.getAttribute("clip-path"))
    const shell = pieces.filter((el) => el.tagName.toLowerCase() !== "g")
    const furniture = pieces.filter((el) => el.tagName.toLowerCase() === "g")
    const SHAPES = "polygon,path,rect,circle,ellipse,line,polyline"

    // a line-drawing twin of a piece: same geometry, no fill, ink stroke drawn with dashes
    function sketchOf(el) {
        const sk = el.cloneNode(true)
        sk.removeAttribute("id")
        sk.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"))
        sk.setAttribute("class", (sk.getAttribute("class") || "") + " slr-sk")
        sk.setAttribute("aria-hidden", "true")
        const shapes = sk.matches && sk.matches(SHAPES) ? [sk] : [...sk.querySelectorAll(SHAPES)]
        shapes.forEach((s) => {
            s.setAttribute("pathLength", "1")
            s.removeAttribute("filter")
        })
        el.after(sk)
        return { el: sk, shapes }
    }
    // a brush-wipe mask for a piece (in its own coordinates, so it travels with it)
    let mi = 0
    function wipeOf(el, dir) {
        let b
        try {
            b = el.getBBox()
        } catch (e) {
            return null
        }
        if (!b || !b.width) return null
        const id = "slr-wipe" + mi++
        const m = document.createElementNS(NS, "mask")
        m.setAttribute("id", id)
        m.setAttribute("maskUnits", "userSpaceOnUse")
        m.setAttribute("x", String(b.x - 60))
        m.setAttribute("y", String(b.y - 60))
        m.setAttribute("width", String(b.width + 120))
        m.setAttribute("height", String(b.height + 120))
        // the wipe is a shape with a wavy, brush-like leading edge (no live filter: cheap to move)
        const r = document.createElementNS(NS, "path")
        r.setAttribute("fill", "#fff")
        m.appendChild(r)
        defs.appendChild(m)
        el.setAttribute("mask", `url(#${id})`)
        const H = b.height + 60, X0 = b.x - 40, X1 = b.x + b.width + 40, A = Math.min(18, 6 + b.height * 0.06)
        const ph = [Math.random() * 6.28, Math.random() * 6.28], fr = [6 / (X1 - X0), 15 / (X1 - X0)]
        const edge = (y0, sgn) => {
            let d = ""
            for (let i = 0; i <= 16; i++) {
                const x = X1 - ((X1 - X0) * i) / 16
                const y = y0 + sgn * (A * Math.sin(x * fr[0] + ph[0]) + A * 0.5 * Math.sin(x * fr[1] + ph[1]) + A)
                d += `L${x.toFixed(1)},${y.toFixed(1)}`
            }
            return d
        }
        // dir 1: paint from the bottom up, -1: from the top down
        return {
            set(t) {
                const h = (H + A * 3) * t
                if (dir > 0) {
                    const yb = b.y + b.height + 40, yt = yb - h
                    r.setAttribute("d", `M${X0},${yb}L${X1},${yb}` + edge(yt, -1) + "Z")
                } else {
                    const yt = b.y - 40, yb = yt + h
                    r.setAttribute("d", `M${X0},${yt}L${X1},${yt}` + edge(yb, 1) + "Z")
                }
            },
            done() {
                el.removeAttribute("mask")
                m.remove()
            },
        }
    }

    const steps = []
    // 1–2. structure
    shell.forEach((el, i) => {
        const sk = sketchOf(el)
        const wipe = wipeOf(el, 1)
        steps.push({ kind: "shell", el, sk, wipe, draw: [0.0 + i * 0.019, 0.155 + i * 0.019], fill: [0.11 + i * 0.023, 0.265 + i * 0.023] })
    })
    // 3. furniture
    const f0 = 0.3, f1 = 0.96
    const each = Math.min(0.3, (f1 - f0) * 0.46)
    furniture.forEach((el, i) => {
        const start = f0 + (i * (f1 - f0 - each)) / Math.max(1, furniture.length - 1)
        const sk = sketchOf(el)
        const wipe = wipeOf(el, -1)
        steps.push({ kind: "item", el, sk, wipe, start, len: each })
    })

    // the night shade over the room arrives with the paint
    const dark = svg.querySelector("#slr-dark")
    const darkBase = dark ? parseFloat(getComputedStyle(dark).opacity) || 1 : 1
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)))
    const show = (el, on) => (el.style.display = on ? "" : "none")
    function setDraw(sk, t) {
        sk.shapes.forEach((s) => {
            s.style.strokeDasharray = "1"
            s.style.strokeDashoffset = String((1 - t).toFixed(4))
        })
    }
    // only pieces that are moving are touched each frame; finished ones drop their mask
    const guides = [...svg.querySelectorAll(".slr-guide")]
    const stage = root.querySelector(".stage")
    function apply(p) {
        // the whole drawing settles in as it builds: a slow zoom and drift, always moving with the scroll
        if (stage) {
            const e = 1 - Math.pow(1 - p, 2)
            stage.style.transform = p >= 1 ? "" : `translateY(${((1 - e) * 26).toFixed(1)}px) scale(${(0.9 + 0.1 * e).toFixed(4)})`
        }
        // the touch points show up while the last pieces are still landing
        root.classList.toggle("spots-on", p > 0.62)
        // 0. the sketch guides first
        guides.forEach((g, i) => {
            const t = ease(seg(p, i * 0.006, 0.12 + i * 0.006))
            g.style.strokeDasharray = "1"
            g.style.strokeDashoffset = String((1 - t).toFixed(4))
        })
        if (dark) dark.style.opacity = String((darkBase * ease(seg(p, 0.09, 0.31))).toFixed(3))
        steps.forEach((s) => {
            if (s.complete) return
            if (s.kind === "shell") {
                const d = ease(seg(p, s.draw[0], s.draw[1]))
                const f = ease(seg(p, s.fill[0], s.fill[1]))
                if (d === s.d && f === s.f) return
                s.d = d
                s.f = f
                show(s.sk.el, d > 0)
                show(s.el, f > 0)
                setDraw(s.sk, d)
                s.sk.el.style.opacity = String(1 - f * 0.85)
                if (s.wipe) s.wipe.set(f)
                else s.el.style.opacity = String(f)
                if (f >= 1) {
                    s.wipe && s.wipe.done()
                    s.el.style.opacity = ""
                    s.complete = true
                }
            } else {
                const t = seg(p, s.start, s.start + s.len)
                if (t === s.t) return
                s.t = t
                show(s.el, t > 0)
                show(s.sk.el, t > 0 && t < 1)
                if (t >= 1) {
                    s.wipe && s.wipe.done()
                    s.el.style.opacity = ""
                    s.el.style.translate = ""
                    s.complete = true
                    return
                }
                const fall = 1 - ease(Math.min(1, t / 0.75))
                const y = (-90 * fall).toFixed(1)
                s.el.style.translate = s.sk.el.style.translate = `0 ${y}px`
                setDraw(s.sk, ease(Math.min(1, t / 0.5)))
                const f = ease(seg(t, 0.25, 0.95))
                s.sk.el.style.opacity = String(1 - f * 0.9)
                if (s.wipe) s.wipe.set(f)
                else s.el.style.opacity = String(f)
            }
        })
    }
    let painted = true
    const setPaint = (on) => {
        if (on === painted || opts.keepFilter) return
        painted = on
        if (on) paint.setAttribute("filter", "url(#slr-paint)")
        else paint.removeAttribute("filter")
    }
    root.classList.add("asm")
    setPaint(false)
    apply(0)
    // a tap on a touch point while the room is still landing completes it at once
    const early = (e) => {
        if (!finished && e.target.closest && e.target.closest(".spot,.hot")) finish()
    }
    root.addEventListener("pointerdown", early, true)

    // done = what is drawn; goal = where the scroll is (+ a little momentum). The drawing glides
    // towards the goal, so it keeps moving for a moment after the scroll stops.
    let done = 0, goal = 0, lastRaw = 0, lead = 0, finished = false, raf = 0
    function finish() {
        finished = true
        apply(1)
        steps.forEach((s) => {
            s.sk.el.remove()
            if (!s.complete && s.wipe) s.wipe.done()
            show(s.el, true)
            s.el.style.opacity = ""
            s.el.style.translate = ""
        })
        if (dark) dark.style.opacity = ""
        setPaint(true)
        root.classList.remove("asm")
        window.removeEventListener("scroll", kick)
        window.removeEventListener("resize", kick)
        hold()
    }
    // once the room is complete: a pause (about 3.4 s) in the scroll and the touch points pulse,
    // so the visitor notices they can play with it (only the first time, only if in view)
    let unhold = () => {}
    function hold() {
        const ms = opts.holdMs == null ? 3400 : opts.holdMs
        const spots = root.querySelector(".spots")
        if (spots) {
            spots.classList.add("ping")
            setTimeout(() => spots.classList.remove("ping"), 4600)
        }
        const r = svg.getBoundingClientRect()
        if (!ms || r.bottom < 0 || r.top > window.innerHeight) return
        const keys = { ArrowDown: 1, ArrowUp: 1, PageDown: 1, PageUp: 1, " ": 1, Home: 1, End: 1 }
        const y = window.scrollY
        const stopWheel = (e) => {
            e.preventDefault()
            e.stopPropagation()
        }
        const stopKey = (e) => {
            if (keys[e.key]) stopWheel(e)
        }
        const keep = () => {
            if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y)
        }
        const o = { capture: true, passive: false }
        window.addEventListener("wheel", stopWheel, o)
        window.addEventListener("touchmove", stopWheel, o)
        window.addEventListener("keydown", stopKey, true)
        window.addEventListener("scroll", keep, true)
        // smooth scrolling (if any) pauses too
        window.dispatchEvent(new Event("silena-scroll-lock"))
        const t = setTimeout(() => unhold(), ms)
        unhold = () => {
            clearTimeout(t)
            window.dispatchEvent(new Event("silena-scroll-unlock"))
            window.removeEventListener("wheel", stopWheel, o)
            window.removeEventListener("touchmove", stopWheel, o)
            window.removeEventListener("keydown", stopKey, true)
            window.removeEventListener("scroll", keep, true)
            unhold = () => {}
        }
        // any tap on the room releases the pause straight away
        root.addEventListener("pointerdown", () => unhold(), { once: true })
    }
    function frame() {
        raf = 0
        if (finished) return
        const vh = window.innerHeight
        const pinned = pinVh > 0 && window.innerWidth > 860
        let p
        if (pinned) {
            const r = host.getBoundingClientRect()
            p = (vh * 0.45 - r.top) / (vh * 0.45 + ((vh * pinVh) / 100) * 0.85)
        } else {
            const r = svg.getBoundingClientRect()
            p = (vh * 0.95 - r.top) / (vh * 0.8)
        }
        p = Math.min(1, Math.max(0, p))
        // momentum: a quick scroll pushes the drawing a little further than the scroll itself
        if (p > lastRaw) lead = Math.min(0.09, lead + (p - lastRaw) * 0.8)
        lastRaw = p
        lead *= 0.95
        goal = Math.max(goal, Math.min(1, p + lead))
        const next = done + (goal - done) * 0.07
        if (next > done + 0.00005) {
            done = goal - next < 0.0008 ? goal : next
            apply(done)
        }
        if (done >= 0.995) {
            finish()
            return
        }
        if (goal - done > 0.0005 || lead > 0.0005) raf = requestAnimationFrame(frame)
    }
    function kick() {
        if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener("scroll", kick, { passive: true })
    window.addEventListener("resize", kick)
    kick()
    return () => {
        unhold()
        root.removeEventListener("pointerdown", early, true)
        cancelAnimationFrame(raf)
        window.removeEventListener("scroll", kick)
        window.removeEventListener("resize", kick)
    }
}

/* ---------- soft isometric construction lines around the room ----------
   Pencil-like guides that continue the room's edges and the iso axes beyond it, fading out at
   both ends. They sit behind the room, so they never cross the drawing. They are drawn first
   during the entry (class slr-guide), then stay. */
function addGuides(svg) {
    const NS = "http://www.w3.org/2000/svg"
    const S = 46, C = 0.866
    const P = (x, y, z) => [600 + (x - y) * S * C, 350 + (x + y) * S * 0.5 - z * S]
    // the six lines of the walls and the floor, plus the two outer corners, carried past the room
    const L = [
        [[-4.5, 10, 0], [15.5, 10, 0]],
        [[10, -4.5, 0], [10, 15.5, 0]],
        [[-3.5, 0, 0], [14, 0, 0]],
        [[0, -3.5, 0], [0, 14, 0]],
        [[-3, 0, 7], [13, 0, 7]],
        [[0, -3, 7], [0, 13, 7]],
        // the two outer corners of the walls, carried well above and below the room
        [[10, 0, -4.5], [10, 0, 11.5]],
        [[0, 10, -4.5], [0, 10, 11.5]],
    ]
    // a seeded wobble, so the lines look drawn by hand and stay the same on every visit
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const sketch = (x1, y1, x2, y2, amp) => {
        const n = 9, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len
        const pts = []
        for (let k = 0; k <= n; k++) {
            const t = k / n, w = (rnd() - 0.5) * amp * (k === 0 || k === n ? 0.4 : 1)
            pts.push([x1 + dx * t + nx * w, y1 + dy * t + ny * w])
        }
        let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
        for (let k = 1; k < pts.length; k++) {
            const [px, py] = pts[k - 1], [qx, qy] = pts[k]
            d += `Q${px.toFixed(1)},${py.toFixed(1)} ${((px + qx) / 2).toFixed(1)},${((py + qy) / 2).toFixed(1)}`
        }
        return d + `L${pts[n][0].toFixed(1)},${pts[n][1].toFixed(1)}`
    }
    const g = document.createElementNS(NS, "g")
    g.setAttribute("class", "slr-guides")
    g.setAttribute("aria-hidden", "true")
    let defs = svg.querySelector("defs")
    if (!defs) {
        defs = document.createElementNS(NS, "defs")
        svg.prepend(defs)
    }
    L.forEach(([a, b], i) => {
        const [x1, y1] = P(...a), [x2, y2] = P(...b)
        const id = "slr-gfade" + i
        const lg = document.createElementNS(NS, "linearGradient")
        lg.setAttribute("id", id)
        lg.setAttribute("gradientUnits", "userSpaceOnUse")
        lg.setAttribute("x1", String(x1))
        lg.setAttribute("y1", String(y1))
        lg.setAttribute("x2", String(x2))
        lg.setAttribute("y2", String(y2))
        lg.innerHTML = '<stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset=".25" stop-color="currentColor" stop-opacity="1"/><stop offset=".75" stop-color="currentColor" stop-opacity="1"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>'
        defs.appendChild(lg)
        // two strokes per line: the main one, and a lighter second pass that starts and stops
        // somewhere else, the way a pencil goes over a line twice
        const p = document.createElementNS(NS, "path")
        p.setAttribute("d", sketch(x1, y1, x2, y2, 3.2))
        p.setAttribute("stroke", `url(#${id})`)
        p.setAttribute("class", "slr-guide")
        p.setAttribute("pathLength", "1")
        g.appendChild(p)
        const a0 = 0.08 + rnd() * 0.15, a1 = 0.72 + rnd() * 0.2
        const p2 = document.createElementNS(NS, "path")
        p2.setAttribute("d", sketch(x1 + (x2 - x1) * a0 + 1.2, y1 + (y2 - y1) * a0 + 1.4, x1 + (x2 - x1) * a1 + 1.2, y1 + (y2 - y1) * a1 + 1.4, 4))
        p2.setAttribute("stroke", `url(#${id})`)
        p2.setAttribute("class", "slr-guide slr-guide2")
        p2.setAttribute("pathLength", "1")
        g.appendChild(p2)
    })
    // behind everything else in the room
    defs.after(g)
    return g
}

interface Props {
    eyebrow: string
    question: string
    lead: string
    nightLabel: string
    dayLabel: string
    readerName: string
    readerLine: string
    readerLight: string
    storyName: string
    storyLine: string
    storyLight: string
    hostName: string
    hostLine: string
    hostLight: string
    dreamerName: string
    dreamerLine: string
    dreamerLight: string
    buildScroll: number
    style?: CSSProperties
}

const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

/**
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SilenaRoom(props: Props) {
    const {
        eyebrow = "02 — The place to be",
        question = "Who are you at home?",
        lead = "A sofa, a table, a bookshelf and a record player. Tap one and the room becomes someone.",
        nightLabel = "Night",
        dayLabel = "Day",
        readerName = "The reader",
        readerLine = "An armchair by the window, a coffee still steaming, one more chapter.",
        readerLight = "<b>3000K</b> · honey white · lying on the side table",
        storyName = "The storyteller",
        storyLine = "A big sofa, walls full of pictures, notes everywhere and the dog asleep at your feet.",
        storyLight = "<b>2700K</b> · warm white · on the wall, among the pictures",
        hostName = "The host",
        hostLine = "A long table set for everyone. Flowers, too many cups, nobody leaving.",
        hostLight = "<b>2200K</b> · amber · lying in the middle of the table",
        dreamerName = "The dreamer",
        dreamerLine = "Put a record on. Low light, two glasses, nowhere to be.",
        dreamerLight = "<b>Lavender</b> · on the wall, above the record player",
        buildScroll = 270,
    } = props
    const ref = useRef<HTMLDivElement>(null)
    const key = [eyebrow, question, lead, nightLabel, dayLabel, readerName, readerLine, readerLight, storyName, storyLine, storyLight, hostName, hostLine, hostLight, dreamerName, dreamerLine, dreamerLight, buildScroll].join("|")

    useEffect(() => {
        const host = ref.current
        if (!host) return
        host.innerHTML = `<style>${CSS}${LAYOUT}.slr-spacer{height:${buildScroll}vh}@media (max-width:860px){.slr-spacer{display:none}}</style>
<div class="slr-eb" aria-hidden="true"><span>${esc(eyebrow)}</span></div>
<div class="slr-pin">
<div class="slr" data-mode="night">
  <div class="slr-wrap">
    <div class="slr-text">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h2 class="slr-h">${esc(question)}</h2>
      <p class="lead" id="slr-lead">${esc(lead)}</p>
      <div class="card hide" id="slr-card" aria-live="polite">
        <p class="n"><span class="dot"></span><span id="slr-cn"></span></p>
        <p class="l" id="slr-cl"></p>
        <p class="r" id="slr-cr"></p>
      </div>
      <div class="tools">
        <button class="btn" id="slr-mode" aria-label="Switch day and night" tabindex="-1"><span id="slr-modeLbl">${esc(nightLabel)}</span><span class="track"><span class="knob"></span></span></button>
      </div>
    </div>
    <div class="stage">
      <svg id="slr-svg" viewBox="168 14 864 812" role="img" aria-label="Isometric room with four tappable pieces of furniture"></svg>
      <div class="spots" id="slr-spots"></div>
    </div>
  </div>
</div>
</div>
<div class="slr-spacer" aria-hidden="true"></div>`
        host.classList.add("slr-host")
        const root = host.querySelector(".slr") as HTMLElement
        const COPY = {
            reader: { name: readerName, line: readerLine, read: readerLight },
            storyteller: { name: storyName, line: storyLine, read: storyLight },
            host: { name: hostName, line: hostLine, read: hostLight },
            dreamer: { name: dreamerName, line: dreamerLine, read: dreamerLight },
        }
        let stop = () => {}
        try {
            stop = mount(root, COPY, nightLabel, dayLabel)
        } catch (e) {
            console.error("SilenaRoom", e)
        }
        let stopAsm = () => {}
        try {
            addGuides(root.querySelector("svg"))
            stopAsm = assemble(host, root, buildScroll)
        } catch (e) {
            root.classList.remove("asm")
        }
        // show the persona text as soon as it is written (right after the tap),
        // instead of waiting for the lamp to appear
        // after a tap, the name stays a moment where you looked, then fades
        const sayT = new Map()
        root.querySelector("#slr-spots")?.addEventListener("click", (e) => {
            const b = (e.target as HTMLElement).closest(".spot") as HTMLElement
            if (!b) return
            root.querySelectorAll(".spot.say").forEach((x) => x !== b && x.classList.remove("say"))
            b.classList.add("say")
            clearTimeout(sayT.get(b))
            sayT.set(b, setTimeout(() => b.classList.remove("say"), 2200))
        })
        const card = root.querySelector("#slr-card")
        const cn = root.querySelector("#slr-cn")
        let mo: MutationObserver | null = null
        if (card && cn && typeof MutationObserver !== "undefined") {
            mo = new MutationObserver(() => {
                if (cn.textContent) card.classList.remove("hide")
            })
            mo.observe(cn, { childList: true, characterData: true, subtree: true })
        }
        return () => {
            mo?.disconnect()
            stopAsm()
            stop()
            host.innerHTML = ""
        }
    }, [key])

    return <div ref={ref} style={{ ...props.style, width: "100%", position: "relative" }} />
}

addPropertyControls(SilenaRoom, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "02 — The place to be" },
    question: { type: ControlType.String, title: "Question", defaultValue: "Who are you at home?" },
    lead: { type: ControlType.String, title: "Lead", defaultValue: "A sofa, a table, a bookshelf and a record player. Tap one and the room becomes someone.", displayTextArea: true },
    buildScroll: { type: ControlType.Number, title: "Build scroll", min: 0, max: 400, step: 10, unit: "vh", defaultValue: 270 },
    nightLabel: { type: ControlType.String, title: "Night label", defaultValue: "Night" },
    dayLabel: { type: ControlType.String, title: "Day label", defaultValue: "Day" },
    readerName: { type: ControlType.String, title: "Reader", defaultValue: "The reader" },
    readerLine: { type: ControlType.String, title: "Reader · line", defaultValue: "An armchair by the window, a coffee still steaming, one more chapter.", displayTextArea: true },
    readerLight: { type: ControlType.String, title: "Reader · light", defaultValue: "<b>3000K</b> · honey white · lying on the side table" },
    storyName: { type: ControlType.String, title: "Storyteller", defaultValue: "The storyteller" },
    storyLine: { type: ControlType.String, title: "Storyteller · line", defaultValue: "A big sofa, walls full of pictures, notes everywhere and the dog asleep at your feet.", displayTextArea: true },
    storyLight: { type: ControlType.String, title: "Storyteller · light", defaultValue: "<b>2700K</b> · warm white · on the wall, among the pictures" },
    hostName: { type: ControlType.String, title: "Host", defaultValue: "The host" },
    hostLine: { type: ControlType.String, title: "Host · line", defaultValue: "A long table set for everyone. Flowers, too many cups, nobody leaving.", displayTextArea: true },
    hostLight: { type: ControlType.String, title: "Host · light", defaultValue: "<b>2200K</b> · amber · lying in the middle of the table" },
    dreamerName: { type: ControlType.String, title: "Dreamer", defaultValue: "The dreamer" },
    dreamerLine: { type: ControlType.String, title: "Dreamer · line", defaultValue: "Put a record on. Low light, two glasses, nowhere to be.", displayTextArea: true },
    dreamerLight: { type: ControlType.String, title: "Dreamer · light", defaultValue: "<b>Lavender</b> · on the wall, above the record player" },
})
