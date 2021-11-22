import { EventEmitter } from "@editor/core";
import { css } from "@editor/core/utils/stringRenderer";
import { deConsView, reactDirAttach } from "@editor/utils";
import { pmMark, pmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import HrefPrompt from "./HrefPrompt";
import { duckMap, LINK_PLUGIN_KEY } from "./plugin";

export class LinkView  implements NodeView {

    dom: HTMLAnchorElement

    prompt: HTMLDivElement

    mark: pmMark

    emitter: EventEmitter

    constructor(mark: pmMark, view: EditorView, emitter: EventEmitter) {
        this.emitter = emitter
        this.mark = mark
        const { href, title } = this.mark.attrs
        const dom = document.createElement('a')
        dom.href = href
        dom.title = title
        this.dom = dom

        const parent = view.dom.parentElement as HTMLElement
        const prompt = parent.appendChild(document.createElement('div'))
        this.prompt = prompt
        
        reactDirAttach(HrefPrompt, { emitter: this.emitter }, prompt)
        .then(parent => {
            prompt.style.cssText = css`
            display: none;
            `
            const { tr, dispatch } = deConsView(view)
            dispatch(tr.setMeta(LINK_PLUGIN_KEY, {
                action: duckMap.create_mark,
                payload: {
                    activeMark: this.mark,
                    activeDom: this.dom,
                }
            }))
            // setTimeout(() => {
                
            // }, 20)
        })
    }
}