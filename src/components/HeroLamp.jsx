// The lamp leaves the hero photo: as you scroll, a 3D lamp takes over from the one in the picture
// (same place, same size, same amber glass), lifts off and floats into 01 Feel, where it hangs in
// the middle, turning gently, and switches on as the words light up. Into the room it hands over
// with light: its glow floods the screen and settles, and the room is there.
import { useEffect, useRef } from "react"
import { loadThree, makeRealLamp } from "./SilenaLamp3D.tsx"

// where the lamp is in the hero photo (both photos share the framing): centre and radius,
// as fractions of the image width/height
const PHOTO = { aspect: 1280 / 832, u: 0.403, v: 0.214, r: 0.06 }
// the amber of the photo: deeper and more saturated than the shop's swatch
const PHOTO_GLASS = { tint: "#E2742A", core: "#FFB04A", rim: "#D85A12" }
const LAMP_FILL = 0.28 // the lamp's radius as a fraction of its canvas (camera fov 24, distance 8.4)
const S = 760 // canvas size in CSS px (scaled with a transform)
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export default function HeroLamp() {
    const cv = useRef(null)
    const washRef = useRef(null)
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        let alive = true, lamp = null, raf = 0
        loadThree().then((THREE) => {
            if (!alive || !cv.current) return
            lamp = makeRealLamp(THREE, cv.current, { mount: "wall", drag: false, cable: false, paint: 1, on: 0, onSpeed: 0.08, ratio: Math.min(window.devicePixelRatio || 1, 1.5) })
            lamp.colors(PHOTO_GLASS)
        })
        const el = cv.current
        const tick = () => {
            raf = requestAnimationFrame(tick)
            const hero = document.querySelector(".hero"), feel = document.getElementById("feel")
            if (!hero || !feel) return
            const W = window.innerWidth, H = window.innerHeight
            const hr = hero.getBoundingClientRect(), fr = feel.getBoundingClientRect()
            // 1. the lamp in the photo, wherever the photo is right now (object-fit: cover)
            const phone = W <= 640, posX = phone ? 0.3 : 0.5, posY = phone ? 1 : 0.3
            const dw = Math.max(hr.width, hr.height * PHOTO.aspect), dh = dw / PHOTO.aspect
            const px = hr.left + (hr.width - dw) * posX + PHOTO.u * dw, py = hr.top + (hr.height - dh) * posY + PHOTO.v * dh, pr = PHOTO.r * dw
            // 2. its place in 01 Feel: low in the middle, like a sun below the words, rising a little
            // as they light up (never behind the text, so it stays readable)
            const tr = Math.min(H * 0.19, W * (phone ? 0.26 : 0.15))
            const tx = W * 0.5, ty = H + tr * 0.25 - tr * 0.55 * ease(cl((-fr.top / Math.max(1, fr.height - H) - 0.05) / 0.45))
            // progress: h through the hero leaving, f through the pinned Feel section
            const h = cl(-hr.top / Math.max(1, hr.height)), f = cl(-fr.top / Math.max(1, fr.height - H))
            const lift = ease(cl((h - 0.12) / 0.88))
            let x = px + (tx - px) * lift, y = py + (ty - py) * (1 - Math.pow(1 - lift, 2)), r = pr + (tr - pr) * lift
            // it appears exactly over the photo's lamp, then leaves the picture behind
            let alpha = cl((h - 0.02) / 0.1)
            // 3. into the room, with light rather than movement: the lamp brightens and its glow opens
            // up until it floods the screen, then settles back and leaves the room, already drawing
            // itself, in the warm light it left behind
            let wash = 0, wr = 0
            const host = document.querySelector(".slr-host")
            if (host) {
                const ht = host.getBoundingClientRect().top
                const m = cl((H - ht) / (H * 1.1))
                if (m > 0) {
                    wash = 0.85 * Math.sin(Math.PI * cl(m / 0.75))
                    wr = tr * 1.5 + Math.hypot(W, H) * 1.1 * ease(cl(m / 0.45))
                    alpha *= 1 - ease(cl((m - 0.15) / 0.25))
                    y -= tr * 0.25 * ease(cl(m / 0.4))
                }
            }
            const wl = washRef.current
            if (wl) {
                wl.style.opacity = wash.toFixed(3)
                wl.style.visibility = wash > 0.002 ? "visible" : "hidden"
                wl.style.background = `radial-gradient(circle ${Math.round(wr)}px at ${x.toFixed(0)}px ${y.toFixed(0)}px, rgba(255,226,180,.9) 0%, rgba(255,176,96,.55) 28%, rgba(240,137,42,.18) 60%, rgba(240,137,42,0) 100%)`
            }
            el.style.opacity = alpha.toFixed(3)
            el.style.visibility = alpha > 0.002 ? "visible" : "hidden"
            if (lamp) lamp.pause(alpha <= 0.002)
            const k = r / (S * LAMP_FILL)
            el.style.transform = `translate(${(x - (S * k) / 2).toFixed(1)}px,${(y - (S * k) / 2).toFixed(1)}px) scale(${k.toFixed(4)})`
            // lit as in the photo, dims a little on the way, then warms up again with the words
            if (lamp) lamp.power(h < 0.5 ? 1 - 0.6 * cl(h / 0.5) : 0.4 + 0.6 * cl((f - 0.05) / 0.4) + wash)
        }
        raf = requestAnimationFrame(tick)
        return () => {
            alive = false
            cancelAnimationFrame(raf)
            lamp?.dispose()
        }
    }, [])
    return (
        <>
            <canvas ref={cv} className="hero-lamp" width={S} height={S} aria-hidden="true" style={{ width: S, height: S }} />
            <div ref={washRef} className="light-wash" aria-hidden="true" />
        </>
    )
}
