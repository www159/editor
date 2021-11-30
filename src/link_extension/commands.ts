import { DispatchFunc, EditorEvents, WSchema, EventEmitter } from "@editor/core";
import { createWrapper, makeTextFragment, multiSteps, Procedure } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { NodeRange, NodeType, Fragment, Slice } from "prosemirror-model";
import { EditorState, Selection, SelectionRange } from "prosemirror-state";
import { findWrapping, ReplaceStep, ReplaceAroundStep, Step } from 'prosemirror-transform'

export function wrapInLink(linkType: NodeType, schema: WSchema, emitter: EventEmitter<EditorEvents>): Command {
    return (state: EditorState, dispatch?: DispatchFunc) => {
        let { $from, $to } = state.selection
        if($to.pos - $from.pos === 0) return false
        /*
        +++++LAST STEP: 选区非空+++++
        
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
        if(overlapLink(state, linkType, schema, dispatch)) return false
        /*
        +++++LAST STEP: 选区没有和其他link重叠+++++
        
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
        const range = new NodeRange($from, $to, $from.depth)
        const wrappers = findWrapping(range, linkType)
        if(!wrappers) return false
        /*
        +++++LAST STEP: 选区能够被link包含+++++
        
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
            const content = createWrapper(wrappers)
            const { tr } = state
            const { start, end } = range
            tr.step(new ReplaceAroundStep(
                start,
                end,
                start,
                end,
                new Slice(content, 0, 0),
                wrappers.length,
                true
            ))
            dispatch(tr.scrollIntoView())
        }

        return true
    }
}

// function wrappingLink(start, end)

//如果出现重叠，重新分配选区。
function overlapLink(state: EditorState, linkType: NodeType, schema: WSchema, dispatch?: DispatchFunc) {
    let { $from, $to } = state.selection
    const fromLap = $from.parent.type === linkType
    const toLap = $to.parent.type === linkType
    if(fromLap || toLap) 
        return false
    /*
    +++++LAST STEP: 首位没有重叠+++++
    
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
    let fromNextPos = $from.pos
    let toPrevPos = $to.pos
    fromNextPos = fromNextPos > $to.pos ? $from.pos : fromNextPos
    toPrevPos = toPrevPos < $from.pos ? $to.pos : toPrevPos
    const { tr } = state
    let containerLink = false
    if(dispatch) {
        const clearLink: ReplaceStep[] = []
        tr.doc.nodesBetween(fromNextPos, toPrevPos, (node, pos, parent) => {
            // debugger
            if(parent.type === schema.nodes.doc) return true;
            console.log(node.type.name, pos)
            if(node.type === linkType) {
                //如果是linknode，则取消改节点。
                let $pos = tr.doc.resolve(pos + 1)
                const start = pos, end = pos + node.nodeSize
                clearLink.push(new ReplaceStep(start, end, new Slice(node.content, 0, 0)))
                containerLink = true
                return false
            }
            return true
        })

        multiSteps(tr, clearLink)
        dispatch(tr)
    }

    return containerLink
}