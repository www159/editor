import { Selection, Plugin, EditorState } from 'prosemirror-state'
import { pmNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

type CheckSelectionParams = {
    selection: Selection,
    doc: pmNode,
}

const checkSelection = (arg: CheckSelectionParams) => {
    let { selection: { from, to } } = arg
    let content = arg.selection.content().content
    let result = new Array<{ start: number, end: number }>()

    content.descendants((node, pos, parent) => {
        if(node.type.name === 'text') return false
        if(node.type.name.startsWith('math_')) {
            result.push({
                start: Math.max(from + pos - 1, 0),
                end: from + pos + node.nodeSize - 1,
            })
            return false
        }

        return true
    })

    return DecorationSet.create(arg.doc, result.map(
        ({start, end}) => Decoration.node(start, end, { class: 'math-select' })
    ))
}

export const mathSelectPlugin: Plugin<DecorationSet> = new Plugin<DecorationSet>({
    state: {
        init(config, instanse) {
            return checkSelection(instanse)
        },
        apply(tr, oldDecoSet) {
            if(!tr.selection || !tr.selectionSet) return oldDecoSet
            return checkSelection(tr)
        }
    },

    props: {
        decorations: (state: EditorState) => mathSelectPlugin.getState(state)
    }
})