import { NodeType } from "prosemirror-model";
import { EditorState, NodeSelection } from "prosemirror-state";
import { DispatchFunc } from "@editor/core";
import { Command } from "prosemirror-commands";

export function insertMathCmd(mathNodeType: NodeType, initialText = ''): Command {
    return function(state: EditorState, dispatch: DispatchFunc) {
        let { $from } = state.selection,
            index = $from.index() 

        if(!$from.parent.canReplaceWith(index, index, mathNodeType)) {
            return false
        }

        if(dispatch) {
            let mathNode = mathNodeType.create(
                {}, 
                initialText ? state.schema.text(initialText) : null 
                )
            let { tr } = state
            
            dispatch(tr.setSelection(NodeSelection.create(tr.doc, $from.pos)))
        }

        return true
    }
}