import { EditorView } from "prosemirror-view"

declare module '*.svg' {
    const SVG: any
    export default SVG
}
// declare module 'prosemirror-dev-tools' {
//     const appDevTools: (view: EditorView) => void
//     //@ts-ignore
//     export default appDevTools
// }