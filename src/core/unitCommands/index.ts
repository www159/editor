import { ContentMatch, NodeType } from "prosemirror-model"

export function defaultBlockAt(contentMath: ContentMatch): NodeType | null {
    for(let i = 0; i < contentMath.edgeCount; i++) {
        let { type } = contentMath.edge(i)
        if(type.isTextblock && !type.hasRequiredAttrs()) {
            return type
        }
    }
    return null
}