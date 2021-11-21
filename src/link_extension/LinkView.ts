import { EventEmitter, PluginView, Realize } from "@editor/core";
import { css } from "@editor/core/utils/stringRenderer";
import { attachGlobal, deConsView, reactDirAttach, reactDomUnattach } from "@editor/utils";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import HrefPrompt from "./HrefPrompt";
import { linkPlugin, LINK_PLUGIN_KEY } from "./plugin";

export class LinkView extends EventEmitter implements PluginView {

    prompt: HTMLDivElement

    constructor(view: EditorView) {
        super()
        this.prompt = attachGlobal(view, document.createElement('div')) as HTMLDivElement
        reactDirAttach(
            HrefPrompt, 
            { 
                emitter: this,
            },
            this.prompt
        ).then(() => {
            this.prompt.style.cssText = css`display: none;`
            this.prompt.className = 'link-tip-wrapper'

            //react组件收到enter后触发blur
            this.on('leave input', this.setHref(view))
            // this.update(view)      
        })
    }

    setHref = (view: EditorView) => (href: string) => {
        const { tr, dispatch } =deConsView(view)
        dispatch(tr.setMeta(LINK_PLUGIN_KEY, {
            action: 'set href',
            payload: {
                href
            }
        }))

        //不能同步，因为在keyDown后，pm还会再捕捉一次keypress。
        //20ms可能大于time(keypress) - time(keydown)
        setTimeout(() => {
            view.focus()    
        }, 20)
    }

    update(view: EditorView) {
        if(!this.prompt) return

        const { state } = view
        const { pos, activeMark } = linkPlugin.getState(state)
        if(!pos || !activeMark) {
           this.hide()
            return
        }

        //display: none 的with为0
        this.prompt.style.cssText = css`
            display: "";
        `

        const { bottom, left, right: curorRight } = view.coordsAtPos(pos)
        const { right: outerRight } = view.dom.getBoundingClientRect()
        const  width = this.prompt.clientWidth

        //调整tip的布局
        let x = width > outerRight - curorRight ? outerRight - width : left
        this.prompt.style.cssText = css`
            left: ${x}px;
            top: ${bottom}px;
        `

        const { href } = activeMark.attrs
        // console.log(href)
        this.emit('popup input', href)
    }

    destroy() {
        reactDomUnattach(this.prompt)
        this.prompt.remove()
        this.destoryAllListeners()
    }


    hide() {
        this.prompt.style.cssText = css`
            display: none;
        `
    }

}