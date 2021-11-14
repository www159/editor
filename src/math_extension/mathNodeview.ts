import katex, { KatexOptions, ParseError } from 'katex';
import { chainCommands, deleteSelection, liftEmptyBlock, newlineInCode } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { pmNode } from 'prosemirror-model'
import { EditorState, PluginKey, TextSelection, Transaction } from 'prosemirror-state';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { StepMap } from 'prosemirror-transform'
import { EventEmitter } from '../core'
import { collaspeMathCmd } from './commands/collapseMathCmd';
import { MathPluginState, MATH_PLUGIN_KEY } from './mathPlugin';
import { MathPreviewMeta, MATH_PREVIEW_KEY } from './plugins/mathPreview';
import { deConsView } from '@editor/utils';
// import { createMathPreviewPlugin, MATH_PREVIEW_KEY } from './plugins/mathPreview';

export interface CursorPosObserver {
    cursorSide: 'start' | 'end',
    updateCursorPos(state: EditorState): void
}

interface MathViewOptions {
    tagName?: string
    katexOptions?: KatexOptions
}

export class MathView extends EventEmitter implements NodeView, CursorPosObserver {

    private doc: pmNode
    private outerView: EditorView
    private getPos: () => number
    private displayMode: boolean

    dom: HTMLElement

    private mathRenderElt?: HTMLElement
    private mathSrcElt?: HTMLElement
    private katexDiv?: HTMLElement
    private innerView?: EditorView 

    cursorSide: 'start' | 'end'
    private  katexOptions: KatexOptions
    private tagname: string
    private isEditing: boolean
    private mathPluginKey: PluginKey<MathPluginState>

    constructor(
        node: pmNode,
        outerView: EditorView,
        getPos: () => number,
        displayMode: boolean,
        options: MathViewOptions = {},
        mathPluginKey: PluginKey<MathPluginState>,
        onDestroy?: () => void
    ) {
        super()
        this.doc = node
        this.outerView = outerView
        this.getPos = getPos
        this.displayMode = displayMode
        onDestroy && this.on('destroy', onDestroy)
        this.mathPluginKey = mathPluginKey


        this.cursorSide = 'start'
        this.isEditing = false

        
        this.katexOptions = Object.assign({
            globalGroup: true,
            throwOnError: false,
            displayMode
        },
        options.katexOptions
        )


        this.tagname = options.tagName || this.doc.type.name.replace('_', '-')
        this.dom = document.createElement(this.tagname)
        this.dom.classList.add('math-node')


        this.mathRenderElt = document.createElement('span') as HTMLSpanElement
        this.mathRenderElt.textContent = ''
        this.mathRenderElt.classList.add('math-render')
        this.dom.appendChild(this.mathRenderElt)

        this.mathSrcElt = document.createElement('span') as HTMLSpanElement
        this.mathSrcElt.classList.add('math-src')
        this.dom.appendChild(this.mathSrcElt)

        this.dom.addEventListener('click', () => this.ensureFocus())

        this.renderMath()
    }

    ensureFocus() {
        if(this.innerView && this.outerView.hasFocus()) {
            this.innerView.focus()
        }
    }

    renderMath() {
        if(!this.mathRenderElt) {
            return
        }

        this.renderKatex(this.dom)
    }

