import { DispatchFunc } from "@editor/core";
import { createWrapper, makeTextFragment, Procedure } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { NodeRange, NodeType, Fragment, Slice } from "prosemirror-model";
import { EditorState, SelectionRange } from "prosemirror-state";
import { findWrapping, ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform'

export function wrapInLink(linkType: NodeType): Command {
    return (state: EditorState, dispatch?: DispatchFunc) => {
        let { $from, $to } = state.selection

        if($to.pos - $from.pos === 0) return false

        const range = new NodeRange($from, $to, $from.depth)
        const wrappers = findWrapping(range, linkType)
        if(!wrappers) return false

        const content = createWrapper(wrappers)
        const { tr } = state
        const { start, end } = range
        tr.step(new ReplaceAroundStep(
            start,
            end,
            start,
            end,
            new Slice(content, 0, 0),
            wrappers.length,
            true
        ))
        
        if(dispatch) {
            dispatch(tr.scrollIntoView())
        }

        return true
    }
}