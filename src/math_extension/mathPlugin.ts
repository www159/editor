import { Plugin, PluginKey } from 'prosemirror-state'
import { pmNode } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import { MathView } from './mathNodeview'

export interface MathPluginState {
    macros: Record<string, string>
    activeNodeViews: Array<MathView>
    prevCursorPos: number
}

export const MATH_PLUGIN_KEY = new PluginKey<MathPluginState>('prosemirror-math')

export const displayMode = {
    inline: false,
    display: true, 
}

export function createMathView(displayMode: boolean) {
    return (node: pmNode, view: EditorView, getPos: boolean | (() => number)): MathView => {
        let pluginState = MATH_PLUGIN_KEY.getState(view.state)
        if(!pluginState) { throw new Error('no math plugin!') }
        let nodeViews = pluginState.activeNodeViews

        let nodeView: MathView = new MathView(
            //@ts-ignore
            node, view, getPos as (() => number),
            displayMode,
            { katexOptions: {
                macros: pluginState.macros,
            }},
            MATH_PLUGIN_KEY,
            () => nodeViews.splice(nodeViews.indexOf(nodeView))
        )


        nodeViews.push(nodeView)
        return nodeView
    }
}

export const mathPlugin = new Plugin<MathPluginState>({
    key: MATH_PLUGIN_KEY,
    state: {
        init(config, instanse) {
            return {
                macros: {},
                activeNodeViews: [],
                prevCursorPos: 0,
            }
        },

        apply(tr, value, olbState, newState) {
            return {
                activeNodeViews: value.activeNodeViews,
                macros: value.macros,
                prevCursorPos: olbState.selection.from,
            }
        },
    },

    props:  {
        nodeViews: {
            'math_inline':(node, ...args) => createMathView(displayMode.inline)(node as pmNode, args[0], args[1]),
            'math_display': (node, ...args) => createMathView(displayMode.display)(node as pmNode, args[0], args[1]),
        },
    },
})