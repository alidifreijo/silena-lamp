// @ts-nocheck
/* ---------- Silena — the lamp in 3D, as it really is ----------
   A puffy ring of opal glass with a hole through the middle (≈ Ø 6 cm), on a thin white back
   plate with its cable. Built by turning a profile (lathe). Shading: glass lit from inside,
   warmer at the rims, a soft studio light, a contact shadow and a soft halo on the surface.
   Shared by the shop, Light Rituals and the bag thumbnails (no component here). */
let THREE_P = null
// three.js is loaded on demand (its own chunk), the first time a lamp is drawn
export const loadThree = () => (THREE_P ||= import("three"))

function buildLamp(THREE) {
    const P = [[.2, .05], [.172, .15], [.165, .27], [.178, .39], [.215, .5], [.29, .6], [.4, .69], [.54, .755], [.68, .78], [.81, .745], [.91, .655], [.97, .53], [1.0, .4], [.985, .27], [.93, .15], [.83, .07], [.68, .03], [.46, .02], [.29, .025], [.2, .05]]
    const curve = new THREE.SplineCurve(P.map(([r, y]) => new THREE.Vector2(r, y)))
    const pts = curve.getPoints(120).map((v) => new THREE.Vector2(Math.max(0.12, v.x), v.y))
    const geo = new THREE.LatheGeometry(pts, 180)
    geo.computeVertexNormals()
    geo.translate(0, -0.4, 0)
    const U = { uTint: { value: new THREE.Color() }, uCore: { value: new THREE.Color() }, uRim: { value: new THREE.Color() }, uOn: { value: 1 }, uAlpha: { value: 1 }, uPaint: { value: 0 }, uGlass: { value: 0 } }
    // glass, not plastic: little diffuse shading; the glass's colour and depth (milky in the middle,
    // denser at the thick rim), glossy reflections of a soft studio (two tall softboxes and a top
    // light) that get stronger at grazing angles, and a sharp glint. Lit from inside, the glow takes
    // over and the reflections soften. uPaint adds the illustration's grain and a softer, warmer tone.
    const glass = new THREE.ShaderMaterial({
        uniforms: U,
        side: THREE.DoubleSide,
        transparent: true,
        vertexShader: `varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vP=position;gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `uniform vec3 uTint;uniform vec3 uCore;uniform vec3 uRim;uniform float uOn;uniform float uAlpha;uniform float uPaint;uniform float uGlass;varying vec3 vN;varying vec3 vV;varying vec3 vP;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 N=normalize(vN),V=normalize(vV);if(!gl_FrontFacing)N=-N;float ndv=max(dot(N,V),0.);float fr=1.-ndv;
float F=.04+.96*pow(fr,5.);vec3 R=reflect(-V,N);
float sb1=smoothstep(.2,.8,R.x)*smoothstep(-.7,.2,R.y)*(1.-smoothstep(.45,1.,R.y));
float sb2=smoothstep(-.15,-.8,R.x)*smoothstep(-.5,.4,R.y)*(1.-smoothstep(.5,1.,R.y))*.6;
float tp=smoothstep(.45,1.,R.y)*.6;
vec3 env=vec3(1.,.99,.97)*(sb1+sb2+tp)+vec3(.07,.06,.05);
vec3 L1=normalize(vec3(-.5,.8,.6));float d1=max(dot(N,L1),0.);
float r=length(vP.xz);float thick=smoothstep(.25,1.,fr)*(1.-.55*min(uPaint,1.));
vec3 off=uTint*(.7+.12*d1)*mix(1.,.62,thick)+uTint*uTint*.16*(1.-thick)+vec3(1.)*pow(fr,2.5)*.1;
vec3 glow=mix(uCore,uRim,smoothstep(.25,1.,fr))*(1.-.22*thick);
glow*=mix(.78,1.,smoothstep(.17,.45,r))*mix(1.,.9,smoothstep(.6,1.,r))*(.94+.08*d1);
vec3 col=mix(off,glow,uOn);
float gl=clamp(1.-uPaint,0.,1.);
col+=env*mix(.08,.46,F)*mix(.4,.18,uOn)*gl;
col+=vec3(1.)*pow(max(dot(R,normalize(vec3(.45,.55,.7))),0.),36.)*mix(.2,.12,uOn)*gl*gl;
col+=vec3(1.)*pow(max(dot(R,normalize(vec3(-.6,.3,.75))),0.),18.)*.07*gl;
float g=h(floor(gl_FragCoord.xy/(1.+2.*uPaint)));
col=mix(col,col*vec3(1.03,.98,.9)*.94+.025,uPaint*.6);
col+=(g-.5)*(.02+.06*uPaint);
// translucent glass (as the SILENA letters): the faces towards you let what is behind through,
// the thick rim stays denser, and a warm light glows from the middle
col+=mix(uCore,vec3(1.,.55,.15),.35)*uGlass*.12*(1.-smoothstep(.1,1.,r))*(.4+.6*uOn);
gl_FragColor=vec4(col,uAlpha*(1.-uGlass*.24*(1.-smoothstep(.2,1.,fr))));}`,
    })
    const shade = new THREE.Mesh(geo, glass)
    // the same shape as a wire drawing (profile lines and rings), for when the lamp is still "being built"
    const wv = []
    const prof = pts.filter((_, i) => i % 3 === 0).concat([pts[pts.length - 1]])
    for (let m = 0; m < 20; m++) {
        const a = (m / 20) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a)
        for (let i = 1; i < prof.length; i++) wv.push(prof[i - 1].x * ca, prof[i - 1].y - 0.4, prof[i - 1].x * sa, prof[i].x * ca, prof[i].y - 0.4, prof[i].x * sa)
    }
    pts.filter((_, i) => i % 7 === 0).forEach((p) => {
        for (let k = 0; k < 64; k++) {
            const a0 = (k / 64) * Math.PI * 2, a1 = ((k + 1) / 64) * Math.PI * 2
            wv.push(p.x * Math.cos(a0), p.y - 0.4, p.x * Math.sin(a0), p.x * Math.cos(a1), p.y - 0.4, p.x * Math.sin(a1))
        }
    })
    const wgeo = new THREE.BufferGeometry()
    wgeo.setAttribute("position", new THREE.Float32BufferAttribute(wv, 3))
    const wireM = new THREE.LineBasicMaterial({ color: 0xf4e9dc, transparent: true, opacity: 0, depthTest: false })
    const wire = new THREE.LineSegments(wgeo, wireM)
    wire.visible = false
    wire.renderOrder = 2
    const base = new THREE.Mesh(
        new THREE.LatheGeometry([[.22, .035], [.6, .035], [.64, 0], [.62, -.035], [.22, -.035], [.22, .035]].map(([r, y]) => new THREE.Vector2(r, y)), 96),
        new THREE.MeshBasicMaterial({ color: 0xe8e4dd, side: THREE.DoubleSide })
    )
    base.position.y = -0.43
    const baseShade = new THREE.Mesh(new THREE.CylinderGeometry(0.641, 0.641, 0.02, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0xbdb6ab }))
    baseShade.position.y = -0.465
    // the cable leaves the back plate and runs along the surface, out of frame
    const cableCurve = new THREE.CatmullRomCurve3([[.05, -.43, .5], [.12, -.455, .66], [.22, -.47, .85], [.42, -.47, 1.25], [.46, -.47, 1.8], [.3, -.47, 2.5], [.38, -.47, 3.4], [.6, -.47, 4.6]].map((a) => new THREE.Vector3(a[0], a[1], a[2])))
    const cableM = new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec3 vN;void main(){float d=max(dot(normalize(vN),normalize(vec3(-.4,.7,.6))),0.);gl_FragColor=vec4(vec3(.93,.91,.88)*(.55+.5*d),1.);}`,
    })
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 160, 0.022, 12, false), cableM)
    const lampG = new THREE.Group()
    lampG.add(shade, base, baseShade, cable, wire)
    const tex = (stops) => {
        const c = document.createElement("canvas")
        c.width = c.height = 256
        const g = c.getContext("2d"), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
        stops.forEach(([o, col]) => gr.addColorStop(o, col))
        g.fillStyle = gr
        g.fillRect(0, 0, 256, 256)
        return new THREE.CanvasTexture(c)
    }
    const shadowM = new THREE.MeshBasicMaterial({ map: tex(Array.from({ length: 13 }, (_, i) => { const o = i / 12; return [o, `rgba(20,10,4,${(0.36 * Math.exp(-o * o * 3.2) * (1 - o)).toFixed(3)})`] })), transparent: true, depthWrite: false })
    // a wide, very soft glow (gaussian falloff)
    const haloM = new THREE.MeshBasicMaterial({
        map: tex(Array.from({ length: 13 }, (_, i) => { const o = i / 12; return [o, `rgba(255,255,255,${(0.42 * Math.exp(-o * o * 4.2) * (1 - o)).toFixed(3)})`] })),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    const surf = new THREE.Group()
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7), shadowM)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -0.47
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), haloM)
    halo.rotation.x = -Math.PI / 2
    halo.position.y = -0.48
    surf.add(halo, shadow)
    const rig = new THREE.Group()
    rig.add(surf, lampG)
    const col = (h) => new THREE.Color(h)
    return {
        rig, U, haloM, cable,
        // 0 = a wire drawing over faint glass, 1 = the finished lamp
        build(t, ink) {
            U.uAlpha.value = 0.38 + 0.62 * t
            wireM.opacity = 0.9 * (1 - t)
            if (ink) wireM.color.copy(col(ink))
            wire.visible = t < 0.995
        },
        paint(v) {
            U.uPaint.value = v
        },
        glass(v) {
            U.uGlass.value = v
            // see-through: only the faces towards you, so the back of the ring does not streak through
            glass.side = v > 0 ? THREE.FrontSide : THREE.DoubleSide
            glass.needsUpdate = true
            // the mounting plate behind would show through as a hard disc
            base.visible = baseShade.visible = !(v > 0)
        },
        colors(f) {
            U.uTint.value.copy(col(f.tint))
            U.uCore.value.copy(col(f.core))
            U.uRim.value.copy(col(f.rim))
            haloM.color.copy(col(f.core))
        },
        dispose() {
            rig.traverse((o) => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.() })
        },
    }
}

