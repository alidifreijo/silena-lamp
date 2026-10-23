// @ts-nocheck
// Silena room engine: drawing, layout, look and behaviour. Used by SilenaRoom.tsx.
// Everything that moves (vinyl, steam, sound waves, fairy lights) lives outside the painted
// (filtered) layer so the texture is computed once; animations pause when off screen.
export const CSS = ".slr{position:relative;width:100%;min-height:100vh;box-sizing:border-box;background:var(--bg);color:var(--ink);font-family:'Outfit',ui-sans-serif,system-ui,sans-serif;font-weight:300;transition:background .9s ease,color .9s ease;display:flex;align-items:center}\n.slr *{box-sizing:border-box}\n.slr .slr-wrap{width:100%;max-width:1680px;margin:0 auto;padding:76px 40px 20px;display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:24px;align-items:center}\n.slr.paused *{animation-play-state:paused!important}\n@media (max-width:860px){.slr .slr-wrap{grid-template-columns:1fr;gap:12px;padding:80px 20px 56px}}\n.slr .slr-h{font-weight:200;font-size:clamp(34px,4.4vw,52px);line-height:1.04;letter-spacing:-.02em;margin:0 0 22px;text-wrap:balance}\n.slr p{margin:0}\n.slr [hidden]{display:none!important}\n@property --lamp{ syntax: '<color>'; inherits: true; initial-value: #FFE3B3; }\n@property --acc{ syntax: '<color>'; inherits: true; initial-value: #C99A5B; }\n.slr{\n  --bg:var(--bgN,#16110C); --ink:#EADCC6; --line:rgba(234,220,198,.62); --muted:rgba(234,220,198,.55);\n  --fT:#2B231A; --fL:#211A13; --fR:#1A140F; --wallA:#1F1912; --wallB:#241D15; --floor:#1B150F;\n  --leaf:#3A4030; --dog:#5A4532;\n  --sun:rgba(150,172,222,calc(.20*var(--sunK,1))); --shaft:rgba(150,175,225,calc(.12*var(--sunK,1)));\n  --dark:#120A05; --darkA:var(--darkN,.68); --glowA:var(--glowN,.2);\n  --font:'Outfit', ui-sans-serif, system-ui, sans-serif;\n  color-scheme:dark;\n}\n.slr[data-mode=\"day\"]{\n  --bg:var(--bgD,#D8CFC2); --ink:#2E2216; --line:rgba(46,34,22,.78); --muted:rgba(46,34,22,.62);\n  --fT:#FBF7F0; --fL:#EFE6D7; --fR:#E2D5C1; --wallA:#F3ECE0; --wallB:#E9DFCF; --floor:#F7F1E7;\n  --leaf:#C4C7AE; --dog:#D9B48A;\n  --sun:rgba(255,224,170,calc(.42*var(--sunK,1))); --shaft:rgba(255,226,180,calc(.26*var(--sunK,1)));\n  --dark:#2E2216; --darkA:0; --glowA:var(--glowD,.28);\n  color-scheme:light;\n}\n.slr .eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 18px}\n.slr .lead{font-size:16px;line-height:1.55;color:var(--muted);margin:0;max-width:30ch;transition:opacity .5s}\n.slr .card{margin-top:28px;min-height:150px;transition:opacity .9s ease,transform 1.1s cubic-bezier(.22,.61,.36,1)}\n.slr .card.hide{opacity:0;transform:translateY(6px);transition-duration:.45s}\n.slr .card .n{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:300;margin:0 0 10px}\n.slr .card .dot{width:9px;height:9px;border-radius:50%;background:var(--acc);box-shadow:0 0 14px 3px var(--acc)}\n.slr .card .l{font-size:16px;line-height:1.55;margin:0 0 14px;max-width:32ch;text-wrap:pretty}\n.slr .card .r{font-size:13px;letter-spacing:.06em;color:var(--muted)}\n.slr .card .r b{font-weight:400;color:var(--ink)}\n.slr .tools{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-top:22px}\n.slr .btn{all:unset;cursor:pointer;font-size:13px;color:var(--muted);letter-spacing:.04em;padding:6px 2px;display:flex;align-items:center;gap:10px}\n.slr .btn:hover{color:var(--ink)}\n.slr .btn:focus-visible{outline:1px solid var(--line);outline-offset:4px;border-radius:6px}\n.slr .track{width:44px;height:24px;border-radius:20px;border:1px solid var(--line);position:relative}\n.slr .knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--ink);transition:transform .5s cubic-bezier(.6,.1,.2,1)}\n.slr[data-mode=\"day\"] .knob{transform:translateX(20px)}\n.slr .stage{position:relative;min-width:0}\n.slr svg{display:block;width:100%;height:auto;max-height:calc(100vh - 96px);overflow:hidden;background:var(--bg);transition:background .9s ease}\n.slr svg{--m:#F1E8D6}\n.slr{--c-wood:#BC8659;--c-walnut:#7E5337;--c-cream:#F2E9D7;--c-olive:#6E7C4A;--c-green:#3F6044;--c-red:#D45B42;--c-mustard:#E2AE45;--c-blue:#5C87B3;--c-ink:#2E2A26;--c-terra:#C7744E;--c-pink:#E8B6A8;--c-glass:#C9DAD5;--c-leaf:#456142;--c-wallA:#E2D9CC;--c-wallB:#D3C9BB;--c-floor:#EAE2D6;--hiT:84%;--shR:80%;--round:4.2px}\n.slr .m-wood{--m:var(--c-wood)}\n.slr .m-walnut{--m:var(--c-walnut)}\n.slr .m-cream{--m:var(--c-cream)}\n.slr .m-olive{--m:var(--c-olive)}\n.slr .m-green{--m:var(--c-green)}\n.slr .m-red{--m:var(--c-red)}\n.slr .m-mustard{--m:var(--c-mustard)}\n.slr .m-blue{--m:var(--c-blue)}\n.slr .m-ink{--m:var(--c-ink)}\n.slr .m-terra{--m:var(--c-terra)}\n.slr .m-pink{--m:var(--c-pink)}\n.slr .m-glass{--m:var(--c-glass)}\n.slr .m-slab{--m:#C9BCAA}\n.slr .sofa-one{display:none}\n.slr.sofa-back-one .sofa-one{display:inline}\n.slr.sofa-back-one .sofa-two{display:none}\n.slr .a{--m:var(--acc)}\n.slr .fT,.slr .fL,.slr .fR{stroke-width:var(--round);stroke-linejoin:round;transition:fill .9s,stroke .9s}\n.slr .fT{fill:color-mix(in srgb,var(--m) var(--hiT),#fff);stroke:color-mix(in srgb,var(--m) var(--hiT),#fff)}\n.slr .fL{fill:var(--m);stroke:var(--m)}\n.slr .fR{fill:color-mix(in srgb,var(--m) var(--shR),#2a1c12);stroke:color-mix(in srgb,var(--m) var(--shR),#2a1c12)}\n.slr .q{stroke-width:3}\n.slr .puff.fT,.slr .puff.fL,.slr .puff.fR{stroke-width:11}\n.slr .lampSide{fill:color-mix(in srgb,var(--lamp) 62%,#8a6a50);stroke:none}\n.slr .q.fT{fill:color-mix(in srgb,var(--m) 66%,#fff);stroke:color-mix(in srgb,var(--m) 66%,#fff)}\n.slr .q.fR{fill:color-mix(in srgb,var(--m) 90%,#fff);stroke:color-mix(in srgb,var(--m) 90%,#fff);stroke-width:7}\n.slr .wA{fill:var(--c-wallA)}\n.slr .wB{fill:var(--c-wallB)}\n.slr .floor{fill:var(--c-floor)}\n.slr .wA,.slr .wB,.slr .floor{stroke:none}\n.slr .stem{fill:none;stroke:#3C5538;stroke-width:1.8;stroke-linecap:round}\n.slr .rib{fill:none;stroke:rgba(255,255,255,.18);stroke-width:1.2}\n.slr .fx{fill:#4A3A2E;stroke:none}\n.slr .ln{fill:none;stroke:rgba(52,38,28,.4);stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}\n.slr .mul{fill:none;stroke:#2E2A26;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}\n.slr .mul.thin{stroke-width:1.6}\n.slr .tuft{stroke:rgba(30,40,20,.32);stroke-width:1.3;stroke-linecap:round}\n.slr .art{stroke-width:4;stroke-linecap:round}\n.slr .art.r{stroke:#D45B42}\n.slr .art.k{stroke:#2E2A26}\n.slr .art.y{stroke:#E2AE45}\n.slr .art.b{stroke:#5C87B3}\n.slr .spk{fill:#4a443e;stroke:none}\n.slr .ink{fill:#2A2420;stroke:none}\n.slr .leaf{fill:var(--c-leaf);stroke:none}\n.slr .leaf2{fill:color-mix(in srgb,var(--c-leaf) 78%,#c8d6a0);stroke:none}\n.slr .dash{stroke-dasharray:3 6}\n.slr .rug{fill:color-mix(in srgb,var(--acc) 24%,#EBDCCB);stroke:color-mix(in srgb,var(--acc) 24%,#EBDCCB);stroke-width:16;stroke-linejoin:round}\n.slr .rug.base{fill:#E3D6C6;stroke:none}\n.slr .chk{fill:color-mix(in srgb,var(--acc) 48%,#EBDCCB);stroke:none}\n.slr .paper{fill:#FCF9F2;stroke:rgba(52,38,28,.18);stroke-width:.8}\n.slr .dog{fill:#C98D5A;stroke:none}\n.slr .dog2{fill:#A86F42;stroke:none}\n.slr .it{opacity:0;transform:translateY(-10px);transition:opacity 1.1s cubic-bezier(.33,0,.2,1),transform 1.4s cubic-bezier(.22,.61,.36,1);transition-delay:calc(var(--i)*110ms + 300ms)}\n.slr .set.on .it{opacity:1;transform:none}\n.slr .set:not(.on) .it{transition-delay:calc(var(--i)*25ms);transition-duration:.6s}\n.slr #slr-baseRug{transition:opacity 1s ease}\n.slr #slr-lamp{transition:opacity .9s cubic-bezier(.33,0,.2,1)}\n.slr #slr-lamp.off{transition-duration:.5s}\n.slr #slr-lampIn{transition:transform 1.5s cubic-bezier(.22,.61,.36,1)}\n.slr #slr-lamp.off{opacity:0}\n.slr #slr-lamp.off #slr-lampIn{transform:translateY(-6px)}\n.slr .glass{stroke:none}\n.slr #slr-glow{opacity:var(--glowA);transition:opacity 1.3s ease .1s}\n.slr #slr-glow.off{transition:opacity .5s ease}\n.slr #slr-glow.off,.slr #slr-pool.off{opacity:0}\n.slr #slr-pool{transition:opacity 1.3s ease .1s}\n.slr #slr-pool.off{transition:opacity .5s ease}\n.slr #slr-maskLamp{transition:opacity 1.3s ease .1s}\n.slr #slr-maskLamp.off{opacity:0;transition:opacity .6s ease}\n.slr #slr-dark{fill:var(--dark);opacity:var(--darkA);transition:opacity 1s ease,fill 1s}\n.slr #slr-shaft,.slr #slr-dark,.slr #slr-glow,.slr #slr-pool,.slr #slr-patch{pointer-events:none}\n.slr .hiddenItem{display:none}\n.slr .steam{filter:blur(.6px)}\n.slr .steam path{fill:none;stroke:rgba(255,250,240,.85);stroke-width:2.6;stroke-linecap:round;animation:slr-steam 3.6s ease-in-out infinite;opacity:0;transform-box:fill-box}\n.slr .steam path:nth-child(2){animation-delay:1.05s}\n.slr .steam path:nth-child(3){animation-delay:2.1s}\n@keyframes slr-steam{0%{opacity:0;transform:translate(0,6px) scaleY(.8)}35%{opacity:.9}100%{opacity:0;transform:translate(3px,-22px) scaleY(1.2)}}\n.slr .handle{fill:none;stroke:color-mix(in srgb,#5C87B3 80%,#2a1c12);stroke-width:4;stroke-linecap:round}\n.slr .coffee{fill:#5A3A24;stroke:#5A3A24;stroke-width:2}\n.slr .disc-print{fill:none;stroke:rgba(255,255,255,.35);stroke-width:1.2}\n.slr .art-f{stroke:none}\n.slr .art-f.lav{fill:#9A88C2}\n.slr .art-f.mus{fill:#E2AE45}\n.slr .art-f.red{fill:#D45B42}\n.slr .breath{transform-box:fill-box;transform-origin:50% 100%;animation:slr-breath 3.6s ease-in-out infinite}\n@keyframes slr-breath{50%{transform:scale(1.035,1.07)}}\n.slr .wave{fill:none;stroke:var(--acc);stroke-width:3;opacity:0;transform-box:fill-box;transform-origin:center;animation:slr-wave 4.5s ease-out infinite}\n@keyframes slr-wave{0%{opacity:.8;transform:scale(.5)}100%{opacity:0;transform:scale(2.6)}}\n.slr .curt{fill:color-mix(in srgb,var(--acc) 22%,#F4EBDD)}\n.slr .curt-pat{fill:url(#slr-pFlower)}\n.slr .fold{fill:none;stroke:rgba(80,55,35,.13);stroke-width:5;stroke-linecap:round}\n.slr .pat{stroke:none}\n.slr .pat.dots{fill:url(#slr-pDots)}\n.slr .pat.stripe{fill:url(#slr-pStripe)}\n.slr .soft.fT,.slr .soft.fL,.slr .soft.fR{stroke-width:9}\n.slr .bulb{fill:#FFE0A8;animation:slr-blink 2.8s ease-in-out infinite}\n@keyframes slr-blink{50%{opacity:.35}}\n.slr .hot .ring,.slr .hot .core,.slr .hot .halo,.slr .hot text{display:none}\n.slr .hot .hit{fill:transparent}\n.slr .hot{outline:none}\n.slr .spots{position:absolute;inset:0;pointer-events:none}\n.slr .spot{all:unset;position:absolute;pointer-events:auto;cursor:pointer;width:34px;height:31px;transform:translate(-50%,-50%) rotate(var(--rot,0deg));\n  border-radius:var(--shape);background:color-mix(in srgb,#fff 26%,transparent);border:1px solid color-mix(in srgb,#fff 55%,transparent);\n  -webkit-backdrop-filter:blur(7px) saturate(1.25);backdrop-filter:blur(7px) saturate(1.25);box-shadow:0 6px 18px rgba(46,30,15,.16),inset 0 1px 2px rgba(255,255,255,.35);\n  display:grid;place-items:center;transition:background .4s,border-color .4s,width .3s,height .3s}\n.slr .spot i{display:block;width:9px;height:8px;border-radius:var(--shape2);background:color-mix(in srgb,var(--ink) 78%,transparent);transition:background .4s,transform .3s}\n.slr .spot b{position:absolute;left:calc(100% + 8px);top:50%;transform:translateY(-50%) rotate(calc(var(--rot,0deg)*-1));white-space:nowrap;font:400 12.5px var(--font);letter-spacing:.05em;color:var(--ink);\n  padding:5px 11px;border-radius:14px 18px 15px 17px / 17px 14px 18px 15px;background:color-mix(in srgb,var(--bg) 42%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);\n  border:1px solid color-mix(in srgb,#fff 30%,transparent);opacity:0;transition:opacity .3s;pointer-events:none}\n.slr .spot.left b{left:auto;right:calc(100% + 8px)}\n.slr .spot:hover,.slr .spot:focus-visible{background:color-mix(in srgb,#fff 38%,transparent);width:38px;height:35px}\n.slr .spot:hover b,.slr .spot:focus-visible b{opacity:1}\n.slr .spot:hover i{transform:scale(1.15)}\n.slr .spot:focus-visible{outline:2px solid color-mix(in srgb,var(--acc) 70%,transparent);outline-offset:3px}\n.slr .spot.cur{background:color-mix(in srgb,var(--acc) 34%,transparent);border-color:color-mix(in srgb,var(--acc) 60%,#fff)}\n.slr .spot.cur i{background:var(--acc);box-shadow:0 0 10px 2px color-mix(in srgb,var(--acc) 60%,transparent)}\n@media (prefers-reduced-motion:reduce){.slr *{transition:none!important;animation:none!important}}"

