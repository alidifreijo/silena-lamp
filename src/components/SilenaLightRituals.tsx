// @ts-nocheck
// Silena — 03 Light Rituals. The same room as section 02, abstracted into moods: no furniture, only
// the painted walls and floor, the window, the lamp on the wall (the shop's 3D lamp, in the room's
// isometric perspective) and the light moving through the day — morning, afternoon, evening, night
// (night first when the site is in night mode). The room's sketch lines stay on top.
// Entry on desktop: it slides under the room's last screen, takes a copy of the room where it is,
// lets the furniture and text fade, and zooms in while it repaints as the first mood. On phones the
// room is redrawn empty and the same zoom happens. Mood paintings are cached; scrolling only
// cross-fades them, moves a few particles and re-lights the lamp.
import { useEffect, useRef, useState, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { loadThree } from "./SilenaLamp3D.tsx"

type Mode = "dark" | "light"
const CSS = `.slx{position:relative;z-index:5;width:100%;font-family:'Outfit',ui-sans-serif,system-ui,sans-serif;font-weight:300;pointer-events:none}
.slx *{box-sizing:border-box}
.slx-pin{position:sticky;top:0;height:100vh;overflow:hidden;background:var(--pg)}
.slx canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.slx-room{position:absolute;inset:0;overflow:hidden}
.slx-grain{position:absolute;inset:0;pointer-events:none;opacity:.22;mix-blend-mode:overlay}
.slx-eb{position:absolute;top:32px;left:42px;font-size:12px;line-height:14px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);white-space:nowrap;transition:color .5s}
.slx-stmts{position:absolute;left:42px;right:42px;bottom:108px;height:170px}
.slx-stmt{position:absolute;left:0;bottom:0;width:min(640px,80vw);display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(14px);transition:opacity .8s ease,transform 1s cubic-bezier(.22,.61,.36,1)}
.slx-stmt.on{opacity:1;transform:none}
.slx-stmt b{max-width:15ch;font-weight:200;font-size:clamp(34px,4vw,60px);line-height:1.04;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}
.slx-stmt span{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.slx-track{position:absolute;left:42px;right:42px;bottom:40px;height:30px}
.slx-line{position:absolute;left:0;right:0;top:0;height:1px;background:var(--line)}
.slx-fill{position:absolute;left:0;top:0;height:1px;background:var(--ink)}
.slx-labels{position:absolute;left:0;right:0;top:12px;display:flex;justify-content:space-between;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.slx-labels span{color:var(--muted);transition:color .5s}
.slx-labels span.on{color:var(--ink)}
@media (max-width:640px){.slx-eb{left:20px}.slx-stmts{left:24px;right:24px;bottom:92px}.slx-stmt b{font-size:32px}.slx-track{left:24px;right:24px;bottom:34px}.slx-labels{font-size:10px;letter-spacing:.06em}}
@media (prefers-reduced-motion:reduce){.slx-stmt{transition:none}}`

/* ---------------------------------------------------------------------------
   Silena — Light Rituals as moods. The same room as section 02, abstracted: no furniture, only
   the painted walls and floor, the window, the lamp on the wall and the light moving through the
   day. The room's sketch lines stay on top as the thread between the two sections.
   Entry (desktop, when the room sits right above): this section slides under the room's last
   screen, takes a copy of the room exactly where it is, lets its furniture and text fade, and
   zooms into it while it repaints itself as the first mood. On phones (the room isn't pinned
   there) the room is redrawn empty and the same zoom happens.
   Each mood is painted once into a cache (at low resolution, so it comes out soft like a wash);
   scrolling only cross-fades the caches, moves a few particles and re-lights the 3D lamp.
--------------------------------------------------------------------------- */
function mountRituals(host, o) {
    const THREE = o.THREE || null
    const MOODS = {
        morning: { L: "#E4DED2", R: "#F1ECE3", F: "#D3C8B4", out: "#E7E1D6", sky: "#FFFDF7", light: "255,247,228", shaft: 0.34, patch: 0.6, sun: { dx: -0.35, dz: 0.6 }, shadow: { x: -0.75, y: 0.35, a: 0.28, b: 0.55 }, lamp: "255,214,150", lampOn: 0.55, ink: "#2E2216", dark: false, motes: { n: 70, vy: -0.08, size: 1.6, col: "255,248,230", a: 0.55 } },
        afternoon: { L: "#D6A867", R: "#E4BC7C", F: "#B57D43", out: "#CFA060", sky: "#FFEBC0", light: "255,214,130", shaft: 0.42, patch: 0.85, sun: { dx: 0.15, dz: 1.25 }, shadow: { x: -0.45, y: 0.6, a: 0.34, b: 0.35 }, lamp: "255,200,130", lampOn: 0.4, ink: "#2E2216", dark: false, motes: { n: 30, vy: -0.02, size: 1.3, col: "255,240,200", a: 0.4 } },
        evening: { L: "#6E3A1D", R: "#8C4824", F: "#552A15", out: "#4A2614", sky: "#F59A52", light: "255,150,70", shaft: 0.32, patch: 0.7, sun: { dx: 0.9, dz: 0.42 }, shadow: { x: -1.2, y: 0.2, a: 0.4, b: 0.7 }, lamp: "255,150,60", lampOn: 0.95, ink: "#F7E7D4", dark: true, motes: { n: 45, vy: 0.05, size: 1.8, col: "255,170,90", a: 0.6 } },
        night: { L: "#241D2C", R: "#2B2236", F: "#1A1522", out: "#18131E", sky: "#2C3550", light: "160,180,230", shaft: 0.08, patch: 0.12, sun: { dx: -0.2, dz: 0.9 }, shadow: { x: -0.2, y: 0.3, a: 0.15, b: 0.6 }, lamp: "190,150,240", lampOn: 1, ink: "#F1E8F4", dark: true, motes: { n: 0 }, blobs: true },
    }
    Object.keys(o.copy || {}).forEach((k) => MOODS[k] && Object.assign(MOODS[k], o.copy[k]))
    const ROOM_NIGHT = { L: "#4A4036", R: "#433A31", F: "#3A3229", out: "#261E13", sky: "#3A3F48", light: "200,200,210", shaft: 0, patch: 0, sun: { dx: 0, dz: 1 }, shadow: { x: -0.3, y: 0.3, a: 0.2, b: 0.5 }, lamp: "255,214,150", lampOn: 0, ink: "#F4E9DC", dark: true, motes: { n: 0 } }
    const PG_DAY = "#D8CAB6" // the page's day colour
    const ROOM_DAY = { ...ROOM_NIGHT, L: "#E2D5C3", R: "#D9CBB7", F: "#C7B69C", out: PG_DAY, sky: "#DCE4EA", ink: "#2E2216", dark: false }
    const ROOM = o.mode === "light" ? ROOM_DAY : ROOM_NIGHT
    // through the day, saving the night (and its colour) for last; if a persona was chosen in the
    // room, the day starts at that persona's light and carries on round the clock
    const DAY = ["morning", "afternoon", "evening", "night"]
    const s0 = Math.max(0, DAY.indexOf(o.start))
    const ORDER = DAY.slice(s0).concat(DAY.slice(0, s0))
    const n = ORDER.length

    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
    const INTRO_VH = 90, OUTRO_VH = 200
    const totalScroll = INTRO_VH + n * o.vhPerState + OUTRO_VH
    host.innerHTML = `<section class="slx" style="height:calc(100vh + ${totalScroll}vh)">
  <div class="slx-pin">
    <div class="slx-room" aria-hidden="true"></div>
    <canvas aria-hidden="true"></canvas>
    <div class="slx-grain" aria-hidden="true"></div>
    <span class="slx-eb">${esc(o.eyebrow)}</span>
    <div class="slx-stmts">${ORDER.map((k, i) => `<div class="slx-stmt" data-i="${i}"><b>${esc(MOODS[k].line)}</b><span>${esc(MOODS[k].detail)}</span></div>`).join("")}</div>
    <div class="slx-track"><div class="slx-line"></div><div class="slx-fill"></div><div class="slx-labels">${ORDER.map((k, i) => `<span data-i="${i}">${esc(MOODS[k].label)}</span>`).join("")}</div></div>
  </div>
</section>`
    const sec = host.querySelector(".slx")
    // overlap the room's pinned screen exactly, so this section takes over the moment the room lets go
    const roomPin = o.handoff ? document.querySelector(".slr-host .slr-pin") : null
    const overlap = () => { if (roomPin) sec.style.marginTop = -roomPin.offsetHeight + "px" }
    overlap()
    if (o.still) sec.style.height = "900px"
    const pin = host.querySelector(".slx-pin"), cv = host.querySelector("canvas"), ctx = cv.getContext("2d")
    const roomBox = host.querySelector(".slx-room"), grain = host.querySelector(".slx-grain"), eb = host.querySelector(".slx-eb"), track = host.querySelector(".slx-track"), fill = host.querySelector(".slx-fill")
    const stmts = [...host.querySelectorAll(".slx-stmt")], labels = [...host.querySelectorAll(".slx-labels span")]

    let W = 0, H = 0, DPR = 1, caches = {}, portrait = false
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const hex = (h) => (h.startsWith("rgb") ? h.match(/[\d.]+/g).slice(0, 3).map(Number) : [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)))
    const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})` }

    // where the lamp hangs on the left wall (closer to the corner on phones, so it stays in frame)
    let LY = 2.4
    // (the same spot as the dreamer's lamp in the room, so that hand-over is seamless)
    const LZ = 4.2, K = 0.95
    /* camera: P(x,y,z) in room units (walls 10 wide, 7 high), isometric like section 02 */
    const proj = (c, x, y, z) => [c.ox + (x - y) * c.s * 0.866, c.oy + (x + y) * c.s * 0.5 + (7 - z) * c.s]
    const camEnd = () => (portrait ? { ox: W * 0.46, oy: -H * 0.035, s: W / 4.9 } : { ox: W * 0.4, oy: -H * 0.25, s: H / 8.4 })
    let camStart = () => (portrait ? { ox: W * 0.5, oy: H * 0.22, s: W / 19 } : { ox: W * 0.649, oy: H * 0.098, s: H * 0.0522 })

    /* ---------- painting ---------- */
    function paintPoly(g, pts, col, alpha, passes, jit) {
        for (let k = 0; k < passes; k++) {
            g.beginPath()
            pts.forEach(([x, y], i) => { const a = x + (rnd() - 0.5) * jit, b = y + (rnd() - 0.5) * jit; i ? g.lineTo(a, b) : g.moveTo(a, b) })
            g.closePath()
            g.globalAlpha = alpha
            g.fillStyle = col
            g.fill()
        }
        g.globalAlpha = 1
    }
    function streaks(g, quad, col, cnt, len, w, alpha) {
        g.save()
        g.beginPath()
        quad.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
        g.closePath()
        g.clip()
        const [a, b, c] = quad, ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1], ul = Math.hypot(ux, uy)
        g.lineCap = "round"
        g.strokeStyle = col
        for (let i = 0; i < cnt; i++) {
            const s = rnd(), t = rnd(), px = a[0] + ux * s + vx * t, py = a[1] + uy * s + vy * t, l = len * (0.5 + rnd())
            g.globalAlpha = alpha * (0.4 + rnd() * 0.6)
            g.lineWidth = w * (0.5 + rnd())
            g.beginPath()
            g.moveTo(px, py)
            g.lineTo(px + (ux / ul) * l, py + (uy / ul) * l)
            g.stroke()
        }
        g.restore()
        g.globalAlpha = 1
    }
    function hull(p) {
        p = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
        const cr = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0])
        const lo = [], up = []
        for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q) }
        for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q) }
        return lo.slice(0, -1).concat(up.slice(0, -1))
    }
    const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath() }
    function paintMood(g, w, h, c, m, detail, ext = 13, withLight = true) {
        const P = (x, y, z) => proj(c, x, y, z), j = c.s * 0.18, E = ext
        g.fillStyle = m.out
        g.fillRect(0, 0, w, h)
        const left = [P(0, E, 7), P(0, 0, 7), P(0, 0, 0), P(0, E, 0)], right = [P(0, 0, 7), P(E, 0, 7), P(E, 0, 0), P(0, 0, 0)], floor = [P(0, 0, 0), P(E, 0, 0), P(E, E, 0), P(0, E, 0)]
        paintPoly(g, left, m.L, 0.5, 4, j)
        paintPoly(g, right, m.R, 0.5, 4, j)
        paintPoly(g, floor, m.F, 0.5, 4, j)
        if (detail) {
            const st = m.dark ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.6)"
            streaks(g, [P(0, 13, 7), P(0, 0, 7), P(0, 0, 0)], st, 260, c.s * 1.2, c.s * 0.16, 0.12)
            streaks(g, [P(0, 0, 7), P(13, 0, 7), P(13, 0, 0)], st, 260, c.s * 1.2, c.s * 0.16, 0.12)
            streaks(g, [P(0, 0, 0), P(13, 0, 0), P(13, 13, 0)], m.dark ? "rgba(0,0,0,.45)" : "rgba(120,80,40,.4)", 260, c.s * 1.4, c.s * 0.18, 0.12)
        }
        // the window (where the room has it) and its frame
        const wq = [[2.8, 1.2], [6.9, 1.2], [6.9, 5.4], [2.8, 5.4]], win = wq.map(([x, z]) => P(x, 0, z))
        paintPoly(g, win, m.sky, 0.75, 3, j * 0.5)
        g.save()
        g.strokeStyle = m.dark ? "rgba(20,14,10,.75)" : "rgba(60,45,30,.35)"
        g.lineWidth = c.s * 0.16
        g.lineJoin = "round"
        poly(g, win)
        g.stroke()
        g.lineWidth = c.s * 0.08
        for (const x of [3.83, 4.85, 5.88]) { g.beginPath(); g.moveTo(...P(x, 0, 5.4)); g.lineTo(...P(x, 0, 1.2)); g.stroke() }
        g.beginPath(); g.moveTo(...P(2.8, 0, 3.3)); g.lineTo(...P(6.9, 0, 3.3)); g.stroke()
        g.restore()
        // the light it lets in: a shaft and a patch on the floor
        if (withLight) paintSun(g, c, m, floor)
        // the lamp's glow on the wall around it
        const lc = P(0.4, LY, LZ), R = c.s
        if (m.lampOn > 0) {
            const gr = g.createRadialGradient(lc[0], lc[1], 0, lc[0], lc[1], R * 4.2)
            gr.addColorStop(0, `rgba(${m.lamp},${0.55 * m.lampOn})`)
            gr.addColorStop(0.35, `rgba(${m.lamp},${0.2 * m.lampOn})`)
            gr.addColorStop(1, `rgba(${m.lamp},0)`)
            g.save()
            g.globalCompositeOperation = m.dark ? "lighter" : "source-over"
            g.fillStyle = gr
            g.fillRect(lc[0] - R * 5, lc[1] - R * 5, R * 10, R * 10)
            g.restore()
        }
        if (m.blobs)
            [[0, LY + 1.8, 5, "156,123,214", 2.6], [0, LY - 1.4, 3, "217,112,142", 2.2], [3, 6, 0, "79,163,165", 3], [1.5, 3, 0, "240,137,42", 1.8]].forEach(([x, y, z, col, r]) => {
                const p = P(x, y, z), gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], c.s * r * 1.6)
                gr.addColorStop(0, `rgba(${col},.45)`)
                gr.addColorStop(1, `rgba(${col},0)`)
                g.save()
                g.globalCompositeOperation = "lighter"
                g.fillStyle = gr
                g.fillRect(0, 0, w, h)
                g.restore()
            })
    }

    // the window's sunlight (a shaft and a patch on the floor, with the shadows of the bars)
    // between a light and a dark mood the sun is painted both ways (normal and additive), weighted,
    // so it never flips from one to the other mid-way
    function paintSun(g, c, m, floorPts) {
        const dk = m.dk == null ? (m.dark ? 1 : 0) : m.dk
        if (dk < 0.999) paintSunOp(g, c, m, floorPts, "source-over", 1 - dk, dk)
        if (dk > 0.001) paintSunOp(g, c, m, floorPts, "lighter", dk, dk)
    }
    function paintSunOp(g, c, m, floorPts, op, w, dk) {
        if (!(m.shaft > 0)) return
        const P = (x, y, z) => proj(c, x, y, z), j = c.s * 0.18
        const floor = floorPts || [P(0, 0, 0), P(13, 0, 0), P(13, 13, 0), P(0, 13, 0)]
        const wq = [[2.8, 1.2], [6.9, 1.2], [6.9, 5.4], [2.8, 5.4]], win = wq.map(([x, z]) => P(x, 0, z))
        const { dx, dz } = m.sun, flp = wq.map(([x, z]) => { const t = z / dz; return P(x + dx * t, Math.min(t, 13), 0) })
        const hp = hull(win.concat(flp)), cw = win.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]), cf = flp.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0])
        const gr = g.createLinearGradient(cw[0], cw[1], cf[0], cf[1])
        gr.addColorStop(0, `rgba(${m.light},${m.shaft})`)
        gr.addColorStop(1, `rgba(${m.light},${m.shaft * 0.25})`)
        g.save()
        g.globalCompositeOperation = op
        g.globalAlpha = w
        g.fillStyle = gr
        poly(g, hp)
        g.fill()
        g.restore()
        g.save()
        poly(g, floor)
        g.clip()
        g.globalCompositeOperation = op
        g.globalAlpha = (m.patch / 1.6) * w
        g.fillStyle = `rgb(${m.light})`
        poly(g, flp)
        g.fill()
        g.globalAlpha = 1
        g.globalCompositeOperation = "source-over"
        g.strokeStyle = `rgba(0,0,0,${(0.12 + 0.13 * dk) * w})`
        g.lineWidth = c.s * 0.12
        for (const x of [3.83, 4.85, 5.88]) { const ta = 5.4 / dz, tb = 1.2 / dz; g.beginPath(); g.moveTo(...P(x + dx * ta, ta, 0)); g.lineTo(...P(x + dx * tb, tb, 0)); g.stroke() }
        g.restore()
    }
    // the sun between two moods: its angle, colour and strength glide, so the patch travels across the floor
    let sunLo = null
    function liveSun(A, B, f, c) {
        const k = 0.3, w = Math.ceil(W * k), h = Math.ceil(H * k)
        if (!sunLo || sunLo.width !== w || sunLo.height !== h) { sunLo = document.createElement("canvas"); sunLo.width = w; sunLo.height = h }
        const g = sunLo.getContext("2d")
        g.clearRect(0, 0, w, h)
        const L = (a, b) => a + (b - a) * f, la = A.light.split(",").map(Number), lb = B.light.split(",").map(Number)
        // half-way between two moods the sun softens a little, like a cloud passing, so the change reads as light, not a cut
        const dip = 1 - 0.3 * Math.sin(Math.PI * f)
        const both = { sun: { dx: L(A.sun.dx, B.sun.dx), dz: L(A.sun.dz, B.sun.dz) }, light: la.map((v, i) => Math.round(v + (lb[i] - v) * f)).join(","), shaft: L(A.shaft, B.shaft) * dip, patch: L(A.patch, B.patch) * dip, dk: L(A.dark ? 1 : 0, B.dark ? 1 : 0) }
        paintSun(g, { ox: c.ox * k, oy: c.oy * k, s: c.s * k }, both)
        return sunLo
    }

    /* ---------- the lamp: the shop's 3D lamp, with an orthographic camera matching the room's
       isometric projection (room x,y,z → three y,x,z), so it sits on the wall in perspective ---------- */
    let L3 = null
    function lamp3() {
        if (L3 !== null) return L3
        L3 = false
        if (!THREE) return L3
        let ren
        try {
            THREE.ColorManagement.enabled = false
            ren = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
            ren.outputColorSpace = THREE.LinearSRGBColorSpace
        } catch (e) {
            return L3
        }
        ren.setClearColor(0, 0)
        const scene = new THREE.Scene(), HB = 1.45
        const cam = new THREE.OrthographicCamera(-HB, HB, HB, -HB, 0.1, 50)
        cam.up.set(0, 0, 1)
        const PR = [[.2, .05], [.172, .15], [.165, .27], [.178, .39], [.215, .5], [.29, .6], [.4, .69], [.54, .755], [.68, .78], [.81, .745], [.91, .655], [.97, .53], [1.0, .4], [.985, .27], [.93, .15], [.83, .07], [.68, .03], [.46, .02], [.29, .025], [.2, .05]]
        const pts = new THREE.SplineCurve(PR.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(140).map((v) => new THREE.Vector2(Math.max(0.12, v.x), v.y))
        const geo = new THREE.LatheGeometry(pts, 160)
        geo.computeVertexNormals()
        const U = { uTint: { value: new THREE.Color() }, uCore: { value: new THREE.Color() }, uRim: { value: new THREE.Color() }, uOn: { value: 0 }, uAmb: { value: 1 }, uAlpha: { value: 1 }, uShop: { value: 0 } }
        const glass = new THREE.ShaderMaterial({
            uniforms: U,
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: `varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
            fragmentShader: `uniform vec3 uTint;uniform vec3 uCore;uniform vec3 uRim;uniform float uOn;uniform float uAmb;uniform float uAlpha;uniform float uShop;varying vec3 vN;varying vec3 vP;
void main(){vec3 N=normalize(vN);vec3 V=vec3(0.,0.,1.);float fr=1.-max(dot(N,V),0.);
vec3 L1=normalize(vec3(-.55,.75,.6)),L2=normalize(vec3(.7,.1,.5));float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.);
vec3 off=uTint*(.84+.22*d1+.06*d2-.1*fr)*uAmb+vec3(1.)*pow(max(dot(N,normalize(L1+V)),0.),14.)*.12*uAmb;
vec3 glow=mix(uCore,uRim,smoothstep(.25,1.,fr));float r=length(vP.xz);glow*=mix(.85,1.04,smoothstep(.17,.45,r))*(.92+.14*d1);
vec3 S1=normalize(vec3(-.5,.8,.6));float s1=max(dot(N,S1),0.);
vec3 g2=mix(uCore,uRim,smoothstep(.25,1.,fr))*(1.-.25*smoothstep(0.,.9,fr));g2*=mix(.78,1.,smoothstep(.17,.45,r))*mix(1.,.9,smoothstep(.6,1.,r))*(.9+.16*s1);
g2+=vec3(1.)*pow(max(dot(N,normalize(S1+V)),0.),14.)*.08;glow=mix(glow,g2,uShop);
vec3 col=mix(off,glow,uOn);
vec3 Rf=reflect(-V,N);float Fr=.04+.96*pow(fr,5.);
float e=smoothstep(.45,.7,Rf.x)*smoothstep(-.55,.1,Rf.y)*(1.-smoothstep(.55,.9,Rf.y))+smoothstep(-.4,-.68,Rf.x)*smoothstep(-.35,.3,Rf.y)*(1.-smoothstep(.6,.95,Rf.y))*.65+smoothstep(.62,.92,Rf.y)*.75;
col+=(vec3(e)+.06)*mix(.18,1.,Fr)*.22*uShop+vec3(1.)*pow(max(dot(Rf,normalize(vec3(.45,.55,.7))),0.),160.)*.5*uShop;
gl_FragColor=vec4(col,uAlpha);}`,
        })
        const grp = new THREE.Group(), shade = new THREE.Mesh(geo, glass)
        // the same shape as a wire drawing: profile lines (meridians) and rings (parallels)
        const wv = []
        const prof = pts.filter((_, i) => i % 4 === 0).concat([pts[pts.length - 1]])
        for (let m = 0; m < 20; m++) {
            const a = (m / 20) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a)
            for (let i = 1; i < prof.length; i++) wv.push(prof[i - 1].x * ca, prof[i - 1].y, prof[i - 1].x * sa, prof[i].x * ca, prof[i].y, prof[i].x * sa)
        }
        pts.filter((_, i) => i % 9 === 0).forEach((p) => {
            for (let k = 0; k < 64; k++) {
                const a0 = (k / 64) * Math.PI * 2, a1 = ((k + 1) / 64) * Math.PI * 2
                wv.push(p.x * Math.cos(a0), p.y, p.x * Math.sin(a0), p.x * Math.cos(a1), p.y, p.x * Math.sin(a1))
            }
        })
        const wgeo = new THREE.BufferGeometry()
        wgeo.setAttribute("position", new THREE.Float32BufferAttribute(wv, 3))
        const wmat = new THREE.LineBasicMaterial({ color: 0xf4e9dc, transparent: true, opacity: 0, depthTest: false })
        const wire = new THREE.LineSegments(wgeo, wmat)
        wire.position.y = 0.04
        wire.renderOrder = 10 // drawn over the glass
        const plate = new THREE.Mesh(new THREE.LatheGeometry([[.22, 0], [.62, 0], [.64, .02], [.62, .04], [.22, .04], [.22, 0]].map(([r, y]) => new THREE.Vector2(r, y)), 96), new THREE.MeshBasicMaterial({ color: 0xd9d3c9 }))
        shade.position.y = 0.04
        grp.add(plate, shade, wire)
        grp.scale.setScalar(K)
        scene.add(grp)
        const col = (h) => new THREE.Color(h)
        // three poses: on the wall; a three-quarter view with its axis lying flat on screen (for the
        // technical drawing); facing you (as in the shop)
        const toCam = new THREE.Vector3(1, 1, 1).normalize(), right = new THREE.Vector3(1, -1, 0).normalize()
        const q0 = new THREE.Quaternion(), qFace = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), toCam)
        const qHold = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), right.clone().multiplyScalar(HOLD_COS).add(toCam.clone().multiplyScalar(HOLD_SIN)).normalize())
        const qTmp = new THREE.Quaternion()
        L3 = {
            HB,
            // on the wall (u = 0) → turned to face you (u = 1); the camera follows the lamp's centre
            place(a1 = 0, a2 = 0) {
                grp.position.set(LY, 0, LZ)
                qTmp.slerpQuaternions(q0, qHold, a1)
                grp.quaternion.slerpQuaternions(qTmp, qFace, a2)
                const T = new THREE.Vector3(0, 0.4 * K, 0).applyQuaternion(grp.quaternion).add(grp.position)
                cam.position.copy(T).add(new THREE.Vector3(10, 10, 10))
                cam.lookAt(T)
                this.T = T
            },
            // the lamp's axis on screen (for the dimension lines), per world unit
            axis() {
                const a = new THREE.Vector3(0, 1, 0).applyQuaternion(grp.quaternion), r = new THREE.Vector3(-1, 1, 0).normalize(), up = new THREE.Vector3(-1, -1, 2).normalize()
                return [a.dot(r), -a.dot(up)]
            },
            render(px, tint, core, rim, on, amb, alpha = 1, wireA = 0, wireCol = "#F4E9DC", shop = 0) {
                U.uShop.value = shop
                const s = Math.min(1024, Math.round(px))
                if (ren.domElement.width !== s) ren.setSize(s, s, false)
                U.uAlpha.value = alpha
                wmat.opacity = wireA
                wmat.color.copy(col(wireCol))
                wire.visible = wireA > 0.01
                U.uTint.value.copy(col(tint))
                U.uCore.value.copy(col(core))
                U.uRim.value.copy(col(rim))
                U.uOn.value = on
                U.uAmb.value = amb
                ren.render(scene, cam)
                return ren.domElement
            },
            // a circle of the lamp (radius r, at height y in its own profile) as the four anchors and
            // eight handles of a bezier path, projected onto the last rendered image (0..1 coordinates)
            bezierRing(r, y) {
                grp.updateMatrixWorld(true)
                cam.updateMatrixWorld()
                const P = (x, z) => { const v = new THREE.Vector3(x, y + 0.04, z).applyMatrix4(grp.matrixWorld).project(cam); return [(v.x + 1) / 2, (1 - v.y) / 2] }
                const k = 0.5523 * r, out = []
                for (let i = 0; i < 4; i++) {
                    const a = (i * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a)
                    out.push({ p: P(r * c, r * s), hin: P(r * c + k * s, r * s - k * c), hout: P(r * c - k * s, r * s + k * c) })
                }
                return out
            },
            dispose() {
                geo.dispose()
                glass.dispose()
                wgeo.dispose()
                wmat.dispose()
                ren.dispose()
            },
        }
        L3.place()
        return L3
    }
    function drawLamp(g, c, A, B, f, on, alpha = 1, from = null, t = 1) {
        const lerp = (a, b) => a + (b - a) * f
        const sh = { x: lerp(A.shadow.x, B.shadow.x), y: lerp(A.shadow.y, B.shadow.y), a: lerp(A.shadow.a, B.shadow.a), b: lerp(A.shadow.b, B.shadow.b) }
        const P = (x, y, z) => proj(c, x, y, z)
        const ring = (x, r) => { const pts = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; pts.push(P(x, LY + Math.cos(a) * r * K, LZ + Math.sin(a) * r * K)) } return pts }
        const path = (outer, inner) => { poly(g, outer); g.moveTo(...inner[0]); inner.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath() }
        const lamp = mix(`rgba(${A.lamp},1)`, `rgba(${B.lamp},1)`, f), dk = lerp(A.dark ? 1 : 0, B.dark ? 1 : 0)
        g.save()
        g.globalAlpha = alpha
        // the shadow it casts on the wall (away from the window), and a soft contact shadow
        const shK = from ? t * t : 1
        if (sh.a > 0.01 && shK > 0.01) {
            g.save()
            g.globalAlpha = alpha * shK
            g.translate(-W * 3, 0)
            g.shadowColor = `rgba(20,10,4,${sh.a * (1 - on * 0.7)})`
            g.shadowBlur = c.s * sh.b * 0.8
            g.shadowOffsetX = W * 3 + sh.x * c.s * 0.7
            g.shadowOffsetY = sh.y * c.s * 0.7
            path(ring(0.4, 1), ring(0.4, 0.2))
            g.fillStyle = "#000"
            g.fill("evenodd")
            g.restore()
        }
        g.save()
        g.globalAlpha = alpha * shK
        g.translate(-W * 3, 0)
        g.shadowColor = `rgba(20,10,4,${0.25 * (1 - on * 0.5)})`
        g.shadowBlur = c.s * 0.15
        g.shadowOffsetX = W * 3
        path(ring(0.05, 0.95), ring(0.05, 0.2))
        g.fillStyle = "#000"
        g.fill("evenodd")
        g.restore()
        const l3 = lamp3()
        if (l3) {
            let px = 2 * l3.HB * c.s * 1.2247, ctr = P(l3.T.y, l3.T.x, l3.T.z)
            // coming from where the lamp stood in the room: it glides to the wall and takes its size
            if (from) {
                // it lifts first, then glides across to the wall
                const e = ease(t), ey = 1 - Math.pow(1 - t, 3), ps = from.s / (K / l3.HB)
                ctr = [from.x + (ctr[0] - from.x) * e, from.y + (ctr[1] - from.y) * ey]
                px = ps + (px - ps) * e
            }
            const img = l3.render(px * Math.min(DPR, 2), "#EEEAE3", mix(lamp, "#FFFFFF", 0.6), mix(lamp, "#FFFFFF", 0.15), on, 1 - dk * 0.45)
            g.globalAlpha = alpha
            g.drawImage(img, ctr[0] - px / 2, ctr[1] - px / 2, px, px)
        } else {
            // no WebGL: a flat glass ring in the wall's plane
            path(ring(0.5, 1), ring(0.5, 0.2))
            g.fillStyle = mix("#EEEAE3", lamp, on * 0.85)
            g.fill("evenodd")
        }
        g.restore()
    }

    /* ---------- hand-over to the shop: the room dims into the page, the lamp leaves the wall,
       turns to face you and settles exactly where the shop's 3D lamp is ---------- */
    const SHOP_LAMP = { tint: "#ECE8E1", core: "#FFF4E4", rim: "#F0D3AE" }
    const HOLD_COS = 0.8, HOLD_SIN = 0.6
    function shopTarget(out) {
        const st = document.querySelector(".sls-stage"), sec2 = shopSec
        if (!st || !sec2) return { x: W * 0.3, y: H * 0.55, r: H * 0.2 }
        const a = st.getBoundingClientRect(), b = sec2.getBoundingClientRect(), pr = pin.getBoundingClientRect()
        // where the stage will be when the shop reaches the top (it is still sliding up underneath);
        // in the last moments the lamp rides along with the stage, so the cross-fade lines up
        const fin = a.top - b.top + a.height / 2, now = a.top - pr.top + a.height / 2
        return { x: a.left - pr.left + a.width / 2, y: fin + (now - fin) * cl((out - 0.86) / 0.08), r: a.height * 0.28 }
    }
    function outroLamp(c, M, on0, out, bgK) {
        // the room fades into the page colour
        ctx.save()
        ctx.globalAlpha = bgK
        ctx.fillStyle = o.mode === "light" ? PG_DAY : "#261E13"
        ctx.fillRect(0, 0, W, H)
        ctx.restore()
        // 1. off the wall to the middle, turning to a three-quarter view; 2. it pauses there as a wire
        // drawing with its dimensions; 3. it fills in again, turns to face you and lands on the shop
        const a1 = ease(cl((out - 0.04) / 0.26)), a2 = ease(cl((out - 0.64) / 0.24))
        // the wire drawing appears and stays: the lamp lands in the shop still half built
        const wv = ease(cl((out - 0.2) / 0.2))
        // as it reaches the card the drawing lines go and it settles into the shop's 3D lamp
        const wOut = ease(cl((out - 0.62) / 0.24))
        const l3 = lamp3()
        const P = (x, y, z) => proj(c, x, y, z)
        const start = P(0.4 * K, LY, LZ), rs = K * c.s * 1.2247, tg = shopTarget(out)
        const hx = W * (portrait ? 0.5 : 0.5), hy = H * (portrait ? 0.46 : 0.5), hr = Math.min(H * 0.27, W * (portrait ? 0.3 : 0.22))
        const x1 = start[0] + (hx - start[0]) * a1, y1 = start[1] + (hy - start[1]) * a1, r1 = rs + (hr - rs) * a1
        const cx = x1 + (tg.x - x1) * a2, cy = y1 + (tg.y - y1) * a2, r = r1 + (tg.r - r1) * a2
        const lampCol = `rgba(${M.lamp},1)`, u = 0.5 * a1 + 0.5 * a2
        // its glow, warming the space around it as the room goes
        const gr = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 3)
        gr.addColorStop(0, `rgba(255,226,185,${0.22 * bgK * (1 - 0.6 * wv)})`)
        gr.addColorStop(1, "rgba(255,226,185,0)")
        ctx.fillStyle = gr
        ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6)
        if (!l3) return
        l3.place(a1, a2)
        const ink = o.mode === "light" ? "#2E2216" : "#F4E9DC"
        const px = (2 * l3.HB * r) / K
        const img = l3.render(px * Math.min(DPR, 2), mix("#EEEAE3", SHOP_LAMP.tint, u), mix(mix(lampCol, "#FFFFFF", 0.6), SHOP_LAMP.core, u), mix(mix(lampCol, "#FFFFFF", 0.15), SHOP_LAMP.rim, u), on0 + (1 - on0) * u, 1, 1, 0, ink, a2)
        ctx.drawImage(img, cx - px / 2, cy - px / 2, px, px)
        // the design drawing: the lamp's outline as vector paths, anchors and handles, drawn over it
        if (wv > 0.01 && wOut < 0.99) vectorDrawing(l3, cx - px / 2, cy - px / 2, px, cl((out - 0.18) / 0.22), (1 - wOut) * Math.min(1, wv * 1.5), ink)
        if (wv > 0.02) dimensions(cx, cy, r, wv * (1 - a2), ink)
        l3.place(0, 0)
    }

    // the lamp as a designer draws it: bezier paths (outer rim, front face, hole) with their anchor
    // points and handles, traced on as you scroll
    const SEL = "#F0892A"
    function vectorDrawing(l3, x0, y0, px, prog, alpha, ink) {
        const rings = [[1.0, 0.4, true], [0.62, 0.77, false], [0.165, 0.27, true]]
        const M = ([u, v]) => [x0 + u * px, y0 + v * px]
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.lineCap = "round"
        rings.forEach(([rr, yy, anchors], ri) => {
            const B = l3.bezierRing(rr, yy)
            // the path, traced progressively (each ring a little after the previous one)
            const t = cl(prog * 1.25 - ri * 0.12)
            if (t <= 0) return
            const pts = []
            for (let i = 0; i < 4; i++) {
                const a = B[i], b = B[(i + 1) % 4], p0 = M(a.p), p1 = M(a.hout), p2 = M(b.hin), p3 = M(b.p)
                for (let k = 0; k <= 24; k++) {
                    const s = k / 24, q = 1 - s
                    pts.push([q * q * q * p0[0] + 3 * q * q * s * p1[0] + 3 * q * s * s * p2[0] + s * s * s * p3[0], q * q * q * p0[1] + 3 * q * q * s * p1[1] + 3 * q * s * s * p2[1] + s * s * s * p3[1]])
                }
            }
            const n = Math.max(2, Math.round(pts.length * t))
            ctx.strokeStyle = SEL
            ctx.lineWidth = ri === 1 ? 1 : 1.4
            ctx.setLineDash(ri === 1 ? [4, 5] : [])
            ctx.beginPath()
            pts.slice(0, n).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
            ctx.stroke()
            ctx.setLineDash([])
            if (!anchors) return
            B.forEach((a, i) => {
                const at = cl((t - i * 0.25) / 0.12)
                if (at <= 0) return
                const [ax, ay] = M(a.p)
                ctx.globalAlpha = alpha * at
                // handles: thin lines to small round ends
                ctx.strokeStyle = ink
                ctx.lineWidth = 0.8
                for (const h of [a.hin, a.hout]) {
                    const [hx, hy] = M(h), ex = ax + (hx - ax) * at, ey = ay + (hy - ay) * at
                    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke()
                    ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, 7); ctx.fillStyle = SEL; ctx.fill()
                }
                // the anchor: a small square
                ctx.fillStyle = o.mode === "light" ? "#F4EDE2" : "#261E13"
                ctx.strokeStyle = SEL
                ctx.lineWidth = 1.2
                ctx.fillRect(ax - 3.5, ay - 3.5, 7, 7)
                ctx.strokeRect(ax - 3.5, ay - 3.5, 7, 7)
                ctx.globalAlpha = alpha
            })
        })
        ctx.restore()
    }

    // the technical drawing's dimensions (lamp seen three-quarter, its axis pointing right):
    // Ø 30 cm across, 12 cm deep, Ø 6 cm hole
    function dimensions(cx, cy, r, a, ink) {
        const tick = (x, y, vertical) => { if (vertical) { ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5) } else { ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y) } }
        const back = cx - 0.4 * r * HOLD_COS, front = cx + 0.42 * r * HOLD_COS, left = cx - r * (HOLD_SIN + 0.4 * HOLD_COS)
        ctx.save()
        ctx.globalAlpha = a * 0.85
        ctx.strokeStyle = ink
        ctx.fillStyle = ink
        ctx.lineWidth = 1
        ctx.font = "400 12px Outfit, ui-sans-serif, system-ui, sans-serif"
        ctx.textBaseline = "middle"
        // across (vertical, to the left)
        const x0 = left - 30
        ctx.beginPath()
        ctx.setLineDash([3, 4])
        ctx.moveTo(cx - 0.4 * r * HOLD_COS, cy - r); ctx.lineTo(x0 - 6, cy - r)
        ctx.moveTo(cx - 0.4 * r * HOLD_COS, cy + r); ctx.lineTo(x0 - 6, cy + r)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(x0, cy - r); ctx.lineTo(x0, cy + r)
        tick(x0, cy - r, false); tick(x0, cy + r, false)
        ctx.stroke()
        ctx.save()
        ctx.translate(x0 - 14, cy)
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = "center"
        ctx.fillText("Ø 30 cm", 0, 0)
        ctx.restore()
        // deep (horizontal, underneath)
        const y0 = cy + r + 30
        ctx.beginPath()
        ctx.setLineDash([3, 4])
        ctx.moveTo(back, cy + r * 0.6); ctx.lineTo(back, y0 + 6)
        ctx.moveTo(front, cy + r * 0.6); ctx.lineTo(front, y0 + 6)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(back, y0); ctx.lineTo(front, y0)
        tick(back, y0, true); tick(front, y0, true)
        ctx.stroke()
        ctx.textAlign = "center"
        ctx.fillText("12 cm", (back + front) / 2, y0 + 18)
        // the hole (on the front face, right of centre)
        const hx = cx + 0.36 * r * HOLD_COS, h1 = [hx + r * 0.55, cy - r * 0.78]
        ctx.beginPath()
        ctx.moveTo(hx, cy); ctx.lineTo(...h1); ctx.lineTo(h1[0] + 26, h1[1])
        ctx.stroke()
        ctx.beginPath(); ctx.arc(hx, cy, 2, 0, 7); ctx.fill()
        ctx.textAlign = "left"
        ctx.fillText("Ø 6 cm", h1[0] + 32, h1[1])
        ctx.restore()
    }

    /* the room's sketch guides, in the same seeded hand */
    function guides(g, c, ink, alpha) {
        const P = (x, y, z) => proj(c, x, y, z)
        const L = [[[-4.5, 10, 0], [15.5, 10, 0]], [[10, -4.5, 0], [10, 15.5, 0]], [[-3.5, 0, 0], [14, 0, 0]], [[0, -3.5, 0], [0, 14, 0]], [[-3, 0, 7], [13, 0, 7]], [[0, -3, 7], [0, 13, 7]], [[10, 0, -4.5], [10, 0, 11.5]], [[0, 10, -4.5], [0, 10, 11.5]], [[0, 0, -3], [0, 0, 10]]]
        let sd = 7
        const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647)
        g.save()
        g.lineCap = "round"
        L.forEach(([a, b]) => {
            const A = P(...a), B = P(...b)
            for (let pass = 0; pass < 2; pass++) {
                const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len
                const a0 = pass ? 0.1 + r() * 0.15 : 0, a1 = pass ? 0.75 + r() * 0.2 : 1
                g.globalAlpha = alpha * (pass ? 0.5 : 1)
                g.lineWidth = pass ? 0.9 : 1.1
                g.beginPath()
                for (let k = 0; k <= 10; k++) {
                    const t = a0 + ((a1 - a0) * k) / 10, w = (r() - 0.5) * (pass ? 4 : 3.2)
                    const x = A[0] + dx * t + nx * w + (pass ? 1.2 : 0), y = A[1] + dy * t + ny * w + (pass ? 1.4 : 0)
                    k ? g.lineTo(x, y) : g.moveTo(x, y)
                }
                const gr = g.createLinearGradient(A[0], A[1], B[0], B[1])
                gr.addColorStop(0, "rgba(0,0,0,0)")
                gr.addColorStop(0.22, ink)
                gr.addColorStop(0.78, ink)
                gr.addColorStop(1, "rgba(0,0,0,0)")
                g.strokeStyle = gr
                g.stroke()
            }
        })
        g.restore()
    }

    /* low-res wash → full-size cache */
    const LO = 0.34
    function bake(m, c) {
        const w = Math.ceil(W * LO), h = Math.ceil(H * LO), lo = document.createElement("canvas")
        lo.width = w
        lo.height = h
        paintMood(lo.getContext("2d"), w, h, { ox: c.ox * LO, oy: c.oy * LO, s: c.s * LO }, m, true, 13, false)
        const full = document.createElement("canvas")
        full.width = W
        full.height = H
        const g = full.getContext("2d")
        g.imageSmoothingQuality = "high"
        g.drawImage(lo, 0, 0, W, H)
        return full
    }
    let liveLo = null
    function live(m, c, ext) {
        const w = Math.ceil(W * 0.25), h = Math.ceil(H * 0.25)
        if (!liveLo || liveLo.width !== w || liveLo.height !== h) { liveLo = document.createElement("canvas"); liveLo.width = w; liveLo.height = h }
        const g = liveLo.getContext("2d")
        g.clearRect(0, 0, w, h)
        paintMood(g, w, h, { ox: c.ox * 0.25, oy: c.oy * 0.25, s: c.s * 0.25 }, m, false, ext)
        return liveLo
    }

    /* ---------- the hand-off from the room (desktop): a copy of the room, exactly where it was ---------- */
    let clone = null, cloneSvg = null, clonePaint = null, fade = [], cloneCam = null, fadeLamp = [], roomLamp = null
    const roomHost = o.handoff ? document.querySelector(".slr-host") : null
    function makeClone(ritTop) {
        const src = roomHost && roomHost.querySelector(".slr")
        if (!src) return false
        const r = src.getBoundingClientRect()
        clone = src.cloneNode(true)
        clone.querySelectorAll("[id]").forEach((e) => e.setAttribute("data-id", e.id))
        // keep the room's own inline variables (its look and day/night blend), add the placement
        clone.style.cssText += `;position:absolute;left:${r.left}px;top:${r.top - ritTop}px;width:${r.width}px;height:${r.height}px;margin:0;min-height:0;pointer-events:none`
        roomBox.innerHTML = ""
        roomBox.style.display = ""
        roomBox.appendChild(clone)
        cloneSvg = clone.querySelector("svg")
        // the painted layer: walls, floor and window are plain shapes in it and stay; its groups
        // are the furniture and go, with the lamp, its light and the touch areas
        const wall = cloneSvg.querySelector("polygon.wA")
        clonePaint = cloneSvg.querySelector('g[filter*="slr-paint"]') || (wall && wall.parentNode)
        fade = []
        if (clonePaint) [...clonePaint.children].forEach((e) => { if (e.tagName.toLowerCase() === "g" && !e.getAttribute("clip-path")) fade.push(e) })
        cloneSvg.querySelectorAll('[id="slr-anim"],[id="slr-selBox"],.hot').forEach((e) => fade.push(e))
        cloneSvg.querySelectorAll('[id="slr-shaft"]').forEach((e) => fade.push(e))
        // the persona's lamp and its light stay until the 3D lamp takes over from the same spot
        fadeLamp = [...cloneSvg.querySelectorAll('[id="slr-lamp"],[id="slr-glow"],[id="slr-pool"],[id="slr-maskLamp"]')]
        fadeLamp.forEach((e) => (e._o = parseFloat(getComputedStyle(e).opacity) || 0))
        roomLamp = cloneSvg.querySelector('[id="slr-lamp"]')
        if (roomLamp && (roomLamp.classList.contains("off") || roomLamp._o < 0.3)) roomLamp = null
        clone.querySelectorAll(".spots,.slr-text,.card").forEach((e) => fade.push(e))
        // remember how visible each one was (some are hidden by the room's own classes)
        fade.forEach((e) => (e._o = parseFloat(getComputedStyle(e).opacity) || 0))
        // the room's corner (its P(0,0,7)) on screen, from the svg's viewBox (168 14 864 812, centred)
        const sr = cloneSvg.getBoundingClientRect(), pr = pin.getBoundingClientRect(), k = Math.min(sr.width / 864, sr.height / 812)
        const sx = sr.left - pr.left, sy = sr.top - pr.top, padX = (sr.width - 864 * k) / 2, padY = (sr.height - 812 * k) / 2
        // the whole copy is scaled (not just its drawing), so the room's blend layers keep their backdrop
        const cr = clone.getBoundingClientRect()
        cloneCam = { ox: sx + padX + (600 - 168) * k, oy: sy + padY + (28 - 14) * k, s: 46 * k, sx: cr.left - pr.left, sy: cr.top - pr.top }
        clone.style.transformOrigin = "0 0"
        return true
    }

    const shopSec = o.still ? null : document.querySelector(".sls")
    function size() {
        W = pin.clientWidth || window.innerWidth
        H = pin.clientHeight || window.innerHeight
        // the shop slides under this section's last screen: when it lets go, the shop is already in place
        if (shopSec) { shopSec.style.marginTop = -H + "px"; shopSec.style.position = "relative" }
        portrait = W < 700 && H > W
        LY = portrait ? 1.4 : 2.4
        if (L3) L3.place()
        DPR = Math.min(window.devicePixelRatio || 1, 2)
        cv.width = Math.round(W * DPR)
        cv.height = Math.round(H * DPR)
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
        const c = camEnd()
        caches = {}
        ORDER.forEach((k) => (caches[k] = bake(MOODS[k], c)))
        clone = null
        draw(performance.now())
    }

    /* particles: dust in the morning light, embers in the evening */
    const motes = Array.from({ length: 80 }, () => ({ x: rnd(), y: rnd(), r: rnd(), ph: rnd() * 6.28 }))
    let t0 = performance.now()
    function particles(now, m, w) {
        if (!m.motes || !m.motes.n || w <= 0.01) return
        const mo = m.motes, t = (now - t0) / 1000
        ctx.save()
        if (m.dark) ctx.globalCompositeOperation = "lighter"
        ctx.fillStyle = `rgb(${mo.col})`
        for (let k = 0; k < mo.n; k++) {
            const d = motes[k]
            let y = (d.y + mo.vy * t * (0.5 + d.r)) % 1
            if (y < 0) y += 1
            const x = d.x + Math.sin(t * 0.3 + d.ph) * 0.01
            ctx.globalAlpha = w * mo.a * (0.3 + 0.7 * Math.sin(t * 0.8 + d.ph) ** 2)
            ctx.beginPath()
            ctx.arc(W * (0.45 + x * 0.5), H * (0.15 + y * 0.75), mo.size * (0.5 + d.r), 0, 7)
            ctx.fill()
        }
        ctx.restore()
    }
    function setInk(A, B, f) {
        const dark = (f < 0.5 ? A : B).dark
        sec.style.setProperty("--ink", mix(A.ink, B.ink, f))
        sec.style.setProperty("--muted", dark ? "rgba(244,233,220,.66)" : "rgba(46,34,22,.62)")
        sec.style.setProperty("--line", dark ? "rgba(244,233,220,.22)" : "rgba(46,34,22,.2)")
    }

    /* ---------- scroll → state ---------- */
    let prog = 0, active = false, shown = -2, wasLanded = false
    function read() {
        const r = sec.getBoundingClientRect(), len = r.height - H
        active = r.top <= 0.5
        prog = cl(-r.top / len)
        return r.top
    }
    function draw(now) {
        const ritTop = read()
        const INTRO = INTRO_VH / totalScroll, OUTRO = OUTRO_VH / totalScroll, p = prog
        // overlapping the room (desktop): invisible until the room's last screen hands over
        pin.style.visibility = o.handoff && !active ? "hidden" : "visible"
        if (o.handoff && !active && clone) { clone = null; roomBox.innerHTML = "" }
        const empty = cl(p / (INTRO * 0.3)), intro = ease(cl((p - INTRO * 0.3) / (INTRO * 0.7)))
        // the last mood holds as long as the others before the hand-over begins
        const q = Math.min(n - 1, cl((p - INTRO) / (1 - INTRO - OUTRO)) * (n - 0.65))
        const out = o.still ? 0 : cl((p - (1 - OUTRO)) / OUTRO)
        // the light changes all the way through (no holds), softly eased at each end
        const i = Math.min(n - 2, Math.floor(q)), qf = cl(q - i), f = qf * qf * (3 - 2 * qf)
        const A = MOODS[ORDER[i]], B = MOODS[ORDER[i + 1]], cur = f < 0.5 ? i : i + 1
        ctx.clearRect(0, 0, W, H)
        const first = MOODS[ORDER[0]]
        if (intro < 1 && !o.still) {
            if (o.handoff && active && !clone) makeClone(ritTop)
            const cs = clone ? cloneCam : camStart(), ce = camEnd()
            const c = { ox: cs.ox + (ce.ox - cs.ox) * intro, oy: cs.oy + (ce.oy - cs.oy) * intro, s: cs.s + (ce.s - cs.s) * intro }
            // the painted mood (and its grain) starts as soon as the room begins to empty
            const k = cl((intro + empty * 0.12) / 0.55), ext = 10 + 3 * intro
            // the persona's lamp travels with the whole hand-over, starting as the furniture fades
            const lampT = cl(p / (INTRO * 0.82))
            if (clone) {
                // 1. the room as it was: furniture and text fade away; 2. it grows to fill the screen
                roomBox.style.display = ""
                fade.forEach((e) => (e.style.opacity = String(e._o * (1 - empty))))
                // the persona's lamp never stays behind on empty furniture: as the room empties the 3D
                // lamp takes its place (a quick cross-fade) and rises to the wall
                const lk = roomLamp ? 1 - cl(lampT / 0.12) : 1 - empty
                fadeLamp.forEach((e) => (e.style.opacity = String(e._o * lk)))
                const z = c.s / cs.s
                clone.style.transform = `translate(${c.ox - cs.sx - (cs.ox - cs.sx) * z}px,${c.oy - cs.sy - (cs.oy - cs.sy) * z}px) scale(${z})`
                // the paint filter is too heavy to scale; the canvas takes over by then
                if (clonePaint && clonePaint.hasAttribute("filter") && z > 1.08) clonePaint.removeAttribute("filter")
            } else {
                roomBox.style.display = "none"
                ctx.drawImage(live(ROOM, c, ext), 0, 0, W, H)
            }
            // 3. on the way in it repaints itself as the first mood
            if (k > 0) {
                ctx.globalAlpha = k
                ctx.drawImage(live(first, c, ext), 0, 0, W, H)
                ctx.globalAlpha = 1
                guides(ctx, c, mix(ROOM.ink, first.ink, k), 0.3 * k)
            } else if (!clone) guides(ctx, c, ROOM.ink, 0.3)
            let from = null
            if (clone && roomLamp) {
                const r = roomLamp.getBoundingClientRect(), pr = pin.getBoundingClientRect()
                if (r.width > 2) from = { x: r.left - pr.left + r.width / 2, y: r.top - pr.top + r.height / 2, s: Math.max(r.width, r.height) }
            }
            // lit as it was in the room, settling to the first mood's light
            if (from) drawLamp(ctx, c, first, first, 0, 1 + (first.lampOn - 1) * k, cl(lampT / 0.12), from, lampT)
            else if (k > 0) drawLamp(ctx, c, first, first, 0, first.lampOn * k, k)
            setInk(ROOM, first, k)
            eb.style.opacity = String(k)
            track.style.opacity = String(k)
            grain.style.opacity = String(0.22 * (clone ? Math.max(k, empty) : 1))
        } else {
            roomBox.style.display = "none"
            const c = camEnd()
            ctx.drawImage(caches[ORDER[i]], 0, 0, W, H)
            if (f > 0) { ctx.globalAlpha = f; ctx.drawImage(caches[ORDER[i + 1]], 0, 0, W, H); ctx.globalAlpha = 1 }
            ctx.drawImage(liveSun(A, B, f, c), 0, 0, W, H)
            particles(now, A, 1 - f)
            particles(now, B, f)
            const bgK = ease(cl(out / 0.28))
            guides(ctx, c, mix(A.ink, B.ink, f), 0.18 * (1 - bgK))
            setInk(A, B, f)
            const on = A.lampOn * (1 - f) + B.lampOn * f
            if (out <= 0) drawLamp(ctx, c, A, B, f, on)
            else outroLamp(c, B, on, out, bgK)
            eb.style.opacity = String(1 - bgK)
            track.style.opacity = String(1 - bgK)
            // the painted grain stays on the lamp until it settles into the shop
            // (some of it stays to the very end: the shop's lamp picks up the same grain and lets it go)
            grain.style.opacity = String(0.22 * (out > 0 ? 1 - 0.6 * ease(cl((out - 0.6) / 0.3)) : 1))
        }
        // the very end: this screen fades away over the shop, which is already in place below
        pin.style.opacity = String(1 - ease(cl((out - 0.9) / 0.1)))
        // tell the shop when the lamp has landed, so its own 3D lamp carries on building itself
        const landed = !o.still && out > 0.9
        if (landed !== wasLanded) {
            wasLanded = landed
            window.dispatchEvent(new CustomEvent("silena-lamp-landed", { detail: landed }))
        }
        const showI = o.still ? 0 : intro < 0.85 || out > 0.06 ? -1 : cur
        if (showI !== shown) {
            shown = showI
            stmts.forEach((e) => e.classList.toggle("on", +e.dataset.i === showI))
            labels.forEach((e) => e.classList.toggle("on", +e.dataset.i === showI))
        }
        fill.style.width = (o.still ? 0 : cl((p - INTRO) / (1 - INTRO - OUTRO)) * 100).toFixed(2) + "%"
    }

    let raf = 0, visible = true, lastW = 0, lastH = 0
    const loop = (now) => { raf = 0; draw(now); if (visible && !o.still) raf = requestAnimationFrame(loop) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop) }, { rootMargin: "100px 0px" })
    io.observe(sec)
    let rt = 0
    const onResize = () => {
        clearTimeout(rt)
        rt = setTimeout(() => {
            // phones resize the viewport as the address bar comes and goes: only repaint on real changes
            const w = pin.clientWidth, h = pin.clientHeight
            if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 120) return
            lastW = w
            lastH = h
            overlap()
            size()
        }, 150)
    }
    window.addEventListener("resize", onResize)
    lastW = pin.clientWidth
    lastH = pin.clientHeight
    size()

    // grain
    {
        const gn = 180, gc = document.createElement("canvas")
        gc.width = gc.height = gn
        const gx = gc.getContext("2d"), d = gx.createImageData(gn, gn)
        for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
        gx.putImageData(d, 0, 0)
        host.querySelector(".slx-grain").style.backgroundImage = `url(${gc.toDataURL()})`
    }
    return () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        window.removeEventListener("resize", onResize)
        L3 && L3.dispose && L3.dispose()
        host.innerHTML = ""
    }
}

