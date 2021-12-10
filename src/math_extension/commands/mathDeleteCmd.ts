import { Command } from "prosemirror-commands";
import { EditorState, NodeSelection } from "prosemirror-state";
import { DispatchFunc, WrapCmdFunc } from "@editor/core";
import { Procedure } from "@editor/utils";

export const mathDeleteCmd: WrapCmdFunc = ({ state, dispatch }) => {
    let { $from } = state.selection
    let { nodeBefore } = $from
    let index = $from.index();
	let posBefore = $from.posAtIndex(index-1)

	if(!nodeBefore) {
		posBefore = $from.posAtIndex($from.index(-1) - 1, -1)
		nodeBefore = state.doc.nodeAt(posBefore)
	}

	if(
		!nodeBefore                               ||
		(nodeBefore?.type.name !== 'math_display' && 
		nodeBefore?.type.name !== 'math_inline')  ||  
		(nodeBefore.type.name === 'math_display'  && 
		$from.parentOffset !== 0) 
	) {
		return false
	}


	let $posBefore = state.doc.resolve(posBefore)
	if(dispatch) {
		dispatch(state.tr.setSelection(new NodeSelection($posBefore)));
	}
	return true
}