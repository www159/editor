import { WrapCmdFunc } from "@editor/core"
import { toggleMark as rawToggleMark } from "prosemirror-commands"
import { ContentMatch, MarkType, NodeType } from "prosemirror-model"
import { wrapRaw } from "../commandsHelper"

export function defaultBlockAt(contentMath: ContentMatch): NodeType | null {
    for(let i = 0; i < contentMath.edgeCount; i++) {
        let { type } = contentMath.edge(i)
        if(type.isTextblock && !type.hasRequiredAttrs()) {
            return type
        }
    }
    return null
}

export const toggleMark = (type: MarkType, attrs?: { [key: string]: any }): WrapCmdFunc => wrapRaw(rawToggleMark(type, attrs)) 