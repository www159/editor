import { DispatchFunc, WrapCmdFunc } from "@editor/core";
import { Backspace } from "@editor/core/common/basicKeymap";
import { nodesFromState, serialCommands } from "@editor/utils";
import { chainCommands, Command } from "prosemirror-commands";
import { NodeType, pmNode, Slice } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { liftListItem } from "./liftListItem";
import { sinkListItem } from "./sinkListItem";


export const deleteListItem = (itemType: NodeType): WrapCmdFunc => ({state, serial}) => {
    
    let { $from, $to } = state.selection,
        grandParent = $from.node(-1)
        
    if(
        $from.depth < 2 ||
        grandParent.type !== itemType ||
        ($from.parent.type !== itemType &&  $from.index(-1) !== 0) ||
        !$from.sameParent($to)  ||
        $from.parentOffset 
    ) {
        return false
    }
    /*
    +++++LAST STEP: 不在list中，选区节点同级+++++
    
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
    //如果被上一层嵌套或者在开头
    if(
        ((grandParent.type === itemType &&
        $from.parent.childCount) ||
        ($from.node(-5) && 
        $from.node(-5).type === itemType)) &&
        !$from.index(-2)
    ) {
        let wrapperNode = $from.node(-2)
        if(wrapperNode.firstChild?.type === itemType) {
            return serial(liftListItem(itemType))
        }
    }
    //如果和上一层同级
    return serial(Backspace, Backspace)
}