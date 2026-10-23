// Silena — a concept product site for a wall and table lamp (based on IKEA VARMBLIXT).
// 00 Hero · 01 Feel · 02 The place to be · 03 Light Rituals · 04 Make it yours
import { useEffect } from "react"
import Lenis from "lenis"
import Nav from "./components/Nav.jsx"
import Hero from "./components/Hero.jsx"
import SilenaManifesto from "./components/SilenaManifesto.tsx"
import SilenaRoom from "./components/SilenaRoom.tsx"
import SilenaLightRituals from "./components/SilenaLightRituals.tsx"
import SilenaShop from "./components/SilenaShop.tsx"

// the room's personas, as written for the site
const ROOM = {
    readerLight: "<b>Amber</b> · lying on the side table",
    storyLight: "<b>Warm white</b> · on the wall, among the pictures",
    hostLight: "<b>Honey white</b> · lying in the middle of the table",
    dreamerLight: "<b>Lavender</b> · on the wall, above the record player",
}

export default function App() {
    // smooth scrolling; the room pauses it for a moment once it is built
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
        window.__lenis = lenis
        let raf = 0
        const tick = (t) => {
            lenis.raf(t)
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        // pause: drop any glide still pending, so nothing jumps when it lets go
        const lock = () => {
            lenis.scrollTo(window.scrollY, { immediate: true, force: true })
            lenis.stop()
        }
        const unlock = () => {
            lenis.scrollTo(window.scrollY, { immediate: true, force: true })
            lenis.start()
        }
        window.addEventListener("silena-scroll-lock", lock)
        window.addEventListener("silena-scroll-unlock", unlock)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("silena-scroll-lock", lock)
            window.removeEventListener("silena-scroll-unlock", unlock)
            lenis.destroy()
            window.__lenis = null
        }
    }, [])

    return (
        <div className="page">
            <Nav />
            <Hero />
            <SilenaManifesto />
            <div id="place" className="process">
                <SilenaRoom {...ROOM} />
            </div>
            <SilenaLightRituals />
            <SilenaShop />
        </div>
    )
}
