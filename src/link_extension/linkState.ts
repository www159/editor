import { EditorEmitter, EditorEvents, EventEmitter } from "@editor/core";
import { pmFetch, reactDirAttach, setStyle } from "@editor/utils";
import { css } from "@editor/core/utils/stringRenderer";
import { pmNode, Schema } from "prosemirror-model";
import { IMeta, Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import HrefPrompt from "./HrefPrompt";
import { LinkView } from "./LinkView";

interface linkState {
    storedLink: WeakMap<pmNode, LinkView>,
    activeLink: LinkView | null
    prompt: HTMLDivElement
}

interface linkMeta {
    'create link': {
        view: LinkView
    }
}

export const LINK_PLUGIN_KEY = new PluginKey<linkState, Schema, linkMeta>('link plugin key')

function createLinkView(node: pmNode, view: EditorView, getPos: () => number, emitter: EditorEmitter, prompt: HTMLDivElement) {
    const linkView = new LinkView(node, view, getPos, emitter, prompt)
    const { state } = view
    const { storedLink } = LINK_PLUGIN_KEY.getState(state) as linkState
    storedLink.set(node, linkView)
    return linkView
}

export function createLinkPlugin(emitter: EditorEmitter, topDOM: HTMLElement) {
    return new Plugin<linkState, Schema, linkMeta>({

        key: LINK_PLUGIN_KEY,

        state: {
            init(_, __) {
                const prompt = topDOM.appendChild(document.createElement('div'))
                prompt.className = 'link-tip-wrapper'
                setStyle(prompt, css`display: none`)
                reactDirAttach(HrefPrompt, { emitter }, prompt)
                return {
                    storedLink: new WeakMap,
                    activeLink: null,
                    prompt
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
                link: (node, view, getPos) => createLinkView(node as pmNode, view, getPos as (() => number), emitter, (LINK_PLUGIN_KEY.getState(view.state) as linkState).prompt)
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