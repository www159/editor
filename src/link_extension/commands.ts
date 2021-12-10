import { WrapCmdFunc } from "@editor/core";
import { css } from "@editor/core/utils/stringRenderer";
import { appendStyle, inlineBound, multiSteps, nodesFromState, setStyle, wakeUpBar } from "@editor/utils";
import { NodeRange, NodeType, Fragment, Slice, pmNode, Schema } from "prosemirror-model";
import { TextSelection } from "prosemirror-state";
import { findWrapping, ReplaceStep } from 'prosemirror-transform'
import { linkState, LINK_PLUGIN_KEY } from "./linkState";

export const setLink: WrapCmdFunc = ({ state, dispatch }) => {
    const { tr } = state
    const { link } = nodesFromState(state)
    const { $from, $to } = tr.selection
    if($to.pos - $from.pos === 0) return false
    
    const range = new NodeRange($from, $to, $from.depth)
    const wrappers = findWrapping(range, link)
    if(!wrappers) return false
    if(dispatch) {
        // const content = createWrapper(wrappers)
        const { tr } = state
        const { start, end } = range
        tr
        .wrap(range, wrappers)
        .setSelection(TextSelection.create(tr.doc, tr.mapping.map(start), tr.mapping.map(end, -1)))
        .scrollIntoView()
        dispatch(tr)
    }
    // console.log(tr.steps)
    return true
} 

// function wrappingLink(start, end)

const unsetLink: WrapCmdFunc = ({ state, dispatch }) => {
    const {$from, $to} = state.selection
    const { schema } = state
    const { link } = schema.nodes
    let fromNextPos = $from.pos
    let toPrevPos = $to.pos
    const { tr } = state
    let containerLink = false
    // console.log('same p', $from.sameParent($to))
    if($from.parent.type === link && $from.sameParent($to)) {
      fromNextPos = $from.before()
      toPrevPos = $to.after()
    }
    // console.log({fromNextPos, toPrevPos})
    if(dispatch) {
        const clearLink: ReplaceStep[] = []
        tr.doc.nodesBetween(fromNextPos, toPrevPos, (node, pos, parent) => {
            if(parent.type === schema.nodes.doc) return true;
            
            if(node.type === link) {
                //如果是linknode，则取消改节点。
                let $pos = tr.doc.resolve(pos + 1)
                const start = pos, end = pos + node.nodeSize
                // tr.maybeStep(new ReplaceStep(start, end, new Slice(node.content, 0, 0)))
                clearLink.push(new ReplaceStep(start, end, new Slice(node.content, 0, 0)))
                containerLink = true
                return false
            }
            return true
        })
        multiSteps(tr, clearLink)
        const fromMappingPos = tr.mapping.map(fromNextPos)
        const toMappingPos = tr.mapping.map(toPrevPos)
        containerLink && dispatch(tr.setSelection(TextSelection.create(tr.doc, fromMappingPos, toMappingPos)))
    }
    return containerLink
}

//如果出现重叠，重新分配选区。
const overlapLink: WrapCmdFunc = ({ emitter, state }) => {
    let { $from, $to } = state.selection
    const { link } = nodesFromState(state)
    const fromLap = $from.parent.type === link
    const toLap = $to.parent.type === link
    const embed = $from.sameParent($to)
    if(fromLap && toLap && !embed) {
        emitter.emitPort('layer', 'layer', "link边缘不能重叠", 800, 'WRONG')
        return true
    }
    return false
}

//快捷键进入prompt
export const wakeUpLinkPrompt: WrapCmdFunc = ({ emitter, state, view, dispatch }) => { 
    const { schema } = state
    const { selection, tr } = state
    const { $from, $to } = selection
    //@ts-ignore
    // console.log(state.doc.toString(), '\n', tr.docs)
    if(!$from.sameParent($to)) return false
    const range = $from.blockRange($to)
    let linkParent = tr.selection.$from.parent
    const linkIsParent = linkParent.type === schema.nodes.link
    // console.log('wakeUp', tr.selection.toJSON())
    if(!linkIsParent) return false
    if(!range) return false
    if(dispatch) {
        const { start } = range
        // console.log(start, state.doc.nodeAt(start))
        const { href, title } = linkParent.attrs
        const { prompt } = LINK_PLUGIN_KEY.getState(state) as linkState
        wakeUpBar(prompt, view, start)
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



export const setLink_WakeUpLinkPrompt: WrapCmdFunc = ({ serial }) => serial(setLink, wakeUpLinkPrompt)

export const removeLinkPrompt: WrapCmdFunc = ({ emitter, state }) => {
    const { activePos } = LINK_PLUGIN_KEY.getState(state) as linkState
    if(activePos !== null) {
        emitter.emitPort('link', 'leave input by click')
        return true
    }
    return false
}


export const toggleLink: WrapCmdFunc = ({ select }) => select(overlapLink, unsetLink, setLink_WakeUpLinkPrompt)
