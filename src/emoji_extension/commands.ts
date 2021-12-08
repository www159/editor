import { DispatchFunc, Editor, WrapCmdFunc } from "@editor/core";
import { hyperCmdBind } from "@editor/core/commandsHelper";
import { nodesFromEditor, nodesFromState, serialCommands } from "@editor/utils";
import { Command, selectNodeBackward, selectNodeForward } from "prosemirror-commands";
import { NodeType, pmNode } from "prosemirror-model";
import { EditorState, NodeSelection, Selection } from "prosemirror-state";
import { ESCAPE_KEY } from ".";
import { EMOJI_STATE_KEY } from "./emojiState";

export const escapeBar = (key: ESCAPE_KEY): WrapCmdFunc => ({ state, dispatch }) => {
    const { selection, tr } = state
    const { emoji } = nodesFromState(state)
    if(selection.to - selection.from !== 2) return false
    const { $from: { parent, parentOffset } } = selection
    const node = parent.nodeAt(parentOffset)
    if(node?.type !== emoji) return false
    if(dispatch) {
        dispatch(tr.setMeta(EMOJI_STATE_KEY, {
            action: "escape",
            payload: {
                node,
                key,
            }
        }))
    }
    return true
}

// export const escapeBar = hyperCmdBind(hyperEscapeBar)

export const insertEmoji: WrapCmdFunc = ({ state, dispatch }) => {
    const { emoji } = nodesFromState(state)
    const { tr } = state
    const { selection: { $from, $to, from, to } } = tr
    const parent = $from.parent
    
    if(!parent.canReplaceWith($from.index(), $to.index(), emoji)) return false
    if(dispatch) {
        tr
        .replaceRangeWith(from, to, emoji.create({ index: 0 }))
        .setSelection(NodeSelection.create(tr.doc, tr.mapping.map(from, -1)))
        .scrollIntoView()
        dispatch(tr)
    }
    return true
}