import { DispatchFunc, EditorEvents, WSchema, EventEmitter, EditorEmitter } from "@editor/core";
import { css } from "@editor/core/utils/stringRenderer";
import { createWrapper, inlineBound, makeTextFragment, multiSteps, parentPos, Procedure, setStyle } from "@editor/utils";
import { Command } from "prosemirror-commands";
import { NodeRange, NodeType, Fragment, Slice, pmNode } from "prosemirror-model";
import { AllSelection, EditorState, NodeSelection, Selection, SelectionRange, TextSelection } from "prosemirror-state";
import { findWrapping, ReplaceStep, ReplaceAroundStep, Step } from 'prosemirror-transform'
import { EditorView } from "prosemirror-view";
import { linkState, LINK_PLUGIN_KEY } from "./linkState";

export function wrapInLink(linkType: NodeType, schema: WSchema, emitter: EventEmitter<EditorEvents>): Command {
    return (state, dispatch) => {
        const { $from, $to } = state.selection
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
        if(overlapLink(state, linkType, schema, emitter, dispatch)) return false
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
function overlapLink(state: EditorState, linkType: NodeType, schema: WSchema, emitter: EditorEmitter, dispatch?: DispatchFunc) {
    let { $from, $to } = state.selection
    const fromLap = $from.parent.type === linkType
    const toLap = $to.parent.type === linkType
    if(fromLap || toLap) {
        if(!(fromLap && toLap) && dispatch) dispatch(state.tr.setSelection(new NodeSelection(parentPos(fromLap ? $from : $to))))
        emitter.emitPort('layer', 'layer', "link边缘不能重叠", 800, 'WRONG')
        return false
    }
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

//快捷键进入prompt
export function wakeUpPrompt(view: EditorView<WSchema>, schema: WSchema, emitter: EditorEmitter): Command { 
    return (state, dispatch) => {
        const { selection, tr } = state
        const { $from, $to } = selection

        if(!$from.sameParent($to)) return false
        /*
        +++++LAST STEP: in the same link+++++
        
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

        const range = $from.blockRange($to)
        let linkParent = $from.parent
        const linkIsParent = linkParent.type === schema.nodes.link
        if(!linkIsParent) return false
        /*
        +++++LAST STEP: link is parent+++++
        
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

        if(!range) return false
        /*
        +++++LAST STEP: have range+++++
        
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
            const { start } = range
            // console.log(start, state.doc.nodeAt(start))
            const { href, title } = linkParent.attrs
            const { prompt } = LINK_PLUGIN_KEY.getState(state) as linkState
            const { left, right, bottom } = inlineBound(view, start - 1)
            const { width } = prompt.getBoundingClientRect()
            setStyle(prompt, css`
              display: '';
              left: ${right - left < width ? right - width : left}px;
              top: ${bottom}px;
            `)
            /*
            +++++LAST STEP: show prompt+++++
            
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
            emitter.emitPort('link', 'popup input', href, title)
            dispatch(tr.setMeta(LINK_PLUGIN_KEY, {
                action: 'active link input',
                payload: {
                    pos: start
                }
            }))
        }
        return true
    }
}