export function mount(root: HTMLElement, COPY: any, NIGHTL: string, DAYL: string) {
    const cleanups: (() => void)[] = []
    let alive = true
    const requestAnimationFrame = (fn) => (alive ? window.requestAnimationFrame(fn) : 0)
    const setTimeout = (fn, ms) => window.setTimeout(() => alive && fn(), ms)
    const clearTimeout = (id) => window.clearTimeout(id)
    const $ = (id) => root.querySelector("#slr-" + id)
    const S=46,CX=600,CY=350,W=10,D=10,H=7;
    const P=(x,y,z)=>[CX+(x-y)*S*.866, CY+(x+y)*S*.5-z*S];
    const f=n=>n.toFixed(1);
    const pts=a=>a.map(p=>P(...p).map(f).join(',')).join(' ');
    const poly=(a,c)=>`<polygon class="${c}" points="${pts(a)}"/>`;
    const line=(a,b,c='ln')=>{const p=P(...a),q=P(...b);return `<line class="${c}" x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}"/>`};
    const box=(x,y,z,w,d,h,a='')=>
      poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],'fT '+a)+
      poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],'fL '+a)+
      poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],'fR '+a);
    const RX=1.2247*S, RY=.7071*S;
    const ell=(x,y,z,r,c,id='')=>{const [cx,cy]=P(x,y,z);return `<ellipse ${id?`id="slr-${id}"`:''} class="${c}" cx="${f(cx)}" cy="${f(cy)}" rx="${f(r*RX)}" ry="${f(r*RY)}"/>`};
    const cyl=(x,y,z,r,h,a='')=>{const [cx,cb]=P(x,y,z),ct=cb-h*S,rx=r*RX,ry=r*RY;
      return `<path class="fL ${a}" d="M${f(cx-rx)},${f(ct)} L${f(cx-rx)},${f(cb)} A${f(rx)},${f(ry)} 0 0 0 ${f(cx+rx)},${f(cb)} L${f(cx+rx)},${f(ct)} Z"/>`+
      `<ellipse class="fT ${a}" cx="${f(cx)}" cy="${f(ct)}" rx="${f(rx)}" ry="${f(ry)}"/>`};
    const qx=(x,y1,y2,z1,z2,c)=>poly([[x,y1,z1],[x,y2,z1],[x,y2,z2],[x,y1,z2]],c);
    const qy=(y,x1,x2,z1,z2,c)=>poly([[x1,y,z1],[x2,y,z1],[x2,y,z2],[x1,y,z2]],c);
    const fq=(x1,y1,x2,y2,z,c)=>poly([[x1,y1,z],[x2,y1,z],[x2,y2,z],[x1,y2,z]],c);
    const sheet=(cx,cy,z,w,h,a,c='paper')=>{const co=Math.cos(a),si=Math.sin(a);
      return poly([[-w,-h],[w,-h],[w,h],[-w,h]].map(([u,v])=>[cx+u*co-v*si,cy+u*si+v*co,z]),c)};
    const plant=(x,y,z,r,h,s,pot='m-terra')=>{const [cx,cb]=P(x,y,z),ct=cb-h*S;let o=cyl(x,y,z,r,h,pot),st='',lv='';
      [[-1.2,-1.2],[-.7,-2.15],[.1,-2.55],[.85,-1.95],[1.25,-1.05],[-.25,-1.55],[.45,-1.35]].forEach(([dx,dy],i)=>{
        const ex=cx+dx*S*s,ey=ct+dy*S*s,bx=cx+dx*S*s*.42,by=ct+dy*S*s*.42,vx=ex-bx,vy=ey-by,L=Math.hypot(vx,vy),ux=vx/L,uy=vy/L,nx=-uy,ny=ux,w=L*.5,mx=bx+vx*.5,my=by+vy*.5;
        st+=`<path class="stem" d="M${f(cx)},${f(ct)} Q${f(cx+dx*S*s*.1)},${f(ct+dy*S*s*.3)} ${f(bx)},${f(by)}"/>`;
        lv+=`<path class="${i%2?'leaf2':'leaf'}" d="M${f(bx)},${f(by)} C${f(bx+nx*w*.9-ux*L*.22)},${f(by+ny*w*.9-uy*L*.22)} ${f(mx+nx*w)},${f(my+ny*w)} ${f(ex)},${f(ey)} C${f(mx-nx*w)},${f(my-ny*w)} ${f(bx-nx*w*.9-ux*L*.22)},${f(by-ny*w*.9-uy*L*.22)} ${f(bx)},${f(by)} Z"/><path class="rib" d="M${f(bx)},${f(by)} L${f(bx+vx*.8)},${f(by+vy*.8)}"/>`});
      return o+st+lv};
    const flowers=(x,y,z,h,sc=1)=>{const [cx,cb]=P(x,y,z),t=cb-h*S;let o='';
      [[-14,-30],[-4,-42],[9,-34],[16,-22],[-20,-18]].forEach(([dx,dy])=>{dx*=sc;dy*=sc;o+=`<path class="ln" d="M${f(cx)},${f(t)} Q${f(cx+dx*.3)},${f(t+dy*.6)} ${f(cx+dx)},${f(t+dy)}"/><circle class="fT m-mustard" cx="${f(cx+dx)}" cy="${f(t+dy)}" r="${f(4.5*sc)}"/>`});return o};
    const steam=(x,y,z)=>{const [cx,cy]=P(x,y,z);let o='<g class="steam">';
      [-6,0,6].forEach((dx,i)=>{o+=`<path d="M${f(cx+dx)},${f(cy-2)} c-7,-8 7,-14 0,-22 c-7,-8 6,-13 1,-20"/>`});return o+'</g>'};
    const cup=(x,y,z)=>{const [hx,hy]=P(x+.2,y-.02,z+.13);
      return ell(x,y,z,.34,'fT m-cream')+`<path class="handle" d="M${f(hx-2)},${f(hy-8)} c9,-2 11,10 0,11"/>`+cyl(x,y,z,.19,.24,'m-blue')+ell(x,y,z+.24,.15,'coffee')+steam(x,y,z+.3)};
    const smooth=ps=>{const n=ps.length;let d=`M${f(ps[0][0])},${f(ps[0][1])}`;for(let i=0;i<n;i++){const p0=ps[(i-1+n)%n],p1=ps[i],p2=ps[(i+1)%n],p3=ps[(i+2)%n];
      d+=` C${f(p1[0]+(p2[0]-p0[0])/6)},${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)},${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])},${f(p2[1])}`}return d+'Z'};
    const blob=(cx,cy,z,rx,ry,seed,cls,k=.09)=>{const ps=[];for(let i=0;i<16;i++){const a=i/16*6.2832,m=1+k*Math.sin(3*a+seed)+k*.6*Math.sin(5*a+seed*2);ps.push(P(cx+rx*m*Math.cos(a),cy+ry*m*Math.sin(a),z))}return `<path class="${cls}" d="${smooth(ps)}"/>`};
    const curtain=(xa,xb,zt,zb,seed)=>{const y=.07,ps=[],N=6;
      for(let i=0;i<=N;i++)ps.push(P(xa+(xb-xa)*i/N,y,zt));
      for(let i=1;i<=N;i++){const z=zt-(zt-zb)*i/N;ps.push(P(xb+.07*Math.sin(i*1.7+seed)*(i/N),y,z))}
      for(let i=1;i<N;i++){const x=xb-(xb-xa)*i/N;ps.push(P(x,y,zb+.12*Math.sin(i*2.1+seed)))}
      for(let i=N;i>=1;i--){const z=zt-(zt-zb)*i/N;ps.push(P(xa-.07*Math.sin(i*1.3+seed)*(i/N),y,z))}
      const d='M'+ps.map(p=>f(p[0])+','+f(p[1])).join(' L')+'Z';
      let o=`<path class="curt" d="${d}"/><path class="curt-pat" d="${d}"/>`;
      for(let i=1;i<4;i++){const x=xa+(xb-xa)*i/4;const a=P(x,y,zt),b=P(x+.05*Math.sin(i+seed),y,zb+.1);o+=`<path class="fold" d="M${f(a[0])},${f(a[1])} Q${f((a[0]+b[0])/2+4)},${f((a[1]+b[1])/2)} ${f(b[0])},${f(b[1])}"/>`}
      return o};
    const waves=(x,y,z)=>{let o='<g filter="url(#slr-waveBlur)">';for(let i=0;i<3;i++)o+=ell(x,y,z,.5,'wave" style="animation-delay:'+(i*1.5)+'s');return o+'</g>'};
    const circPath=(fn,r,n=20)=>{const ps=[];for(let i=0;i<n;i++){const a=i/n*6.2832;ps.push(fn(Math.cos(a)*r,Math.sin(a)*r))}return smooth(ps)};
    const discX=(x,cy,cz,r)=>`<path class="ink" d="${circPath((c,s)=>P(x,cy+c,cz+s),r)}"/>`;
    const discY=(cx,y,cz,r)=>`<path class="ink" d="${circPath((c,s)=>P(cx+c,y,cz+s),r)}"/>`;
    const ringY=(cx,y,cz,r)=>`<path class="disc-print" d="${circPath((c,s)=>P(cx+c,y,cz+s),r)}"/>`;
    const bigArt=(y1,y2,z1,z2,kind)=>{let o=qx(0,y1-.08,y2+.08,z1-.08,z2+.08,'fR m-walnut')+qx(.01,y1,y2,z1,z2,'fR m-cream');const cy=(y1+y2)/2,cz=(z1+z2)/2,h=z2-z1,w=y2-y1;
      if(kind===1){o+=`<path class="art-f lav" d="${circPath((c,s)=>P(.02,cy-w*.12+c,cz+h*.05+s),h*.3)}"/><path class="art-f mus" d="${circPath((c,s)=>P(.02,cy+w*.2+c,cz-h*.12+s),h*.2)}"/>`+qx(.02,y1+w*.08,y2-w*.08,z1+h*.1,z1+h*.2,'fR m-terra')}
      else{o+=qx(.02,y1+w*.1,y1+w*.45,z1+h*.12,z2-h*.12,'fR m-blue')+`<path class="art-f red" d="${circPath((c,s)=>P(.02,cy+w*.22+c,cz+s),h*.24)}"/>`}
      return o};

    const it=(i,s)=>`<g class="it" style="--i:${i}">${s}</g>`;
    const chair=(x,y,back,a='')=>{let o=[[-.33,-.33],[.33,-.33],[-.33,.33],[.33,.33]].map(([u,v])=>cyl(x+u,y+v,0,.05,.85,'m-ink')).join('');
      const B={'y-':[x-.36,y-.42,.72,.12],'y+':[x-.36,y+.3,.72,.12],'x-':[x-.42,y-.36,.12,.72],'x+':[x+.3,y-.36,.12,.72]}[back];
      const bk=box(B[0],B[1],1.05,B[2],B[3],.75,a),seat=cyl(x,y,.85,.42,.12,a);
      return o+(back[1]==='-'?bk+seat:seat+bk)};
    const dog=(x,y,z)=>{const [sx,sy]=P(x,y,z);
      return `<g transform="translate(${f(sx)},${f(sy)})"><ellipse class="dog" cx="4" cy="-11" rx="26" ry="12"/>
      <path class="dog" d="M27,-10 q12,-4 6,-15"/><circle class="dog" cx="-19" cy="-13" r="10"/>
      <ellipse class="dog" cx="-28" cy="-9" rx="6" ry="4.5"/><path class="dog2" d="M-22,-21 q-9,3 -6,13 q4,-4 6,-13z"/>
      <path class="ln" d="M-21,-14 q2,2 4,0"/><circle class="ink" cx="-33" cy="-10" r="1.6"/></g>`};

    /* ---------- the room: 4 anchors that never move + persona layers ----------
       Layers keep painter order between anchors and extras:
       0 floor (rugs) · 1 walls (frames, lights) · 2 back (vinyl, shelf, nook) · 3 sofa · 4 table · 5 front */
    const ANCH={
     shelf:{hot:[8.7,.9,3.3],label:'Bookshelf'},
     sofa:{hot:[1.6,6.4,1.08],label:'Sofa'},
     table:{hot:[5.95,7.75,1.52],label:'Table'},
     vinyl:{hot:[.65,1.9,1.36],label:'Record player'}
    };
    const BOOKC=['m-red','m-mustard','m-blue','m-cream','m-olive','m-pink','m-terra','m-cream'];
    const books=(full)=>{let o='';const Wd=[.16,.12,.2,.14,.18,.1,.22,.15,.13,.19,.17];
      [.15,1.45,2.75,4.05].forEach((z0,k)=>{if(!full&&k!==1&&k!==3)return;let x=k===1&&!full?8.75:7.76,i=k*3;const end=full?9.62:(k===1?9.62:8.62);
        while(x<end){const w=Wd[i%Wd.length],h=.72+((i*37)%28)/100;
        o+=qy(.86,x,Math.min(x+w,end),z0,z0+h,'fL '+BOOKC[(i*5)%BOOKC.length]);x+=w+.02;i++}});return o};
    const shelfFrame=()=>box(7.6,0,0,2.2,.9,5.4,'m-wood')+qy(.9,7.72,9.68,.12,5.25,'fx')+
      [1.37,2.67,3.97].map(z=>qy(.9,7.72,9.68,z,z+.08,'fL m-wood')).join('')+qy(.9,8.68,8.72,.12,5.25,'fL m-wood');
    const doors=()=>qy(.92,7.74,8.66,.14,1.35,'fL m-mustard')+qy(.92,8.74,9.66,.14,1.35,'fL m-cream')+
      qy(.92,7.74,8.66,1.47,2.65,'fL m-red')+qy(.92,8.74,9.66,2.77,3.95,'fL m-blue')+qy(.92,7.74,8.66,2.77,3.95,'fL m-cream');
    const tufts=(x,y,z,w,d,nx,ny,mm='m-olive')=>{let o='';const cw=w/nx,ch=d/ny,g=.1;for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)o+=fq(x+i*cw+g,y+j*ch+g,x+(i+1)*cw-g,y+(j+1)*ch-g,z+.01,'fT q '+mm);return o};
    const tuftsX=(x,y,z,d,h,ny,nz,mm='m-olive')=>{let o='';const ch=d/ny,zh=h/nz,g=.1;for(let j=0;j<ny;j++)for(let k=0;k<nz;k++)o+=qx(x+.01,y+j*ch+g,y+(j+1)*ch-g,z+k*zh+g,z+(k+1)*zh-g,'fR q '+mm);return o};
    const wine=(x,y,z)=>{const [cx,cb]=P(x,y,z);return ell(x,y,z,.1,'fT m-glass')+`<line class="ln" x1="${f(cx)}" y1="${f(cb)}" x2="${f(cx)}" y2="${f(cb-9)}"/>`+cyl(x,y,z+.2,.12,.14,'m-red')};
    const art=(y1,y2,z1,z2)=>{const yy=(a)=>y1+(y2-y1)*a,zz=(a)=>z1+(z2-z1)*a;
      return qx(0,y1,y2,z1,z2,'fR m-cream')+line([.02,yy(.12),zz(.62)],[.02,yy(.88),zz(.62)],'art r')+line([.02,yy(.3),zz(.18)],[.02,yy(.3),zz(.85)],'art k')+
       line([.02,yy(.55),zz(.38)],[.02,yy(.92),zz(.38)],'art y')+line([.02,yy(.72),zz(.15)],[.02,yy(.72),zz(.8)],'art b')};
    const BASE=[
     [0,`<g id="slr-baseRug">${blob(6.4,6.3,0,2.7,2.5,1,'rug base')}</g>`],
     [2,box(0,.8,0,1.2,3,1,'m-walnut')+qx(1.21,.95,1.85,.15,.85,'fR m-cream')+qx(1.21,1.95,2.85,.15,.85,'fR m-mustard')+qx(1.21,2.95,3.65,.15,.85,'fR m-cream')+
        box(.15,1.4,1,1,1,.2,'m-cream')+ell(.65,1.9,1.2,.42,'ink')+ell(.65,1.9,1.2,.11,'fT a')+
        `<line id="slr-vinylMark" class="ln" style="stroke:#6b6058"/>`+cyl(1.0,1.55,1.2,.07,.06,'m-ink')+line([1.0,1.55,1.27],[.98,2.12,1.23],'mul thin')+line([.98,2.12,1.23],[.82,2.2,1.22],'mul thin')],
     [2,shelfFrame()+books(false)+doors()],
     [3,box(.2,5,0,2.2,4.4,.8,'m-olive')+box(.2,5,.8,.6,4.4,1.2,'m-olive')+`<g class="sofa-one">`+tuftsX(.8,5,.8,4.4,1.2,5,1)+`</g>`+box(.8,5,.8,1.6,.45,.55,'m-olive')+tufts(.8,5,1.35,1.6,.45,3,1)+
        box(.8,5.45,.8,1.55,1.75,.28,'m-olive')+tufts(.8,5.45,1.08,1.55,1.75,3,3)+box(.8,7.2,.8,1.55,1.75,.28,'m-olive')+tufts(.8,7.2,1.08,1.55,1.75,3,3)+`<g class="sofa-two">`+box(.8,5.5,1.08,.32,1.65,.92,'m-olive soft')+tuftsX(1.12,5.5,1.08,1.65,.92,3,2)+box(.8,7.25,1.08,.32,1.65,.92,'m-olive soft')+tuftsX(1.12,7.25,1.08,1.65,.92,3,2)+`</g>`+box(.8,8.95,.8,1.6,.45,.55,'m-olive')+tufts(.8,8.95,1.35,1.6,.45,3,1)],
     [4,cyl(6.8,6.5,0,.62,.06,'m-ink')+cyl(6.8,6.5,0,.12,1.4,'m-ink')+cyl(6.8,6.5,1.4,1.7,.12,'m-wood')]
    ];
    const R_={
     reader:{anchor:'shelf',name:'The reader',line:'An armchair by the window, a coffee still steaming, one more chapter.',
      lamp:'#FFCF8F',acc:'#C99A5B',L:{o:[6.6,2,1.03],pl:'flat',R:.5,th:.13,pool:5.6},read:'<b>3000K</b> · honey white · lying on the side table',
      items:[
       [0,blob(4.8,2.7,0,1.9,1.7,2,'rug')+blob(4.8,2.7,0,1.9,1.7,2,'pat dots')],
       [1,line([2.0,.07,5.78],[7.5,.07,5.78],'mul thin')+curtain(2.15,3.35,5.75,.25,1)+curtain(6.25,7.45,5.75,.25,3)],
       [2,books(true)+plant(9.2,.45,5.4,.3,.45,.6)],
       [2,box(3.6,.5,0,2.2,1.9,.85,'m-mustard')+box(3.6,.5,.85,2.2,.45,1,'m-mustard')+box(3.6,.95,.85,.4,1.45,.45,'m-mustard')+box(4,.95,.85,1.4,1.45,.2,'m-mustard')+
          box(4.3,1,1.05,.7,.38,.58,'m-blue')+sheet(4.45,1.85,1.06,.3,.2,.15)+sheet(5,1.85,1.06,.3,.2,-.12)+box(5.4,.95,.85,.4,1.45,.45,'m-mustard')],
       [2,cyl(6.6,2,0,.07,.82,'m-ink')+cyl(6.6,2,.82,.78,.08,'m-wood')],
       [2,plant(2.65,1.0,0,.42,.9,1.25,'m-blue')],
       [2,cup(5.6,1.75,1.31)],
       [2,box(8.3,1.8,0,.9,.7,.15,'m-red')+box(8.35,1.85,.15,.8,.6,.13,'m-blue')+box(8.28,1.82,.28,.85,.65,.14,'m-mustard')]]},
     storyteller:{anchor:'sofa',name:'The storyteller',line:'A big sofa, walls full of pictures, notes everywhere and the dog asleep at your feet.',
      lamp:'#FFD199',acc:'#C47A4E',L:{o:[.14,6.9,3.6],pl:'wall',R:.55,th:.14},read:'<b>2700K</b> · warm white · on the wall, among the pictures',
      items:[
       [0,blob(3.7,7.2,0,1.25,2.2,5,'rug')+blob(3.7,7.2,0,1.25,2.2,5,'pat stripe')],
       [1,art(4.8,6.0,2.9,4.4)+qx(0,5.0,5.8,4.65,5.5,'fR m-mustard')+qx(0,6.4,7.4,4.5,5.2,'fR m-blue')+qx(0,6.55,7.25,4.62,5.08,'fR m-cream')+qx(0,7.75,8.9,3.0,4.0,'fR m-red')+qx(0,7.88,8.77,3.12,3.88,'fR m-cream')+art(7.8,8.6,4.25,5.4)+qx(0,9.0,9.7,2.8,4.2,'fR m-olive')+qx(0,3.7,4.4,3.3,4.1,'fR m-pink')],
       [2,cyl(1.95,1.3,0,.42,.22,'m-red')+cyl(1.95,1.3,.22,.24,.52,'m-red')+cyl(1.95,1.3,.74,.44,.26,'m-red')+box(1.7,1.05,1,.5,.4,.12,'m-blue')+box(1.75,1.1,1.12,.42,.32,.1,'m-cream')],
       [2,plant(9.3,3.8,0,.5,.95,1.15,'m-mustard')],
       [3,box(1.18,5.6,1.1,.28,.72,.6,'m-mustard puff')+box(1.18,6.45,1.1,.28,.72,.6,'a puff')+box(1.18,7.6,1.1,.28,.78,.62,'m-blue puff')+box(1.18,8.45,1.1,.26,.45,.46,'m-pink puff')],
          [4,sheet(6.2,5.6,1.52,.3,.42,.3)+sheet(7.2,5.5,1.52,.3,.42,-.2)+sheet(7.9,6.6,1.52,.3,.42,.6)+sheet(6.8,6.6,1.52,.3,.42,-.4)+sheet(7.3,7.5,1.52,.3,.42,.2)+box(5.6,6.1,1.52,.55,.42,.08,'m-blue')+line([6.5,6.3,1.53],[6.95,6.1,1.53],'mul thin')+cyl(8.0,7.3,1.52,.13,.18,'m-mustard')],
       [5,cyl(3.8,8.1,0,.8,.18,'m-blue')+dog(3.8,8.1,.18)]]},
     host:{anchor:'table',name:'The host',line:'A long table set for everyone. Flowers, too many cups, nobody leaving.',
      lamp:'#FFB066',acc:'#D08A3A',L:{o:[6.8,6.5,1.66],pl:'flat',R:.5,th:.13},read:'<b>2200K</b> · amber · lying in the middle of the table',
      items:[
       [0,(()=>{let o=fq(3.9,3.6,9.7,9.4,0,'rug');for(let i=0;i<7;i++)for(let j=0;j<7;j++)if((i+j)%2)o+=fq(3.9+i*.8286,3.6+j*.8286,4.7286+i*.8286,4.4286+j*.8286,0,'chk');return o})()],
       [3,chair(6.8,4.4,'y-','m-red')+chair(4.7,6.5,'x-','m-blue')],
       [4,ell(8.0,6.8,1.52,.27,'fT m-cream')+ell(8.0,6.8,1.52,.16,'ln')+ell(7.1,7.6,1.52,.27,'fT m-cream')+ell(7.1,7.6,1.52,.16,'ln')+ell(5.69,6.2,1.52,.27,'fT m-cream')+ell(5.69,6.2,1.52,.16,'ln')+ell(7.1,5.39,1.52,.27,'fT m-cream')+ell(7.1,5.39,1.52,.16,'ln')],
       [4,cyl(8.25,6.25,1.52,.08,.22,'m-glass')+cyl(7.65,7.75,1.52,.08,.22,'m-glass')+cyl(5.75,5.65,1.52,.08,.22,'m-glass')+cyl(7.7,5.25,1.52,.08,.22,'m-glass')+cyl(6.25,5.6,1.52,.18,.42,'m-blue')+flowers(6.25,5.6,1.52,.42,1.05)],
       [5,chair(8.9,6.5,'x+','m-mustard')+chair(6.8,8.6,'y+','m-olive')]]},
     dreamer:{anchor:'vinyl',name:'The dreamer',line:'Put a record on. Low light, two glasses, nowhere to be.',
      lamp:'#B9A6E0',acc:'#9A88C2',L:{o:[.14,1.9,3.0],pl:'wall',R:.5,th:.14},read:'<b>Lavender</b> · on the wall, above the record player',
      items:[
       [0,blob(3.6,3.8,0,1.9,1.8,4,'rug')+blob(3.6,3.8,0,1.9,1.8,4,'pat stripe')+blob(3.6,3.8,0,1.4,1.3,4,'ln dash')],
       [1,box(.1,.1,0,.6,.6,1.7,'m-ink')+(()=>{const [a,b]=P(.4,.7,1.15),[c,d]=P(.4,.7,.5);return `<ellipse class="spk" cx="${f(a)}" cy="${f(b)}" rx="7" ry="9"/><ellipse class="spk" cx="${f(c)}" cy="${f(d)}" rx="10" ry="13"/>`})()],
       [1,bigArt(5.3,8.3,2.55,4.75,1)+bigArt(3.0,4.55,2.9,4.6,2)],
       [1,(()=>{let o='<path class="ln" d="M';const b=[];for(let y=.4;y<=9.6;y+=.42){const u=(y-5)/4.6,z=5.9-.45*(1-u*u);const p=P(0,y,z);o+=f(p[0])+','+f(p[1])+' ';b.push(p)}
         o+='"/>';b.forEach((p,i)=>o+=`<circle class="bulb" cx="${f(p[0])}" cy="${f(p[1]+4)}" r="3.6" style="animation-delay:${(i%5)*.45}s"/>`);return o})()],
       [2,box(.2,2.8,1,.9,.9,.2,'a')+box(.25,2.85,1.2,.85,.85,.08,'m-pink')+discX(1.33,3.0,.98,.42)+qx(1.3,2.5,3.5,0,1,'fR m-blue')+discX(1.48,3.35,.92,.4)+qx(1.45,2.8,3.8,0,.95,'fR m-pink')+ell(1.0,3.0,.05,.12,'fT m-cream')],
       [2,box(3.4,.45,0,.95,.85,.45,'m-wood')+[0,1,2,3,4].map(i=>discY(3.87,.57+i*.15,.75,.36)+qy(.57+i*.15,3.45,4.3,.25,1.05,'fL '+['m-mustard','m-red','m-cream','m-blue','m-pink'][i])+ringY(3.87,.57+i*.15+.001,.62,.2)).join('')],
       [0,ell(4.9,1.0,.02,.42,'ink')+ell(4.9,1.0,.02,.13,'fT a')+ell(5.5,1.35,.03,.42,'ink')+ell(5.5,1.35,.03,.13,'fT m-mustard')],
       [2,waves(.65,1.9,1.22)],
       [2,cyl(2.8,3,0,.7,.32,'a')+cyl(4.5,4.6,0,.62,.3,'m-mustard')],
       [2,plant(9.3,3.6,0,.55,1.05,1.2,'m-terra')],
       [4,cyl(7.3,5.7,1.52,.13,.5,'m-green')+cyl(7.3,5.7,2.02,.05,.25,'m-green')+wine(6.4,5.9,1.52)+wine(7.7,6.9,1.52)+cyl(6.6,6.7,1.52,.07,.22,'m-cream')+cyl(7.0,6.9,1.52,.07,.3,'m-cream')+ell(8.0,6.2,1.52,.24,'fT m-terra')]]}
    };

    /* ---------- room shell ---------- */
    const win={x1:3,x2:6.6,z1:1.5,z2:5.3};win.xm=(win.x1+win.x2)/2;win.zm=(win.z1+win.z2)/2;
    const {x1,x2,z1,z2,xm,zm}=win,t=.32,floorPts=[[0,0,0],[W,0,0],[W,D,0],[0,D,0]];
    const hullPts=[[0,0,H],[W,0,H],[W,0,0],[W,D,0],[0,D,0],[0,D,H]].map(q=>P(...q).map(f).join(',')).join(' ');
    let r=`<defs>
     <clipPath id="slr-roomClip"><polygon points="${hullPts}"/></clipPath>
     <clipPath id="slr-floorClip"><polygon points="${pts(floorPts)}"/></clipPath>
     <linearGradient id="slr-skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE0E8"/><stop offset="1" stop-color="#F6EBD6"/></linearGradient>
     <linearGradient id="slr-skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34436A"/><stop offset="1" stop-color="#5A6A90"/></linearGradient>
     <radialGradient id="slr-glowG"><stop offset="0" style="stop-color:var(--lamp)" stop-opacity=".95"/><stop offset=".35" style="stop-color:var(--lamp)" stop-opacity=".35"/><stop offset="1" style="stop-color:var(--lamp)" stop-opacity="0"/></radialGradient>
     <radialGradient id="slr-poolG"><stop id="slr-poolStop" offset="0" style="stop-color:var(--lamp)" stop-opacity=".75"/><stop offset="1" style="stop-color:var(--lamp)" stop-opacity="0"/></radialGradient>
     <radialGradient id="slr-glassG" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".45" style="stop-color:var(--lamp)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--lamp) 70%,#000)"/></radialGradient>
     <radialGradient id="slr-holeG"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
     <filter id="slr-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>
     <pattern id="slr-pDots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="rgba(255,255,255,.5)"/><circle cx="9" cy="9" r="1.5" fill="rgba(255,255,255,.5)"/></pattern>
     <pattern id="slr-pStripe" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="4" height="11" fill="rgba(255,255,255,.22)"/></pattern>
     <pattern id="slr-pFlower" width="20" height="22" patternUnits="userSpaceOnUse"><g style="fill:var(--acc)" opacity=".75"><circle cx="5" cy="3.6" r="1.7"/><circle cx="5" cy="8.4" r="1.7"/><circle cx="2.6" cy="6" r="1.7"/><circle cx="7.4" cy="6" r="1.7"/></g><circle cx="5" cy="6" r="1.3" fill="#E2AE45"/><circle cx="15" cy="17" r="1.4" fill="#6E7C4A" opacity=".6"/></pattern>
     <filter id="slr-paint" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".0055" numOctaves="1" seed="7" result="wob"/>
      <feDisplacementMap id="slr-fxWob" in="SourceGraphic" in2="wob" scale="7" xChannelSelector="R" yChannelSelector="G" result="w"/>
      <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="1" seed="12" result="c"/>
      <feColorMatrix in="c" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="cg"/>
      <feComposite id="slr-fxCanvas" in="w" in2="cg" operator="arithmetic" k1="0" k2="1" k3=".045" k4="-.022" result="p2"/>
      <feComposite in="p2" in2="w" operator="in"/>
     </filter>
     <filter id="slr-waveBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
     <filter id="slr-patchBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
     <filter id="slr-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="1" seed="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .14  0 0 0 0 .08  0 0 0 -1.6 .95"/>
     </filter>
     <filter id="slr-softer" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
     <mask id="slr-darkMask" maskUnits="userSpaceOnUse" x="-200" y="-300" width="1600" height="1500">
      <rect x="-200" y="-300" width="1600" height="1500" fill="#fff"/>
      <polygon id="slr-maskPatch" fill="#000" opacity=".55" filter="url(#slr-softer)"/>
      <circle id="slr-maskLamp" class="off" r="250" fill="url(#slr-holeG)"/>
     </mask>
    </defs>`;
    r+='<g clip-path="url(#slr-roomClip)"><g filter="url(#slr-paint)">';
    r+=poly([[0,0,0],[0,D,0],[0,D,H],[0,0,H]],'wA')+poly([[0,0,0],[W,0,0],[W,0,H],[0,0,H]],'wB')+poly(floorPts,'floor');
    r+=poly([[x1-.1,0,z1-.1],[x2+.1,0,z1-.1],[x2+.1,0,z2+.1],[x1-.1,0,z2+.1]],'fL m-ink');
    const glassPts=pts([[x1,0,z1],[x2,0,z1],[x2,0,z2],[x1,0,z2]]);
    r+=`<polygon points="${glassPts}" fill="url(#slr-skyN)"/><polygon id="slr-skyDay" points="${glassPts}" fill="url(#slr-skyD)" style="transition:opacity 1s"/>`;
    r+=line([xm,0,z1],[xm,0,z2],'mul')+line([x1,0,zm],[x2,0,zm],'mul')+line([x1+.9,0,z1],[x1+.9,0,z2],'mul thin')+line([x2-.9,0,z1],[x2-.9,0,z2],'mul thin');
    r+=poly([[x1-.25,0,z1-.18],[x2+.25,0,z1-.18],[x2+.25,.3,z1-.18],[x1-.25,.3,z1-.18]],'fT')+poly([[x1-.25,.3,z1-.3],[x2+.25,.3,z1-.3],[x2+.25,.3,z1-.18],[x1-.25,.3,z1-.18]],'fL');
    const floorLight=`<g clip-path="url(#slr-floorClip)"><polygon id="slr-patch" fill="var(--sun)" filter="url(#slr-patchBlur)" style="transition:fill 1s"/><g id="slr-mull" style="display:none"></g></g>`;
    for(let L=0;L<6;L++){
      BASE.forEach((b,bi)=>{if(b[0]===L)r+=`<g class="ed" data-id="base:${bi}">${b[1]}</g>`});
      Object.entries(R_).forEach(([k,p])=>{const its=p.items.map((x,i)=>[x,i]).filter(([x])=>x[0]===L);
        if(its.length)r+=`<g class="set" data-p="${k}">${its.map(([x,i])=>it(i,`<g class="ed" data-id="${k}:${i}">${x[1]}</g>`)).join('')}</g>`});
      if(L===0)r+=floorLight;
    }
    r+='</g><g id="slr-anim"></g></g>';
    r+=`<g id="slr-pool" class="off"></g>`;
    r+=`<polygon id="slr-shaft" fill="var(--shaft)" style="transition:fill 1s" filter="url(#slr-softer)"/>`;
    r+=`<g clip-path="url(#slr-roomClip)"><rect id="slr-dark" x="-200" y="-300" width="1600" height="1500" mask="url(#slr-darkMask)"/><rect id="slr-fxGrain" x="100" y="-20" width="1000" height="900" filter="url(#slr-grain)" opacity=".16" pointer-events="none"/></g>`;
    r+=`<circle id="slr-glow" class="off" r="230" fill="url(#slr-glowG)"/>`;
    r+=`<g id="slr-lamp" class="off"><g id="slr-lampIn"></g></g><g id="slr-selBox"></g>`;
    const byAnchor=Object.fromEntries(Object.entries(R_).map(([k,p])=>[p.anchor,k]));
    r+=Object.entries(ANCH).map(([a,h])=>{const [hx,hy]=P(...h.hot),k=byAnchor[a],right=hx<820;
      return `<g class="hot" data-k="${k}" data-id="hot:${a}" data-x="${f(hx)}" data-y="${f(hy)}" tabindex="0" role="button" aria-label="${h.label}: ${R_[k].name}" transform="translate(${f(hx)},${f(hy)})">
       <circle class="hit" r="24"/><circle class="halo" r="12"/><circle class="ring" r="12"/><circle class="core" r="4.5"/>
       <text x="${right?20:-20}" y="5" text-anchor="${right?'start':'end'}">${h.label}</text></g>`}).join('');
    if(COPY)Object.entries(COPY).forEach(([k,v])=>{Object.assign(R_[k],v)});
    const svg=$('svg');svg.innerHTML=r;
    /* ---------- lift animated bits out of the painted (filtered) layer so it never repaints ---------- */
    const NS='http://www.w3.org/2000/svg';
    root.querySelectorAll('.ed').forEach(ed=>{const nodes=[...ed.querySelectorAll('.steam,g[filter*="waveBlur"],.bulb,#slr-vinylMark')];if(!nodes.length)return;
      const wrap=document.createElementNS(NS,'g');wrap.setAttribute('data-twin',ed.dataset.id);nodes.forEach(n=>wrap.appendChild(n));
      const set=ed.closest('.set'),itw=ed.closest('.it');let top=wrap;
      if(set){const i=document.createElementNS(NS,'g');i.setAttribute('class','it');i.setAttribute('style',itw.getAttribute('style'));i.appendChild(wrap);
        const sg=document.createElementNS(NS,'g');sg.setAttribute('class','set');sg.dataset.p=set.dataset.p;sg.appendChild(i);top=sg}
      $('anim').appendChild(top)});
    /* ---------- window light ---------- */
    const DIR={day:{x:.38,z:.64},night:{x:-.3,z:1.02}};
    const patch=$('patch'),mull=$('mull'),shaft=$('shaft'),maskPatch=$('maskPatch');
    const hull=ps=>{ps=ps.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
      const lo=[],up=[];for(const p of ps){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
      for(const p of ps.reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))};
    function drawLight(k){
      const dx=DIR.day.x+(DIR.night.x-DIR.day.x)*k,dz=DIR.day.z+(DIR.night.z-DIR.day.z)*k;
      const pr=(x,z)=>[x+dx*z/dz,z/dz,0];
      const c=[pr(x1,z1),pr(x2,z1),pr(x2,z2),pr(x1,z2)],s=pts(c);
      patch.setAttribute('points',s);maskPatch.setAttribute('points',s);
      const L=(a,b)=>{const p=P(...a),q=P(...b);return `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}"/>`};
      mull.innerHTML=L(pr(xm,z1),pr(xm,z2))+L(pr(x1,zm),pr(x2,zm))+L(pr(x1,z1),pr(x2,z1))+L(pr(x1,z2),pr(x2,z2))+L(pr(x1,z1),pr(x1,z2))+L(pr(x2,z1),pr(x2,z2));
      shaft.setAttribute('points',hull([[x1,0,z1],[x2,0,z1],[x2,0,z2],[x1,0,z2],...c].map(p=>P(...p))).map(p=>p.map(f).join(',')).join(' '));
    }
    let k=1,raf=0;
    function tween(to){const from=k,t0=performance.now(),dur=1400;cancelAnimationFrame(raf);
      const step=now=>{const u=Math.min(1,(now-t0)/dur),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;k=from+(to-from)*e;drawLight(k);if(u<1)raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}

    /* ---------- vinyl ---------- */
    const vm=$('vinylMark'),[vx,vy]=P(.65,1.9,1.22);let ang=0,spin=0,vRaf=0;
    function drawV(){const c=Math.cos(ang),s=Math.sin(ang);
      vm.setAttribute('x1',f(vx+c*.15*RX));vm.setAttribute('y1',f(vy+s*.15*RY));vm.setAttribute('x2',f(vx+c*.38*RX));vm.setAttribute('y2',f(vy+s*.38*RY))}
    function vinyl(){ang+=spin;drawV();vRaf=spin?requestAnimationFrame(vinyl):0}
    drawV();

    /* ---------- transforming the room (no camera move) ---------- */
    const RING='M1,0 A1,1 0 1,0 -1,0 A1,1 0 1,0 1,0 Z M.44,0 A.44,.44 0 1,1 -.44,0 A.44,.44 0 1,1 .44,0 Z';
    const dP=([dx,dy,dz])=>[S*.866*(dx-dy),S*.5*(dx+dy)-S*dz];
    const PL={flat:{u:[1,0,0],v:[0,1,0],n:[0,0,1]},wall:{u:[0,1,0],v:[0,0,1],n:[1,0,0]}};
    const mat=(o,u,v,k)=>{const [ex,ey]=P(...o),a=dP(u),b=dP(v);return `matrix(${f(a[0]*k)},${f(a[1]*k)},${f(b[0]*k)},${f(b[1]*k)},${f(ex)},${f(ey)})`};
    function setLamp(L){const {u,v,n}=PL[L.pl],o=L.o,R=L.R,th=L.th;let h='';
      for(let i=0;i<=4;i++){const t=th*(1-i/4),oi=[o[0]-n[0]*t,o[1]-n[1]*t,o[2]-n[2]*t];
        h+=`<path fill-rule="evenodd" class="${i<4?'lampSide':'glass'}" ${i<4?'':'fill="url(#slr-glassG)"'} d="${RING}" transform="${mat(oi,u,v,R)}"/>`}
      h+=`<path d="M-.7,-.38 A.82,.82 0 0 1 -.1,-.8" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" transform="${mat(o,u,v,R)}"/>`;
      $('lampIn').innerHTML=h;
      const surf=[o[0]-n[0]*th+(L.pl==='wall'?-.1:0),o[1],o[2]-n[2]*th];
      pool.innerHTML=`<circle r="1" fill="url(#slr-poolG)" transform="${mat(surf,u,v,R*(L.pool||(L.pl==='wall'?4.6:3.8)))}"/>`;
      applyLamp();
      const [cx,cy]=P(...o);glow.setAttribute('cx',f(cx));glow.setAttribute('cy',f(cy));maskLamp.setAttribute('cx',f(cx));maskLamp.setAttribute('cy',f(cy));}
    const lamp=$('lamp'),glow=$('glow'),pool=$('pool'),maskLamp=$('maskLamp'),card=$('card'),lead=$('lead');
    let cur=null,timer=0;
    function go(key){
      if(key===cur)key=null;
      cur=key;clearTimeout(timer);
      root.querySelectorAll('.set').forEach(g=>g.classList.toggle('on',g.dataset.p===key));
      root.querySelectorAll('.hot').forEach(h=>h.classList.toggle('cur',h.dataset.k===key));
      root.querySelectorAll('.spot').forEach(b=>{b.classList.toggle('cur',b.dataset.k===key);b.setAttribute('aria-pressed',b.dataset.k===key)});
      $('baseRug').style.opacity=key?0:1;
      lamp.classList.add('off');glow.classList.add('off');pool.classList.add('off');maskLamp.classList.add('off');
      card.classList.add('hide');spin=key==='dreamer'?.045:0;if(spin&&!vRaf)vRaf=requestAnimationFrame(vinyl);
      lead.style.opacity=key?0:1;
      window.dispatchEvent(new CustomEvent('silena-persona',{detail:key}));
      if(!key)return;
      const p=R_[key];
      root.style.setProperty('--acc',p.acc);
      timer=setTimeout(()=>{
        setLamp(p.L);
        root.style.setProperty('--lamp',p.lamp);
        $('cn').textContent=p.name;$('cl').textContent=p.line;$('cr').innerHTML=p.read;
        timer=setTimeout(()=>{lamp.classList.remove('off');glow.classList.remove('off');pool.classList.remove('off');maskLamp.classList.remove('off');card.classList.remove('hide')},p.items.length*45+420);
      },380);
    }
    svg.addEventListener('click',e=>{const h=e.target.closest('.hot');if(h)go(h.dataset.k)});
    svg.addEventListener('keydown',e=>{const h=e.target.closest('.hot');if(h&&(e.key==='Enter'||e.key===' ')){e.preventDefault();go(h.dataset.k)}});

    root.style.transition='--lamp 1.2s ease, --acc 1s ease';


    const BAKED={"reader:3":{"dx":20,"dy":-16,"hidden":false,"z":0},"reader:5":{"dx":-7,"dy":-20,"hidden":false,"z":-2},"base:1":{"dx":16,"dy":0,"hidden":false,"z":0},"base:2":{"dx":5,"dy":3,"hidden":false,"z":0},"base:0":{"dx":11,"dy":-14,"hidden":false,"z":0},"reader:4":{"dx":-1,"dy":8,"hidden":false,"z":0},"lamp:reader":{"dx":-1,"dy":7,"hidden":false,"z":0},"reader:6":{"dx":-55,"dy":-61,"hidden":false,"z":0},"reader:2":{"dx":2,"dy":0,"hidden":false,"z":0},"hot:shelf":{"dx":22,"dy":-68,"hidden":false,"z":0},"reader:7":{"dx":-86,"dy":10,"hidden":false,"z":0},"storyteller:5":{"dx":-1,"dy":-23,"hidden":false,"z":0},"storyteller:0":{"dx":28,"dy":-34,"hidden":false,"z":0},"storyteller:6":{"dx":9,"dy":10,"hidden":false,"z":0},"storyteller:3":{"dx":57,"dy":-42,"hidden":false,"z":0},"storyteller:2":{"dx":-70,"dy":72,"hidden":false,"z":3},"storyteller:4":{"dx":9,"dy":-11,"hidden":false,"z":0},"storyteller:1":{"dx":1,"dy":0,"hidden":false,"z":0},"host:3":{"dx":-5,"dy":-3,"hidden":false,"z":0},"host:2":{"dx":-6,"dy":-5,"hidden":false,"z":0},"host:1":{"dx":9,"dy":-9,"hidden":false,"z":0},"host:4":{"dx":3,"dy":-13,"hidden":false,"z":0},"dreamer:10":{"dx":-20,"dy":-6,"hidden":false,"z":0},"dreamer:9":{"dx":35,"dy":-28,"hidden":false,"z":0},"dreamer:0":{"dx":32,"dy":-13,"hidden":false,"z":0},"dreamer:8":{"dx":40,"dy":-31,"hidden":false,"z":0},"dreamer:5":{"dx":0,"dy":-10,"hidden":false,"z":0},"dreamer:6":{"dx":-27,"dy":6,"hidden":false,"z":0},"dreamer:2":{"dx":-25,"dy":5,"hidden":false,"z":0},"dreamer:1":{"dx":13,"dy":4,"hidden":false,"z":0}};
    const clone=o=>JSON.parse(JSON.stringify(o));
    let layout=clone(BAKED);
    const get=id=>layout[id]||(layout[id]={dx:0,dy:0,hidden:false,z:0});
    /* pieces that sit on the record player travel with it */
    const FOLLOW={'dreamer:4':'base:1','dreamer:7':'base:1','hot:vinyl':'base:1'};
    function applyEl(el){const id=el.dataset.id,o=layout[id]||{dx:0,dy:0,hidden:false},p=FOLLOW[id]&&layout[FOLLOW[id]]||{dx:0,dy:0},dx=o.dx+p.dx,dy=o.dy+p.dy;
      if(el.classList.contains('hot'))el.setAttribute('transform',`translate(${f(+el.dataset.x+dx)},${f(+el.dataset.y+dy)})`);
      else el.setAttribute('transform',`translate(${f(dx)},${f(dy)})`);
      const tw=root.querySelector(`[data-twin="${id}"]`);if(tw)tw.setAttribute('transform',`translate(${f(dx)},${f(dy)})`);
      el.classList.toggle('hiddenItem',!!o.hidden)}
    function applyLamp(){const o=cur&&layout['lamp:'+cur]||{dx:0,dy:0};const t=`translate(${f(o.dx)},${f(o.dy)})`;
      [lamp,pool,glow,maskLamp].forEach(e=>e.setAttribute('transform',t))}
    function applyZ(){root.querySelectorAll('.set .ed').forEach(el=>{const o=layout[el.dataset.id];if(!o||!o.z)return;
      const w=el.parentNode.classList.contains('it')?el.parentNode:el;for(let i=0;i<Math.abs(o.z);i++)move(w,Math.sign(o.z))})}
    function move(w,dir){const par=w.parentNode;if(dir>0&&w.nextElementSibling)par.insertBefore(w.nextElementSibling,w);else if(dir<0&&w.previousElementSibling)par.insertBefore(w,w.previousElementSibling)}
    root.querySelectorAll('.ed,.hot').forEach(applyEl);applyZ();
    const LOOK_DEF={paint:.12,brush:.09,canvas:.045,grain:.16,wobble:7,round:4.2,hiT:84,shR:80,darkN:.68,glowN:.2,glowD:.28,pool:.75,sunK:1,sofaBack:'two',
      colors:{wood:'#BC8659',walnut:'#7E5337',cream:'#F2E9D7',olive:'#6E7C4A',green:'#3F6044',red:'#D45B42',mustard:'#E2AE45',blue:'#5C87B3',ink:'#2E2A26',terra:'#C7744E',pink:'#E8B6A8',glass:'#C9DAD5',leaf:'#456142',wallA:'#E2D9CC',wallB:'#D3C9BB',floor:'#EAE2D6',bgD:'#D8CFC2',bgN:'#16110C'},
      personas:Object.fromEntries(Object.entries(R_).map(([k,p])=>[k,{lamp:p.lamp,acc:p.acc}]))};
    /* look chosen by Ali (22 Oct) */
    Object.assign(LOOK_DEF,{paint:0,brush:0,canvas:.2,grain:.19,wobble:6.5,round:9.6,hiT:95,shR:62,darkN:.65,glowN:0,glowD:0,pool:.17,sunK:1.25,sofaBack:'one'});
    Object.assign(LOOK_DEF.colors,{wood:'#5f3a1c',olive:'#72813b',green:'#29655b',wallA:'#ecdac1',wallB:'#d7c7b2',floor:'#ac9777',bgN:'#322415'});
    LOOK_DEF.personas.storyteller.lamp='#dc9d50';
    let look=clone(LOOK_DEF);
    const rootS=root.style;
    function applyLook(){
      const k=(id,v)=>{const e=$(id);if(!e)return;e.setAttribute('k3',v);e.setAttribute('k4',-v/2)};
      k('fxPaint',look.paint);k('fxBrush',look.brush);k('fxCanvas',look.canvas);$('fxWob').setAttribute('scale',look.wobble);$('fxGrain').setAttribute('opacity',look.grain);
      $('poolStop').setAttribute('stop-opacity',look.pool);
      rootS.setProperty('--round',look.round+'px');rootS.setProperty('--hiT',look.hiT+'%');rootS.setProperty('--shR',look.shR+'%');
      ['darkN','glowN','glowD','sunK'].forEach(n=>rootS.setProperty('--'+n,look[n]));
      Object.entries(look.colors).forEach(([n,v])=>rootS.setProperty(n==='bgD'||n==='bgN'?'--'+n:'--c-'+n,v));
      Object.entries(look.personas).forEach(([n,v])=>{R_[n].lamp=v.lamp;R_[n].acc=v.acc});
      if(cur){rootS.setProperty('--lamp',R_[cur].lamp);rootS.setProperty('--acc',R_[cur].acc)}
      root.classList.toggle('sofa-back-one',look.sofaBack==='one')}
    applyLook();
    /* ---------- glass touch points (HTML over the svg so they can blur what is behind) ---------- */
    const SHAPES=[['58% 42% 52% 48% / 46% 56% 44% 54%','-8deg'],['46% 54% 44% 56% / 55% 45% 57% 43%','6deg'],['52% 48% 60% 40% / 48% 58% 42% 52%','-3deg'],['44% 56% 50% 50% / 58% 44% 56% 42%','10deg']];
    const spots=$('spots');
    root.querySelectorAll('.hot').forEach((h,i)=>{h.setAttribute('tabindex','-1');h.setAttribute('aria-hidden','true');
      const k=h.dataset.k,a=h.dataset.id.split(':')[1],b=document.createElement('button');b.className='spot';b.dataset.k=k;b.dataset.for=h.dataset.id;
      b.setAttribute('aria-label',`${R_[k].name} · ${ANCH[a].label.toLowerCase()}`);b.setAttribute('aria-pressed','false');
      b.style.setProperty('--shape',SHAPES[i%4][0]);b.style.setProperty('--shape2',SHAPES[(i+2)%4][0]);b.style.setProperty('--rot',SHAPES[i%4][1]);
      b.innerHTML=`<i></i><b>${R_[k].name}</b>`;b.addEventListener('click',()=>{go(k)});spots.appendChild(b)});
    function placeSpots(){const st=spots.getBoundingClientRect();
      spots.querySelectorAll('.spot').forEach(b=>{const h=root.querySelector(`.hot[data-id="${b.dataset.for}"] .hit`);if(!h)return;const r=h.getBoundingClientRect();
        const x=r.left+r.width/2-st.left,y=r.top+r.height/2-st.top;b.style.left=x+'px';b.style.top=y+'px';b.classList.toggle('left',x>st.width*.72)})}
    placeSpots();try{const ro=new ResizeObserver(placeSpots);ro.observe(svg);cleanups.push(()=>ro.disconnect())}catch(e){}window.addEventListener('resize',placeSpots);
    /* ---------- day / night follows the site switch ---------- */
    function setMode(m){root.dataset.mode=m;$('modeLbl').textContent=m==='day'?DAYL:NIGHTL;$('skyDay').style.opacity=m==='day'?1:0;tween(m==='day'?0:1)}
    const siteMode=()=>document.body.getAttribute('data-framer-theme')==='light'?'day':'night';
    root.dataset.mode=siteMode();$('skyDay').style.opacity=root.dataset.mode==='day'?1:0;drawLight(root.dataset.mode==='day'?0:1);$('modeLbl').textContent=root.dataset.mode==='day'?DAYL:NIGHTL;
    const onSite=()=>{const m=siteMode();if(m!==root.dataset.mode)setMode(m)};
    window.addEventListener('silena-theme',onSite);const mo=new MutationObserver(onSite);mo.observe(document.body,{attributes:true,attributeFilter:['data-framer-theme']});
    $('mode').addEventListener('click',()=>{const next=root.dataset.mode==='day'?'night':'day';setMode(next);window.dispatchEvent(new CustomEvent('silena-theme-request',{detail:next==='day'?'light':'dark'}))});
    cleanups.push(()=>{window.removeEventListener('silena-theme',onSite);mo.disconnect();window.removeEventListener('resize',placeSpots)});
    /* ---------- pause everything while the room is off screen ---------- */
    try{const io=new IntersectionObserver(es=>es.forEach(e=>{root.classList.toggle('paused',!e.isIntersecting);if(e.isIntersecting)placeSpots()}),{rootMargin:'200px'});io.observe(root);cleanups.push(()=>io.disconnect())}catch(e){}
    return () => {
        alive = false
        cleanups.forEach((c) => c())
    }
}
