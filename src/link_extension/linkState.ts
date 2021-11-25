import { EventEmitter } from "@editor/core";
import { pmFetch } from "@editor/utils";
import { pmNode, Schema } from "prosemirror-model";
import { IMeta, Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { LinkView } from "./LinkView";

interface linkState {
    storedLink: WeakMap<pmNode, LinkView>,
    activeLink: LinkView | null
}

interface linkMeta {
    'create link': {
        view: LinkView
    }
}

export const LINK_PLUGIN_KEY = new PluginKey<linkState, Schema, linkMeta>('link plugin key')

function createLinkView(node: pmNode, view: EditorView, getPos: () => number, emitter: EventEmitter) {
    const linkView = new LinkView(node, view, getPos, emitter)
    const { state } = view
    const { storedLink } = LINK_PLUGIN_KEY.getState(state) as linkState
    storedLink.set(node, linkView)
    return linkView
}

export function createLinkPlugin(emitter: EventEmitter) {
    return new Plugin<linkState, Schema, linkMeta>({

        key: LINK_PLUGIN_KEY,

        state: {
            init(_, __) {
                return {
                    storedLink: new WeakMap,
                    activeLink: null
                }
            },

            apply(tr, value, _, newState) {
                const meta = pmFetch(tr, this)
                if(meta) return linkReducer(meta, value)
                return value
            }
        },

        props: {
            nodeViews: {
                link: (node, ...args) => createLinkView(node as pmNode, args[0], args[1] as (() => number), emitter)
            }
        }
    })
}

function linkReducer(meta: IMeta<linkMeta>, value: linkState): linkState {
    const { action } = meta
    switch(action) {
        case 'create link': {
            const { view } = meta.payload
            return {
                ...value,
                activeLink: view
            }
        }
    }
}