import { Extension, ExtensionType } from "@editor/core";
import { MarkSpec, NodeSpec, NodeType, Schema } from "prosemirror-model";

export function getType(obj: { [name: string]: NodeSpec | MarkSpec } | undefined, schema: Schema, duckType: Extension['type']) {
    // console.log(schema, obj)
    if(!obj) {
        return null
    }
    
    const [key,] = Object.entries(obj as { [name: string]: NodeSpec | MarkSpec })[0]
    console.log()
    return duckType == 'NODE' ? schema.nodes[key] : schema.marks[key]
}