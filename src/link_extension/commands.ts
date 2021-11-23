import { DispatchFunc } from "@editor/core";
import { Procedure } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { NodeType } from "prosemirror-model";
import { EditorState, SelectionRange } from "prosemirror-state";
import { findWrapping } from 'prosemirror-transform'

export function wrapInLink(linkType: NodeType): Command {
    return (state: EditorState, dispatch?: DispatchFunc) => {
        let { $from, $to } = state.selection

        let canDispatch = new Procedure({ $from, $to })
        .then(({ $from, $to }) => {
            let dpos = $to.pos - $from.pos
            if(dpos === 0) return false
            let range = new SelectionRange($from, $to)
            return { range }
        })
        .then(({ range }) => {
            let { parent } =$from
            // if(parent.contentMatchAt)
            
        })

        console.log(1)
        return true
    }
}