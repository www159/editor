import { InputRulesFunc } from "@editor/core";
import { InputRule } from "prosemirror-inputrules";
import { NodeType } from "prosemirror-model";
import { NodeSelection } from "prosemirror-state";

const EMOJI_REGEX = /::\s$/

export const emojiInputRule = (type: NodeType) => (new InputRule(
    EMOJI_REGEX, 
    (state, match, start, end) => {
        let $start = state.doc.resolve(start),
            $end = state.doc.resolve(end),
            { tr } = state
        console.log('create')
        console.log($start.parent.toJSON())
        if(!$start.parent.canReplaceWith($start.index(), $end.index(), type))
            return null

        tr.replaceRangeWith(start, end, type.create())
        return tr.setSelection(NodeSelection.create(tr.doc, start))
    }
))