import { html } from "./stringRenderer"

export function elementFromString(text: string): HTMLElement {
    console.log(text)
    let wrapping = html`<body>${text}</body>`
    return new window.DOMParser().parseFromString(wrapping, 'text/html').body
}