import { DispatchFunc } from "@editor/core";
import { Backspace } from "@editor/core/common/basicKeymap";
import { serialCommands } from "@editor/utils";
import { chainCommands, Command } from "prosemirror-commands";
import { NodeType, pmNode, Slice } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { liftListItem } from "./liftListItem";
import { sinkListItem } from "./sinkListItem";

export function deleteListItem(itemType: NodeType, view: EditorView): Command {
    return function(state: EditorState, dispatch: DispatchFunc) {
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
                return liftListItem(itemType)(state, dispatch)
            }
        }


        /**
         * 如果上一层被嵌套，则插入上一侧末尾
         */
        // console.log($from.nodeBefore?.lastChild)
        // let beforeItem = state.doc.resolve($from.before(-1)).nodeBefore as pmNode,
        //     lastChildOfBeforeItem = beforeItem && beforeItem.lastChild as pmNode,
        //     lastNested = lastChildOfBeforeItem && lastChildOfBeforeItem.content.child(0).type === itemType
        //如果和上一层同级
        return serialCommands(
            // lastNested ? 
            // sinkListItem(itemType) :
            // (state, dispatch) => true,
            Backspace,
            Backspace
        )(state, dispatch, view)
    }
}