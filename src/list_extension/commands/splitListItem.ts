import { DispatchFunc } from "@editor/core";
import { Command } from "prosemirror-commands";
import { Fragment, NodeType, pmNode, Slice } from "prosemirror-model";
import { EditorState, NodeSelection, Selection, TextSelection } from "prosemirror-state";
import { canSplit } from 'prosemirror-transform'

export function splitListItem(itemType: NodeType): Command {
    return function(state: EditorState, dispatch: DispatchFunc) {
        // debugger
        let { $from, $to, node } = state.selection as NodeSelection
        if(
            (node && node.isBlock) ||   //满足content
            $from.depth < 2 ||          //不在list中
            !$from.sameParent($to)       //不在同一个list中
        ) {
            return false
        }
        /*
        +++++LAST STEP: 在同一个list中+++++
        
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
        let grandParent = $from.node(-1)
        //保证当前在list-item中
        if(grandParent.type !== itemType) {
            return false
        }
        /*
        +++++LAST STEP: 在listItem中+++++
        
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
        if(
            $from.parent.content.size === 0 &&              //list-item没有内容
            grandParent.childCount == $from.indexAfter(-1)  //是最后一个li
        ) {
            if(
                $from.depth == 2 ||
                $from.node(-3).type !== itemType ||
                $from.index(-2) !== $from.node(-2).childCount - 1
            ) {
                return false
            }
            /*
            +++++LAST STEP: 内容为空则交给默认enter+++++
            
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

            /**
             * 是嵌套节点则需要退化为上一层的后继
             */
            if(dispatch) {
                let wrap = Fragment.empty,
                    depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3,            //本层的一般深度（不排除block里套block）
                    depthAfter  = $from.indexAfter(-1) < $from.node(-2).childCount ? 
                    1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 
                    2 : 3,          //上一层的相对深度
                    start = $from.before($from.depth - depthBefore + 1)

                //层层嵌套,构造新的list-item。该list-item在上上上上层
                for(let d = $from.depth - depthBefore; d >= $from.depth - 3; d--) {
                    wrap = Fragment.from($from.node(d).copy(wrap))
                }
                wrap = wrap.append(Fragment.from(itemType.createAndFill() as pmNode))
                let tr = state.tr.replace(
                    start, 
                    $from.after(-depthAfter),
                    new Slice(wrap, 4 - depthBefore, 0)
                    ),
                    sel = -1

                tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
                    if(sel > -1) return false
                    if(node.isTextblock && node.content.size === 0) {
                        sel = pos + 1
                    }
                })

                if(sel > -1) {
                    tr.setSelection(Selection.near(tr.doc.resolve(sel)))
                }
                dispatch(tr.scrollIntoView())
            }
            return true
        }
        /**
         * 如果当前节点不为空，那么自动往下推一行
         * 如果从中间切断(按回车)还需要分裂节点
         * grandParent即itemtype
         */
        let nextItemType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null,      //获得默认节点
            tr = state.tr.delete($from.pos, $to.pos),        //删除选中区
            types = nextItemType && [ null, { type: nextItemType }]

        if(!canSplit(tr.doc, $from.pos, 2, types)) {
            return false
        } 
        /*
        +++++LAST STEP: 能够拆分listItem+++++
        
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
        tr.split($from.pos, 2, types)
        let { $to: afterSplit$to } = tr.selection
        afterSplit$to = tr.doc.resolve(afterSplit$to.end())
        if(dispatch) {
            dispatch(
                tr
                // .setSelection(new TextSelection(
                //     afterSplit$to,
                //     afterSplit$to
                // ))
                .scrollIntoView()
            )
        }
        return true
    }
}