function useSilenaMode(): Mode {
    const [mode, setMode] = useState<Mode>("dark")
    useEffect(() => {
        if (typeof document === "undefined") return
        const read = () => startTransition(() => setMode(document.body.getAttribute("data-framer-theme") === "light" ? "light" : "dark"))
        read()
        window.addEventListener("silena-theme", read)
        const obs = new MutationObserver(read)
        obs.observe(document.body, { attributes: true, attributeFilter: ["data-framer-theme"] })
        return () => {
            window.removeEventListener("silena-theme", read)
            obs.disconnect()
        }
    }, [])
    return mode
}

/**
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SilenaLightRituals(props) {
    const {
        eyebrow = "03 — Light Rituals",
        morningLine = "Soft light for slow mornings.",
        morningDetail = "Morning · 3000K honey white",
        morningLabel = "Morning",
        afternoonLine = "A steady warmth that stays in the background.",
        afternoonDetail = "Afternoon · 2700K warm white",
        afternoonLabel = "Afternoon",
        eveningLine = "Amber, low, unhurried. The day folds in.",
        eveningDetail = "Evening · 2200K candle glow",
        eveningLabel = "Evening",
        nightLine = "When the night asks for colour, it answers.",
        nightDetail = "Night · full colour spectrum",
        nightLabel = "Night",
        vhPerState = 90,
    } = props
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const mode = useSilenaMode()
    const ref = useRef<HTMLDivElement>(null)
    // the persona last chosen in the room picks the light the day starts with
    const [start, setStart] = useState("morning")
    useEffect(() => {
        const MOOD = { host: "morning", storyteller: "afternoon", reader: "evening", dreamer: "night" }
        const onPersona = (e) => {
            const m = MOOD[e.detail]
            if (!m) return
            // only while this section is still ahead (it rebuilds itself)
            const sec = ref.current && ref.current.querySelector(".slx")
            if (sec && sec.getBoundingClientRect().top <= 1) return
            startTransition(() => setStart(m))
        }
        window.addEventListener("silena-persona", onPersona)
        return () => window.removeEventListener("silena-persona", onPersona)
    }, [])
    const key = [eyebrow, morningLine, morningDetail, morningLabel, afternoonLine, afternoonDetail, afternoonLabel, eveningLine, eveningDetail, eveningLabel, nightLine, nightDetail, nightLabel, vhPerState, mode, start].join("|")

    useEffect(() => {
        const host = ref.current
        if (!host) return
        let alive = true, stop = () => {}
        const go = (THREE) => {
            if (!alive) return
            try {
                stop = mountRituals(host, {
                    THREE,
                    mode,
                    start,
                    eyebrow,
                    vhPerState,
                    still: isCanvas,
                    // hand over from the room only where the room is pinned (wider than 860px)
                    handoff: !isCanvas && window.innerWidth > 860 && !!document.querySelector(".slr-host"),
                    copy: {
                        morning: { line: morningLine, detail: morningDetail, label: morningLabel },
                        afternoon: { line: afternoonLine, detail: afternoonDetail, label: afternoonLabel },
                        evening: { line: eveningLine, detail: eveningDetail, label: eveningLabel },
                        night: { line: nightLine, detail: nightDetail, label: nightLabel },
                    },
                })
            } catch (e) {
                console.error("SilenaLightRituals", e)
            }
        }
        if (isCanvas) go(null)
        else loadThree().then(go).catch(() => go(null))
        return () => {
            alive = false
            stop()
        }
    }, [key])

    const pg = mode === "light" ? "#D8CAB6" : "#261E13"
    return (
        <div style={{ ...props.style, width: "100%", position: "relative", ["--pg" as any]: pg } as CSSProperties}>
            <style>{CSS}</style>
            <div ref={ref} />
        </div>
    )
}

addPropertyControls(SilenaLightRituals, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "03 — Light Rituals" },
    morningLine: { type: ControlType.String, title: "Morning", defaultValue: "Soft light for slow mornings." },
    morningDetail: { type: ControlType.String, title: "Morning · detail", defaultValue: "Morning · 3000K honey white" },
    morningLabel: { type: ControlType.String, title: "Morning · label", defaultValue: "Morning" },
    afternoonLine: { type: ControlType.String, title: "Afternoon", defaultValue: "A steady warmth that stays in the background." },
    afternoonDetail: { type: ControlType.String, title: "Afternoon · detail", defaultValue: "Afternoon · 2700K warm white" },
    afternoonLabel: { type: ControlType.String, title: "Afternoon · label", defaultValue: "Afternoon" },
    eveningLine: { type: ControlType.String, title: "Evening", defaultValue: "Amber, low, unhurried. The day folds in." },
    eveningDetail: { type: ControlType.String, title: "Evening · detail", defaultValue: "Evening · 2200K candle glow" },
    eveningLabel: { type: ControlType.String, title: "Evening · label", defaultValue: "Evening" },
    nightLine: { type: ControlType.String, title: "Night", defaultValue: "When the night asks for colour, it answers." },
    nightDetail: { type: ControlType.String, title: "Night · detail", defaultValue: "Night · full colour spectrum" },
    nightLabel: { type: ControlType.String, title: "Night · label", defaultValue: "Night" },
    vhPerState: { type: ControlType.Number, title: "Scroll per mood", min: 40, max: 200, step: 5, unit: "vh", defaultValue: 90 },
})
