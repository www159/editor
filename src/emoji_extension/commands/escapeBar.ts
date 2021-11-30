import { DispatchFunc } from "@editor/core";
import { NodeType, pmNode } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { ESCAPE_KEY } from "..";
import { EMOJI_STATE_KEY } from "../emojiState";

export const escapeBar = (type: NodeType, key: ESCAPE_KEY) => (state: EditorState, dispatch?: DispatchFunc) => {
    const { selection, tr } = state
    if(selection.to - selection.from !== 2) return false
    /*
    +++++LAST STEP: 选中的是节点+++++

                  +------+
                  |------|
                  |------|
                  |------|
              *---+------+---*
               *------------*
                 *--------*
                   *----*
                     **
    */
    const { $from, $from: { parent, parentOffset } } = selection
    const node = parent.nodeAt(parentOffset)
    if(node?.type !== type) return false
    /*
    +++++LAST STEP: 选中的是emoji+++++
    
                  +------+
                  |------|
                  |------|
                  |------|
              *---+------+---*
               *------------*
                 *--------*
                   *----*
                     **
    */
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