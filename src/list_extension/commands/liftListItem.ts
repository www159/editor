import { DispatchFunc, Realize } from "@editor/core";
import { useFakeServer } from "cypress/types/sinon";
import { Command } from "prosemirror-commands";
import { Fragment, NodeRange, NodeType, pmNode, Slice } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { ReplaceAroundStep, liftTarget } from 'prosemirror-transform'

export function liftListItem(itemType: NodeType): Command {
    return function(state: EditorState, dispatch: DispatchFunc) {
        let { $from, $to } = state.selection,
            range = $from.blockRange($to, node => !!node.childCount && node.firstChild?.type === itemType)
        if(!range) return false
        if(!dispatch) return true
        if($from.node(range.depth - 1).type === itemType)
            return liftToOuterList(state, dispatch, itemType, range)
        else 
            return liftOutOfList(state, dispatch, range)
    }
}

function liftToOuterList(
    state: EditorState,
    dispatch: DispatchFunc,
    itemType: NodeType,
    range: NodeRange 
): boolean {
    let { tr } = state,
        { end } = range,
        endOfList = range.$to.end(range.depth)
    if(end < endOfList) {
        tr.step(
            new ReplaceAroundStep(
                end - 1,
                endOfList,
                end,
                endOfList,
                new Slice(
                    Fragment.from(
                        itemType.create(null, range.parent.copy())
                    ),
                    1,
                    0
                ),
                1,
                true
            )
        )
        range = new NodeRange(
            tr.doc.resolve(range.$from.pos),
            tr.doc.resolve(endOfList),
            range.depth
        )
    }

    dispatch && dispatch(tr.lift(range, liftTarget(range) as number).scrollIntoView())
    return true
}

function liftOutOfList(
    state: EditorState,
    dispatch: DispatchFunc,
    range: NodeRange
): boolean {
    let { tr } = state,
        list = range.parent

    for(let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
        pos -= list.child(i).nodeSize
        tr.delete(pos - 1, pos + 1)
    }
    let $start = tr.doc.resolve(range.start),
        item = $start.nodeAfter as pmNode

    if(tr.mapping.map(range.end) !== range.start + (item.nodeSize as number)) 
        return false
    let atStart = range.startIndex === 0,
        atEnd = range.endIndex === list.childCount,
        parent = $start.node(-1),
        indexBefore = $start.index(-1)
    
    if(
        !parent.canReplace(
            indexBefore + (atStart ? 0 : 1),
            indexBefore + 1,
            item.content.append(
                atEnd ? Fragment.empty : Fragment.from(list)
            )
        )
    ) {
        return false
    }

    let start = $start.pos,
        end = start + item.nodeSize
    tr.step(
        new ReplaceAroundStep(
            start - (atStart ? 1 : 0),
            end + (atEnd ? 1 : 0),
            start + 1,
            end - 1,
            new Slice(
                (atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)))
                .append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))),
                atStart ? 0 : 1,
                atEnd ? 0 : 1
            ),
            atStart ? 0 : 1,
            true
        )
    )

    if(dispatch) {
        dispatch(tr.scrollIntoView())
    }
    return true
}