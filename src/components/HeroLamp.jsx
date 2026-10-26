// The lamp leaves the hero photo: as you scroll, a 3D lamp takes over from the one in the picture
// (same place, same size, same amber glass), lifts off and floats into 01 Feel, where it hangs in
// the middle, turning gently, and switches on as the words light up. It bows out with the images.
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
            const tr = Math.min(H * 0.24, W * (phone ? 0.3 : 0.18))
            const tx = W * 0.5, ty = H + tr * 0.25 - tr * 0.55 * ease(cl((-fr.top / Math.max(1, fr.height - H) - 0.05) / 0.45))
            // progress: h through the hero leaving, f through the pinned Feel section
            const h = cl(-hr.top / Math.max(1, hr.height)), f = cl(-fr.top / Math.max(1, fr.height - H))
            const lift = ease(cl((h - 0.12) / 0.88))
            let x = px + (tx - px) * lift, y = py + (ty - py) * (1 - Math.pow(1 - lift, 2)), r = pr + (tr - pr) * lift
            // it appears exactly over the photo's lamp, then leaves the picture behind
            let alpha = cl((h - 0.02) / 0.1)
            // at the end of Feel it goes back to being a small light, and fades out with the images
            const bow = ease(cl((f - 0.84) / 0.14))
            r *= 1 - 0.35 * bow
            y -= H * 0.08 * bow
            alpha *= 1 - bow
            if (fr.bottom < 0) alpha = 0
            el.style.opacity = alpha.toFixed(3)
            el.style.visibility = alpha > 0.002 ? "visible" : "hidden"
            if (lamp) lamp.pause(alpha <= 0.002)
            const k = r / (S * LAMP_FILL)
            el.style.transform = `translate(${(x - (S * k) / 2).toFixed(1)}px,${(y - (S * k) / 2).toFixed(1)}px) scale(${k.toFixed(4)})`
            // lit as in the photo, dims a little on the way, then warms up again with the words
            if (lamp) lamp.power(h < 0.5 ? 1 - 0.6 * cl(h / 0.5) : 0.4 + 0.6 * cl((f - 0.05) / 0.4))
        }
        raf = requestAnimationFrame(tick)
        return () => {
            alive = false
            cancelAnimationFrame(raf)
            lamp?.dispose()
        }
    }, [])
    return <canvas ref={cv} className="hero-lamp" width={S} height={S} aria-hidden="true" style={{ width: S, height: S }} />
}
