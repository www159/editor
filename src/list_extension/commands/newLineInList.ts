import { DispatchFunc, WrapCmdFunc } from "@editor/core";
import { Enter } from "@editor/core/common/basicKeymap";
import { nodesFromState } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { Fragment, NodeRange, NodeType, Slice } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { ReplaceAroundStep, findWrapping } from 'prosemirror-transform'

export const newLineInList = (itemType: NodeType): WrapCmdFunc => ({ state, serial }) => {
    let { $from, $to } = state.selection,
        grandParent = $from.node(-1)
        // { list_item } = nodesFromState(state)

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
    return serial(Enter)
}