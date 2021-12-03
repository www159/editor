import { Editor, EditorEmitter, EditorEvents, EventEmitter, WSchema } from "@editor/core";
import { pmFetch, reactDirAttach, setStyle } from "@editor/utils";
import { css } from "@editor/core/utils/stringRenderer";
import { NodeType, pmNode, Schema } from "prosemirror-model";
import { IMeta, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import HrefPrompt from "./HrefPrompt";
import { renderGrouped } from "prosemirror-menu";

export interface linkState {
    activePos: number | null
    prompt: HTMLDivElement
}

interface linkMeta {

    'leave input': {
        href: string
        title: string
    }

    'active link input': {
        pos: number
    }

    'exit link input': {
    }
}

export const LINK_PLUGIN_KEY = new PluginKey<linkState, WSchema, linkMeta>('link plugin key')

// function createLinkView(node: pmNode, view: EditorView, getPos: () => number, emitter: EditorEmitter, prompt: HTMLDivElement) {
//     const linkView = new LinkView(node, view, getPos, emitter, prompt)
//     const { state } = view
//     const { storedLink } = LINK_PLUGIN_KEY.getState(state) as linkState
//     storedLink.set(node, linkView)
//     return linkView
// }

export function createLinkPlugin(editor: Editor, topDOM: HTMLElement) {
    return new Plugin<linkState, WSchema, linkMeta>({

        key: LINK_PLUGIN_KEY,

        state: {
            init(_, __) {
                const prompt = topDOM.appendChild(document.createElement('div'))
                prompt.className = 'link-tip-wrapper'
                // setStyle(prompt, css`display: none`)
                reactDirAttach(HrefPrompt, { emitter: editor, view: editor.view }, prompt)
                return {
                    storedLink: new WeakMap,
                    activePos: null,
                    prompt
                }

            },

            apply(tr, value) {
                const meta = pmFetch(tr, this)
                if(meta){
                    const { action } = meta
                    switch(action) {
                        case 'active link input': {
                            const { pos } = meta.payload
                            return {
                                ...value,
                                activePos: pos,
                            }
                        }
                        case 'exit link input': {
                            const { prompt } = value
                            setStyle(prompt, css`
                                display: none;
                            `)
                            setTimeout(() => {
                                editor.view.focus()
                            }, 20)
                            return {
                                ...value,
                                activePos: null,
                            }
                        }
                    }
                }
                return value
            }
        },

        appendTransaction(trans, _, newState) {
            const meta = pmFetch(trans[0], LINK_PLUGIN_KEY)
            if(meta) {
                const { action } = meta
                switch(action) {
                    case 'leave input': {
                        const { href, title } = meta.payload
                        const { activePos } = LINK_PLUGIN_KEY.getState(newState) as linkState
                        const { link } = editor.schema.nodes
                        return newState.tr
                        .setNodeMarkup(activePos as number, link, {
                            href, title
                        })
                        .setMeta(LINK_PLUGIN_KEY, {
                            action: 'exit link input',
                            payload: {}

                        })
                    }
                    default: return
                }
            }
            return
        },

        props: {
            handleDoubleClickOn(_, __, node) {
                if(node.type.name === 'link') {
                    console.log(node.attrs)
                    const { href } = node.attrs
                    window.open(href, '_blank')
                    return true
                }
                return false
            },

            handleClickOn({ state }, __, node) {
                const { activePos } = LINK_PLUGIN_KEY.getState(state) as linkState
                if(activePos !== null) {
                    editor.emitPort('link', 'leave input by click')
                    return true
                }
                return false
            }
        }
    })
}
