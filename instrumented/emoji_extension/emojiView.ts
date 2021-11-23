import { EventEmitter } from "@editor/core";
import { basicDeselection, basicSelection, deConsView, reactDomAttach, reactDomUnattach } from "@editor/utils";
import { pmNode } from "prosemirror-model";
import { EditorState, Selection, TextSelection } from "prosemirror-state";
import { EditorView, NodeView } from "prosemirror-view";
import { css } from "@editor/core/utils/stringRenderer";

import { EMOJI_STATE_KEY } from "./emojiState";
import emojiArr from "./data.json"

import EmojiBar from "./EmojiBar"
import { ESCAPE_KEY } from ".";

export class EmojiView extends EventEmitter implements NodeView {

    node: pmNode

    dom: Node

    getPos: () => number

    outerView: EditorView

    emojiBar: HTMLDivElement | null

    constructor(node: pmNode, view: EditorView, getPos: () => number) {
        super()
        this.node = node
        this.dom = document.createElement('emoji');
        (this.dom as HTMLElement).style.cssText = css`
            border: none;
        `
        this.getPos = getPos
        this.outerView = view
        this.emojiBar = null

        const { index } = this.node.attrs as { index: number }
        if(index !== -1) {
            this.exitView(index)
        }


        //dom和react结合，怪怪的。
        this.on('select index', this.exitView)
        this.on('escape', (key: ESCAPE_KEY) => {
            if(key === 'escape left') {
                // const {  }
                setTimeout(() => {
                    const { tr, dispatch } = deConsView(this.outerView)
                    dispatch(tr.setSelection(TextSelection.create(tr.doc, this.getPos())))
                }, 0)
            }
        })
        this.on('select next pos', () => {
            //利用单线程异步的滞后性。
            setTimeout(() => {
                const { tr, dispatch } = deConsView(this.outerView)
                const nextPos = this.getPos() + 2
                this.outerView.focus()
                dispatch(tr.setSelection(TextSelection.create(tr.doc, nextPos)).scrollIntoView());
            }, 0)
        })
        // this.on('emoji bar distroy', this.exitView)
        // console.log('doc pos', this.outerView.coordsAtPos(0), (this.outerView.dom.parentNode as HTMLElement).getBoundingClientRect())
    }

    selectNode() {
        basicSelection(this.dom)
        // setTimeout(this.open, 0)
        this.open()
    }

    deselectNode() {
        
        basicDeselection(this.dom)
        this.emojiBar && this.dom.contains(this.emojiBar) && this.dom.removeChild(this.emojiBar)
        this.close()

        // this.outerView.dispatch(this.outerView.state.tr)

        //如果没选且光标移动，删除自己
        // console.log(this.node.attrs.index)
        if(this.node.attrs.index === -1) {
            const { tr, dispatch } = deConsView(this.outerView)
            const pos = this.getPos()
            dispatch(tr.delete(pos, pos+2))
            return
        }
    }

    open = () => {
        if(!this.emojiBar) {
            reactDomAttach(EmojiBar, { emitter: this }, this.dom, true)
            .then(node => {
                this.emojiBar = node
                this.emojiBar.className = "emoji-bar-wrapper"
                this.emojiBar.style.cssText = css`
                   left: ${this.fixedleft()}px;
                `
            })
            
        }
    }

    close() {
        if(this.emojiBar) {
            reactDomUnattach(this.emojiBar)
            // console.log(this.dom.firstChild === this.emojiBar)
            this.emojiBar = null
        }
    }


    //如果获得表情则将表情插入并显示
    //光标选中下一个单位
    exitView = (index: number) => {
        this.node.attrs.index = index;
        (this.dom as HTMLElement).innerHTML = emojiArr[index];
        (this.dom as HTMLElement).style.cssText = css`
            border: '';
        `
        this.deselectNode()
        this.emit('select next pos')
    }

    fixedleft() {
        const { right: toX } = this.outerView.coordsAtPos(0)
        const { left: x } = this.outerView.coordsAtPos(this.getPos())
        return ((toX - x) < 80 ? toX - 80 : x) - 10
    }

    destroy() {
        this.close();
        (this.dom as HTMLElement).remove()

        this.on('react destroy', () => {
            this.emit('destroy', () => this.destoryAllListeners())
        })
    }

    stopEvent(event: Event) {
        // console.log(event, this.emojiBar)
        // return true
        return !!(this.emojiBar && event.target && this.emojiBar.contains(event.target as Node))
    }


    ignoreMutation() {
        return true
    }
} 