    /**
     * 
     * @param htmlDOM 
     * @param fromInner 
     * @returns 
     * 
     * `this.doc`存的是此次修改之前的状态。因此当跳出编辑块的修改发生时,
     * `this.doc.textContent`马上就更新为最终状态。
     * 而实时预览需要的是此次修改之后的状态，因此需要tr.doc
     */
    renderKatex(htmlDOM: HTMLElement, fromInner = true, syncDoc?: pmNode) {
        let { content } = this.doc.content
        let textString = ''
        if(fromInner) {
            if(content.length > 0 && content[0].textContent !== null) {
                textString = content[0].textContent.trim()
            }
        } 
        else {
            textString = syncDoc?.textContent as string
        }

        if(textString.length < 1) {
            htmlDOM.classList.add('empty-math')
            if(fromInner) {
                while(this.mathRenderElt?.firstChild) {
                    this.mathRenderElt.firstChild.remove()
                }
                return
            }
        }
        else {
            htmlDOM.classList.remove('empty-math')
        }

        try {
            if(fromInner) {
                katex.render(textString, this.mathRenderElt as HTMLElement, this.katexOptions)
                this.mathRenderElt?.classList.remove('parse-error')                
            }
            else {
                katex.render(textString, htmlDOM, this.katexOptions)
            }
        } catch (e) {
            if(e instanceof ParseError) {
                console.error(e)
                if(fromInner) {
                    this.mathRenderElt?.classList.add('parse-error')
                }
                htmlDOM.setAttribute('title', e.toString())
            }
            else {
                throw e
            }
        }

        return htmlDOM
    }

    update(node: pmNode, decorations: Array<Decoration>) {
        if(!node.sameMarkup(this.doc)) return false
        this.doc = node
        // console.log('deco', decorations)
        if(this.innerView) {
            let { state } = this.innerView

            let start = node.content.findDiffStart(state.doc.content)
            if(start != null) {
                let diff = node.content.findDiffEnd(state.doc.content)
                if(diff) {
                    let { a: endA, b: endB } = diff
                    let overlap = start - Math.min(endA, endB)
                    if(overlap > 0) {
                        endA += overlap, endB += overlap
                    }
                    this.innerView.dispatch(
                        state.tr
                        .replace(start, endB, node.slice(start, endA))
                        .setMeta(MATH_PLUGIN_KEY, true))
                }
            }
        }

        if(!this.isEditing) {
            this.renderMath()
        }

        return true
    }

    destroy() {
        this.emit('destroy')
        this.closeEditor(false)

        if(this.mathRenderElt) {
            this.mathRenderElt.remove()
            delete this.mathRenderElt
        }

        if(this.mathSrcElt) {
            this.mathSrcElt.remove()
            delete this.mathSrcElt
        }

        this.dom.remove()
    }
    
    updateCursorPos(state: EditorState) {
        const pos = this.getPos()
        const size = this.doc.nodeSize
        const inPmSelection = 
            (state.selection.from < pos + size)
            && (pos < state.selection.to)

            if(!inPmSelection) {
                this.cursorSide = (pos < state.selection.from) ? 'end' : 'start'
            }
    }

    selectNode() {
        // debugger
        if(!this.outerView.editable) {
            return
        }

        this.dom.classList.add('ProseMirror-selectednode')
        if(!this.isEditing) {
            this.openEditor()
/*********************************** 生成预览区 ***********************************/
            this.katexDiv = document.createElement('div')
            this.katexDiv.className = 'math-preview'
            let { tr: outerTr, dispatch: outerDispatch } = deConsView(this.outerView)
            let { tr: innerTr } = deConsView(this.innerView as EditorView)
            outerDispatch(outerTr.setMeta(
                MATH_PREVIEW_KEY,
                {
                    type: 'ADD',
                    pos: this.getPos(),
                    katexDOM: this.renderKatex(this.katexDiv, false, innerTr.doc)
                } as MathPreviewMeta
            ))
        }

    }

    deselectNode() {
        this.dom.classList.remove('ProseMirror-selectednode')
        if(this.isEditing) {
            this.closeEditor()
        }
    }

    stopEvent(event: Event): boolean {
        return (this.innerView !== undefined)
            && (event.target !== undefined)
            && this.innerView.dom.contains(event.target as Node)
    } 

    ignoreMutation() {
        return true
    }


