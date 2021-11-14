import { ExtensionType } from "@editor/core";
import { MarkSpec, NodeSpec, Schema } from "prosemirror-model";

export function getType(obj: { [name: string]: NodeSpec | MarkSpec } | undefined, schema: Schema) {
    // console.log(schema, obj)
    if(!obj) {
        return null
    }
    return schema.nodes[Object.keys(obj as { [name: string]: NodeSpec | MarkSpec })[0]]
}