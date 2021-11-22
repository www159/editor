import { Editor, EventEmitter } from "@editor/core";
import { Procedure } from "@editor/utils";
import { Mark, pmMark, Schema } from "prosemirror-model";
import { IMeta, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { LinkView } from "./linkView";

export const LINK_PLUGIN_KEY = new PluginKey('link plugin key')

interface linkPluginState {
    activeMark: Mark | null
    activeDom: HTMLAnchorElement | null
    emitter: EventEmitter | null
}


interface linkMeta {
    'create mark': {
        activeDom: HTMLAnchorElement
        activeMark: pmMark
    }
    'test': {
        nouse: true
    }
}

export function createLinkPlugin(editor: Editor) {
    return new Plugin<linkPluginState, Schema, linkMeta>({

        key: LINK_PLUGIN_KEY,
    
        state: {
            init(_, __) {
                return {
                    activeMark: null,
                    activeDom: null, 
                    emitter: editor,
                }
            },
            apply(tr, value, _, newState) {
                
                //reduce 信息
                const meta = tr.getMeta(this)
                if(meta) return reducer(meta, value)
                
                //需要判断光标是否在dom中。如果在，则显示输入框

                // return value

                // let p = new Promise<number>(res => {
                //     res(1)
                // }).then()
                const { $anchor } = tr.selection
                let inAnchor = new Procedure({ $anchor })
                .then(({ $anchor }) => {
                    let hh = 1
                })
                .then(() => {

                })
                .final()

                if(inAnchor) {
                    return value
                }
                return value
            },

        },
    
        props: {
            nodeViews: {
                link: (mark, view) => {
                    return new LinkView(mark as pmMark, view, editor)
                }
            }
        }
    })
}

function reducer(meta: IMeta<linkMeta>, value: linkPluginState): linkPluginState {
    const { action } = meta
    switch(action) {

        case 'create mark': {
            const { activeMark, activeDom } = meta.payload
            return {
                ...value,
                activeDom,
                activeMark,
            }
        }

        case 'test': {
        }

        default: return value
    }
}

//procedure 类，为pm的通篇else设置。如果返回会true则执行下一个函数，否则返回false
