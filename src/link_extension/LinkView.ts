import { Editor } from "@editor";
import { EventEmitter } from "@editor/core";
import { css } from "@editor/core/utils/stringRenderer";
import { deConsView, pmEmit, reactDirAttach, setStyle } from "@editor/utils";
import { pmNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import HrefPrompt from "./HrefPrompt";
import { LINK_PLUGIN_KEY } from "./linkState";

export class LinkView implements NodeView {

    dom: HTMLAnchorElement

    node: pmNode

    view: EditorView

    getPos: () => number

    emitter: EventEmitter

    prompt: HTMLDivElement

    constructor(node: pmNode, view: EditorView, getPos: () => number, emitter: EventEmitter) {

        this.node = node

        this.view = view

        this.getPos = getPos
        
        this.emitter = emitter

        const prompt = view.dom.parentNode?.appendChild(document.createElement('div'))

        if(prompt) this.prompt = prompt

        const { tr } = deConsView(view)

        emitter.on('update', () => {
            pmEmit(view, LINK_PLUGIN_KEY, {
                action: 'create link',
                payload: {
                    view: this
                }
            })
        })

        reactDirAttach(HrefPrompt, { emitter: this.emitter }, this.prompt)
        .then(() => {
            setStyle(this.prompt, css`
                display: none;
            `)


        })
    }

}