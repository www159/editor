import type { NodeType } from 'prosemirror-model'
import { InputRule } from 'prosemirror-inputrules'
import { NodeSelection } from 'prosemirror-state'
// import { InputRuleSpec } from '@editor/core/types'
/////////////////////////////////////////////////////////////////

export const REGEX_INLINE_MATH_DOLLARS = /\$(.+)\$/
export const REGEX_INLINE_MATH_DOLLARS_ESCAPED = (() => {
    try      { return /(?<!\\\\)\$(.+)(?<!\\\\)\$/ }
    catch(e) { return REGEX_INLINE_MATH_DOLLARS }
})()

export const REGEX_INLINE_MATH_DOLLARS_LITE = /(?<!\$)\$\s+$/

export const REGEX_BLOCK_MATH_DOLLARS = /\$\$\s+$/

//////////////////////////////////////////////////////////////////

export function makeBlockMathInputrule(
    pattern: RegExp, 
    nodeType: NodeType, 
    getAttrs?:Object | ((math: Array<string>) => any)) {
        return new InputRule(
            pattern,
            (state, match, start, end) => {
                // console.log(1)
                // console.log('math')
                let $start = state.doc.resolve(start)
                let attrs = getAttrs instanceof Function ? getAttrs(match): getAttrs
                // debugger
                if((!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType))) return null
                if(nodeType.name === 'math_display') {
                    if($start.parentOffset !== 0) {
                        return null
                    }
                }
                let tr = state.tr
                        .delete(start, end)
                        .setBlockType(start, start, nodeType, attrs)
                return tr.setSelection(NodeSelection.create(
                            tr.doc, tr.mapping.map($start.pos - 1)
                        ))
            }
        )
    }

////////////////////////////////////////////////////////////////

export function makeInlineMathInputRule(
    pattern: RegExp, 
    nodeType: NodeType, 
    getAttrs?:Object | ((math: Array<string>) => any)) {
        return new InputRule(
            pattern,
            (state, match, start, end) => {
                let $start = state.doc.resolve(start),
                $end = state.doc.resolve(end),
                index = $start.index()
                // debugger
                let attrs = getAttrs instanceof Function ? getAttrs(match): getAttrs
                // console.log(index, $end.index())
                if(!$start.parent.canReplaceWith(index, $end.index(), nodeType)) {
                    return null
                }  

                let matchLite = REGEX_INLINE_MATH_DOLLARS_LITE.test(match[0]),
                    tr = state.tr.replaceRangeWith(
                    start, end,
                    matchLite ?
                    nodeType.create(attrs):
                    nodeType.create(attrs, nodeType.schema.text(match[1]))
                )
                return tr.setSelection(NodeSelection.create(tr.doc, $start.pos))
            }
        )
    }

// export const InlineMathInputRule: InputRuleSpec = {
//     nodeName: 'math_inline',
//     regex: REGEX_INLINE_MATH_DOLLARS_ESCAPED,
//     ruleWrap: makeInlineMathInputRule,
// }