import { DispatchFunc, WrapCmdFunc } from "@editor/core";
import { nodesFromState } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { Fragment, NodeType, Slice, pmNode } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { ReplaceAroundStep } from 'prosemirror-transform'
import { getNextAttr } from "../utils/getNextAttr";

/**
 * 
 * @param listType 
 * @returns {Command}
 * 下沉list
 * - 如果不在list中，创建list
 * - 如果在list中，延续上层的type生成相应的attr，从list-item跳到*-list
 */
export const sinkListItem = (itemType: NodeType): WrapCmdFunc => ({ state, dispatch }) => {
    let { $from, $to } = state.selection,
        range = $from.blockRange($to, node => node.childCount !== 0 && node.firstChild?.type == itemType)
    if(!range) return false
    /*
    +++++LAST STEP: 选区在list中+++++
    
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
    let { startIndex, parent } = range
    if(startIndex === 0) return false
    /*
    +++++LAST STEP: 不是list中第一个节点+++++
    
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
    let nodeBefore = parent.child(startIndex - 1)
    if(nodeBefore.type !== itemType) return false
    /*
    +++++LAST STEP: 不是list中第一个listItem+++++
    
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
        //如果上一个节点也是嵌套的话，融入上一个节点
        // debugger
        let isLastNested = nodeBefore.lastChild && nodeBefore.lastChild.type == parent.type,
            inner = Fragment.from(isLastNested ? itemType.create() as pmNode : undefined),
            slice = new Slice(
                Fragment.from(itemType.create(null, Fragment.from(parent.type.create(getNextAttr(parent), inner)))),
                isLastNested ? 3 : 1,
                0
            ),
            before = range.start,
            after = range.end
        dispatch(state.tr.step(new ReplaceAroundStep(
            before - (isLastNested ? 3 : 1),
            after,
            before,
            after,
            slice,
            1,
            true
        )).scrollIntoView())
    }
    return true
}