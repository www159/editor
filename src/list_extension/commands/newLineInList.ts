import { DispatchFunc } from "@editor/core";
import { Enter } from "@editor/core/common/basicKeymap";
import { Command } from "prosemirror-commands";
import { Fragment, NodeRange, NodeType, Slice } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { ReplaceAroundStep, findWrapping } from 'prosemirror-transform'

export function newLineInList(itemType: NodeType): Command {
    return function(state: EditorState, dispatch: DispatchFunc) {
        let { $from, $to } = state.selection,
            { parent } = $from,
            grandParent = $from.node(-1),
            wrapType = $from.parent.type
        if(
            $from.depth < 2 ||
            grandParent.type !== itemType ||
            !$from.sameParent($to) 
        ) {
            return false
        }
        /*
        +++++LAST STEP: 在list中+++++
        
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
        return Enter(state, dispatch)
    }
}