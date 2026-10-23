// A tiny stand-in for the "framer" package, so the components written for Framer run here as
// plain React. Property controls only mattered in Framer's editor, so they do nothing.
export const RenderTarget = {
    canvas: "CANVAS",
    preview: "PREVIEW",
    current: () => "PREVIEW",
}
export const ControlType = new Proxy({}, { get: (_, k) => String(k) })
export function addPropertyControls() {}
