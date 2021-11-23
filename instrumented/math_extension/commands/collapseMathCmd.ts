import { Command, createParagraphNear } from "prosemirror-commands";
import { EditorState, Selection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DispatchFunc } from "@editor/core";
import { displayMode } from "../mathPlugin";
import { Procedure } from "@editor/utils";
export function collaspeMathCmd(
    outerView: EditorView,
    dir: (1 | -1),
    requireOnBorder: boolean,
    mode: boolean,
    requireEmptySelection: boolean = true,
): Command {
    return (innerState: EditorState, dispatch: DispatchFunc) => {
        // debugger
        let outerState = outerView.state
        let { to: outerTo, from: outerFrom } = outerState.selection
        let { to: innerTo, from: innerFrom } = innerState.selection

        // if(requireEmptySelection && innerTo !== innerFrom) {
        //     return false
        // }

        // debugger
        let canDispatch = new Procedure({ requireEmptySelection, innerTo, innerFrom, dir })
        //是否为空选区
        .then(({ requireEmptySelection, innerTo, innerFrom, dir }) => {
            if(requireEmptySelection && innerTo !== innerFrom) return false
            return {
                // currentPos: (dir > 0) ? innerTo : innerFrom,
                requireOnBorder
            }
        })
        //是否需要边界
        .then(({ requireOnBorder }) => {
            if(requireOnBorder) {
                return new Procedure({ currentPos: (dir > 0 ? innerTo : innerFrom), dir, innerState })
                .then(({ currentPos, dir, innerState }) => {
                    let nodeSize = innerState.doc.nodeSize 
                    if(dir > 0 && currentPos < nodeSize) return false
                    if(dir < 0 && currentPos > 0) return false
                })
                .final()
            }
        })
        .final()

        // let currentPos = (dir > 0) ? innerTo : innerFrom
        
        // if(requireOnBorder) {
        //     let nodeSize = innerState.doc.nodeSize - 2
        //     if(dir > 0 && currentPos < nodeSize) return false
        //     if(dir < 0 && currentPos > 0) return false
        // }
        if(!canDispatch) return false

        if(dispatch) {
            let targetPos = (dir > 0) ? outerTo : outerFrom

            if(!outerState.doc.nodeAt(targetPos) && mode === displayMode.display) {
                let flag = createParagraphNear(outerState, outerView.dispatch)
                if(flag && dir > 0) 
                    outerView.focus()
                return flag
            }

            outerView.dispatch(
                outerState.tr.setSelection(
                    Selection.near(outerState.doc.resolve(targetPos), dir)
                )
            )

            outerView.focus()
        }
        return true
    }
}
