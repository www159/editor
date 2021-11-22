import { Editor, EventEmitter } from "@editor/core";
import { Mark, pmMark, Schema } from "prosemirror-model";
import { IMeta, Meta, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { LinkView } from "./linkView";

export const LINK_PLUGIN_KEY = new PluginKey('link plugin key')

interface linkPluginState {
    activeMark: Mark | null
    activeDom: HTMLAnchorElement | null
    emitter: EventEmitter | null
}

export const enum duckMap {
    create_mark = 'create mark',
    test = 'test'
}

type duckEnum = typeof duckMap

type keys = keyof duckEnum



type linkActionMap = {
    [duckMap.create_mark]: {
        activeDom: HTMLAnchorElement
        activeMark: pmMark
    }
    [duckMap.test]: {
        nouse: true
    }
}

interface linkDuckAction {
    map: typeof duckMap
    meta: linkActionMap
}

export function createLinkPlugin(editor: Editor) {
    return new Plugin<linkPluginState, Schema, linkDuckAction>({

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
                
                const meta = tr.getMeta(this)
                if(meta) return reducer(meta, value)
                
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

function reducer(meta: Meta<linkDuckAction>, value: linkPluginState): linkPluginState {
    const { action, payload } = meta
        switch(action) {
            case duckMap.create_mark: {
                const { activeMark, activeDom } = payload
                return {
                    ...value,
                    activeDom,
                    activeMark,
                }
            }

            case 'test': {
                const { nouse } = payload
            }


            default: return value
        }
}