const POSE = { wall: { x: Math.PI / 2 - 0.02 }, table: { x: 0.42 } }
function renderer(THREE, cv, opts) {
    THREE.ColorManagement.enabled = false
    const ren = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: !!opts.keep })
    ren.outputColorSpace = THREE.LinearSRGBColorSpace
    ren.setPixelRatio(opts.ratio || Math.min(window.devicePixelRatio || 1, 2))
    ren.setClearColor(0, 0)
    return ren
}

/** The interactive lamp: drag to turn it all the way round (on the wall like an object in your
 *  hand, on a table like on a turntable), wall/table poses, glass colours, on/off. */
export function makeRealLamp(THREE, cv: HTMLCanvasElement, opts: any = {}) {
    const ren = renderer(THREE, cv, opts)
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(opts.fov || 24, 1, 0.1, 60)
    cam.position.set(0, 0, opts.dist || 8.4)
    const L = buildLamp(THREE)
    if (opts.cable === false) L.cable.visible = false
    if (opts.paint) L.paint(opts.paint)
    if (opts.glass) L.glass(opts.glass)
    scene.add(L.rig)
    const rig = L.rig
    let target = POSE[opts.mount || "wall"], cur = { ...target }, yaw = 0, yawT = 0, base0 = 0, amp = 1, vel = 0, tilt = 0, tiltT = 0
    let on = opts.on == null ? 1 : opts.on, onT = on, drag = null, raf = 0, visible = true, t0 = performance.now()
    // build: how finished the lamp looks (see buildLamp().build), animated over time
    let held = false
    let bld = opts.build == null ? 1 : opts.build, bA = bld, bB = bld, bT0 = 0, bDur = 1, ink = opts.ink
    L.build(bld, ink)
    const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0)
    function draw() {
        rig.rotation.set(cur.x, 0, 0)
        const w = Math.min(1, Math.max(0, (POSE.wall.x - cur.x) / (POSE.wall.x - POSE.table.x)))
        rig.rotateY(yaw * w)
        rig.rotateOnWorldAxis(X, tilt)
        rig.rotateOnWorldAxis(Y, yaw * (1 - w))
        L.U.uOn.value = on
        L.haloM.opacity = on * 0.9
        ren.render(scene, cam)
    }
    function size() {
        // the canvas's own size (a CSS transform on it doesn't change its resolution)
        const r = { width: cv.clientWidth, height: cv.clientHeight }
        if (!r.width) return
        ren.setSize(r.width, r.height, false)
        cam.aspect = r.width / r.height
        cam.updateProjectionMatrix()
        draw()
    }
    function loop(t) {
        raf = 0
        cur.x += (target.x - cur.x) * 0.08
        if (!drag) {
            base0 += vel
            vel *= 0.95
            amp = held ? 0 : Math.min(1, amp + 0.004)
            yawT = opts.sway === false ? base0 : base0 + Math.sin((t - t0) / 2600) * 0.32 * amp
        }
        yaw += (yawT - yaw) * (drag ? 0.25 : 0.06)
        tilt += (tiltT - tilt) * 0.12
        on += (onT - on) * (opts.onSpeed || 0.05)
        if (bld !== bB) {
            const k = Math.min(1, (t - bT0) / bDur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
            bld = k >= 1 ? bB : bA + (bB - bA) * e
            L.build(bld, ink)
        }
        draw()
        if (visible) raf = requestAnimationFrame(loop)
    }
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(loop) }
    const down = (e) => {
        drag = { x: e.clientX, y: e.clientY, yaw: yawT, tilt: tiltT, lx: e.clientX, v: 0, mouse: e.pointerType === "mouse" }
        vel = 0
        cv.setPointerCapture(e.pointerId)
        kick()
    }
    const move = (e) => {
        if (!drag) return
        yawT = drag.yaw + (e.clientX - drag.x) * 0.011
        drag.v = (e.clientX - drag.lx) * 0.011
        drag.lx = e.clientX
        if (drag.mouse) tiltT = Math.max(-0.7, Math.min(0.7, drag.tilt + (e.clientY - drag.y) * 0.006))
        kick()
    }
    // let go: it keeps turning a little, then the gentle sway starts again from where it stopped
    const up = () => {
        if (!drag) return
        vel = drag.v * 0.6
        base0 = yawT
        amp = 0
        t0 = performance.now()
        tiltT = 0
        drag = null
    }
    if (opts.drag !== false) {
        cv.addEventListener("pointerdown", down)
        cv.addEventListener("pointermove", move)
        cv.addEventListener("pointerup", up)
        cv.addEventListener("pointercancel", up)
    }
    let paused = false
    const io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting && !paused
        if (visible) kick()
    })
    io.observe(cv)
    window.addEventListener("resize", size)
    size()
    kick()
    return {
        colors(f) { L.colors(f); draw() },
        mount(m) { target = POSE[m] || POSE.wall; base0 = Math.round(base0 / (2 * Math.PI)) * 2 * Math.PI; vel = 0; kick() },
        power(v) { onT = v; kick() },
        // how much of the illustration's grain and tone it carries (0 = clean glass)
        paint(v) { L.paint(v); draw() },
        // stop drawing while it is hidden (and start again)
        pause(p) { if (p === paused) return; paused = p; visible = !p; if (!p) kick() },
        // keep it still, facing you (while another lamp is landing on top of it)
        hold() { base0 = 0; vel = 0; amp = 0; yawT = 0; yaw = 0; tiltT = 0; held = true; kick() },
        // let it move again: the gentle sway eases in from where it is
        release() { held = false; amp = 0; t0 = performance.now(); kick() },
        // go from the wire drawing to the finished lamp (or back), over ms milliseconds
        build(v, ms = 0, inkColor) {
            if (inkColor) ink = inkColor
            if (!ms) { bld = bA = bB = v; L.build(v, ink); draw(); return }
            bA = bld; bB = v; bT0 = performance.now(); bDur = ms; kick()
        },
        dispose() {
            cancelAnimationFrame(raf)
            io.disconnect()
            window.removeEventListener("resize", size)
            cv.removeEventListener("pointerdown", down)
            cv.removeEventListener("pointermove", move)
            cv.removeEventListener("pointerup", up)
            cv.removeEventListener("pointercancel", up)
            L.dispose()
            ren.dispose()
        },
    }
}

/* ---------- bag thumbnails: the same lamp, three-quarter view, rendered once per glass ---------- */
const THUMBS = new Map<string, Promise<string>>()
let thumbKit = null
async function makeKit() {
    const THREE = await loadThree()
    const cv = document.createElement("canvas")
    const ren = renderer(THREE, cv, { keep: true, ratio: 2 })
    ren.setSize(176, 176, false)
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 60)
    cam.position.set(0, 0, 5.3)
    const L = buildLamp(THREE)
    L.cable.visible = false
    L.rig.rotation.set(0.95, 0, 0)
    L.rig.rotateY(-0.5)
    L.U.uOn.value = 1
    L.haloM.opacity = 0.5
    scene.add(L.rig)
    return {
        shot(f) {
            L.colors(f)
            ren.render(scene, cam)
            return cv.toDataURL("image/png")
        },
    }
}
export function lampThumb(f): Promise<string> {
    if (!THUMBS.has(f.id))
        THUMBS.set(f.id, (async () => {
            thumbKit ||= makeKit()
            return (await thumbKit).shot(f)
        })())
    return THUMBS.get(f.id)
}
