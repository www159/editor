import { DispatchFunc, Realize } from "@editor/core";
import { createWrapper } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { Fragment, NodeRange, NodeType, Slice } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { findWrapping, ReplaceAroundStep, canSplit, canJoin } from 'prosemirror-transform'

/*********************************** 包裹函数 ***********************************/

export function wrapInList(listType: NodeType, attrs?: { [name: string]: any }): Command {
    return (state: EditorState, dispatch: DispatchFunc) => {
        let { $from, $to } = state.selection
        let range = $from.blockRange($to),
            doJoin = false,
            outerRange = range

        // console.log(range?.depth)
        if(!range) return false
        if(
            range.depth >= 2 &&
            $from.node(range.depth - 1).type.compatibleContent(listType) &&
            range.startIndex === 0
        ) {
            if($from.index(range.depth - 1) == 0) return false
            let $insert = state.doc.resolve(range.$from.before())
            outerRange = new NodeRange($insert, $insert, range.depth)
            if(range.endIndex < range.parent.childCount) {
                range = new NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth)
            }
            doJoin = true
        }

        // debugger
        let wrap = findWrapping(outerRange as NodeRange, listType, attrs, range)
        // console.log(wrap)
        if(!wrap) return false
        if(dispatch) {
            dispatch(
                doWrapInList(
                    state.tr,
                    range,
                    wrap,
                    doJoin,
                    listType
                )
                .scrollIntoView()
            )
        }
        return true
    }
}

    

/*********************************** 内部函数（包裹） ***********************************/

function doWrapInList(
    tr: Transaction,
    range: NodeRange,
    wrappers: Realize<ReturnType<typeof findWrapping>>,
    joinBefore: boolean,
    listType: NodeType
): Transaction {
    const content = createWrapper(wrappers)
    
    // console.log(range.start, range.end)
    // console.log(wrappers, range)

    tr.step(new ReplaceAroundStep(
        range.start - (joinBefore ? 2 : 0),
        range.end,
        range.start,
        range.end,
        new Slice(content, 0, 0),
        wrappers.length,
        true
    ))

    let found = 0
    for(let i = 0; i < wrappers.length; i++) {
        if(wrappers[i].type == listType) found = i + 1
    }

    // debugger
    
    let splitDepth = wrappers.length - found,
    splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0),
    parent = range.parent
    
    for(let i = range.startIndex, e = range.endIndex, first = true; i < e; i++, first = false) {
        if(!first && canSplit(tr.doc, splitPos, splitDepth)) {
            tr.split(splitPos, splitDepth)
            splitPos += 2 * splitDepth
        }
        splitPos += parent.child(i).nodeSize
    }
    
    let { nodeBefore } = tr.doc.resolve(range.start)
    if(nodeBefore?.type === listType && canJoin(tr.doc, range.start)) {
        tr.join(range.start, 1)
    }
    return tr
}