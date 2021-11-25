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

    editing: boolean

    constructor(node: pmNode, view: EditorView, getPos: () => number, emitter: EventEmitter) {

        this.node = node

        this.view = view

        this.getPos = getPos
        
        this.emitter = emitter

        this.editing = false

        console.log(111)

        const prompt = view.dom.parentNode?.appendChild(document.createElement('div'))

        if(prompt) this.prompt = prompt

        const { tr } = deConsView(view)

        pmEmit(view, LINK_PLUGIN_KEY, {
            action: 'create link',
            payload: {
                view: this
            }
        })

        reactDirAttach(HrefPrompt, { emitter: this.emitter }, this.prompt)
        .then(() => {
            this.prompt.className = 'link-tip-wrapper'
            setStyle(this.prompt, css`
                display: "";
            `)
        })
    }

}