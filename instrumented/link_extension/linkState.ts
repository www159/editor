import { EventEmitter } from "@editor/core";
import { pmNode, Schema } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { LinkView } from "./linkView";

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
    return new LinkView(node, view, getPos, emitter)
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

                return value
            }
        },

        filterTransaction(tr, state) {
            console.log(tr)
            return true
        },

        props: {
            nodeViews: {
                link: (node, ...args) => createLinkView(node as pmNode, args[0], args[1] as (() => number), emitter)
            }
        }
    })
}