    openEditor() {
        if(this.innerView) { throw Error('inner view should not exist!') }
        this.innerView = new EditorView(this.mathSrcElt, {
            state: EditorState.create({
                doc: this.doc,
                plugins: [
                    keymap({
                        'Tab': (state, dispatch) => {
                            if(dispatch) {
                                dispatch(state.tr.insertText('\t'))
                            }
                            return true
                        },

                        'Backspace': chainCommands(
                            deleteSelection,
                            (state, dispatch) => {
                                if(!state.selection.empty) {
                                    return false
                                }
                                if(this.doc.textContent.length > 0) {
                                    return false
                                }
                                this.outerView.dispatch(this.outerView.state.tr.insertText(''))
                                this.outerView.focus()
                                return true
                            }
                        ),

                        'Ctrl-Backspace': (state, dispatch) => {
                            this.outerView.dispatch(this.outerView.state.tr.insertText(''))
                            this.outerView.focus()
                            return true
                        },

                        'Enter': chainCommands(
                                newlineInCode,
                                collaspeMathCmd(this.outerView, +1, false, this.displayMode)
                        ),
                        'Ctrl-Enter' : collaspeMathCmd(this.outerView, +1, false, this.displayMode),
                        'ArrowLeft'  : collaspeMathCmd(this.outerView, -1, true, this.displayMode),
                        'ArrowUp'    : collaspeMathCmd(this.outerView, -1, true, this.displayMode),
                        'ArrowRight' : collaspeMathCmd(this.outerView, +1, true, this.displayMode),
                        'ArrowDown'  : collaspeMathCmd(this.outerView, +1, true, this.displayMode),
                        'Space'      : (state, dispatch) => {
                            if(dispatch) {
                                dispatch(state.tr.insertText(' '))
                            }
                            return true
                        }
                    }),

                    // createMathPreviewPlugin(this.outerView, this.katexOptions, this.getPos())
                ]
            }),
            dispatchTransaction: this.dispatchInner.bind(this)
        })
        
/*********************************** 选中 ***********************************/

        let { state: innerState } = this.innerView
        this.innerView.focus()
        let mabyPos = this.mathPluginKey.getState(this.outerView.state)?.prevCursorPos
        if(mabyPos  === null || mabyPos === undefined) {
            console.error('[prosemirror-math] Error:  Unable to fetch math plugin state from key.')
        }


        let prevCursorPos = mabyPos ?? 0
        let innerPos = prevCursorPos <= this.getPos() ? 0 : this.doc.nodeSize - 2
        this.innerView.dispatch(
            innerState.tr.setSelection(
                TextSelection.create(innerState.doc, innerPos)
            )
        )


        this.isEditing = true
    }

    closeEditor(render: boolean = true) {
        if(this.innerView) {
            this.innerView.destroy()
            this.innerView = undefined
        }

        if(render) {
            this.renderMath()
        }
        
        let { tr: outerTr, dispatch: outerDispatch } = deConsView(this.outerView)
        outerDispatch(outerTr.setMeta(
            MATH_PREVIEW_KEY,
            {
                type: 'REMOVE',
                pos: this.getPos(),
                katexDOM: this.katexDiv
            } as MathPreviewMeta
        ))
        this.isEditing = false
    }

    dispatchInner(tr: Transaction) {
        if(!this.innerView) return


        //处理预览
        if(tr.docChanged) {
            //提交渲染后的结果与位置到外层
            let { tr: outerTr, dispatch: outerDispatch } = deConsView(this.outerView)
            this.renderKatex(this.katexDiv as HTMLElement, false, tr.doc)
            outerDispatch(outerTr.setMeta(
                MATH_PREVIEW_KEY,
                {
                    type: 'MODIFY',
                } as MathPreviewMeta,
            ))
        }

        let { state, transactions } = this.innerView.state.applyTransaction(tr)
        this.innerView.updateState(state)

        if(!tr.getMeta(MATH_PLUGIN_KEY)) {
            let outerTr = this.outerView.state.tr,
                offsetMap = StepMap.offset(this.getPos() + 1)

            for(let i = 0; i < transactions.length; i++) {
                let { steps } = transactions[i]
                for(let j = 0; j < steps.length; j++) {
                    let mapped = steps[j].map(offsetMap)
                    if(!mapped) throw Error('step discarded')
                    outerTr.step(mapped)
                }
            }

            if(outerTr.docChanged) {
                this.outerView.dispatch(outerTr)
            }
        }
    }

}

