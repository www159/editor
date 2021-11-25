import { Plugin, PluginKey } from "prosemirror-state";
import { Extension } from "../types";
import { DOMOutputSpec, Node as pmNode, NodeSpec, Schema } from "prosemirror-model";
import { node } from "webpack";


export function getClipboardTextSerializer(schema: Schema): Plugin {
    return new Plugin({
        key: new PluginKey("customClipboardTextSerializer"),
        props: {
            clipboardTextSerializer(slice) {
                let blockSeparator = '\n\n',
                    leafText:undefined = undefined,
                    text = '',
                    separated = true
                    
                let { content: fragment } = slice,
                    from = 0,
                    to = fragment.size

                function serializeNode(node: pmNode): string | null {
                    let serializer: NodeSpec['toText']
                    if(serializer = schema.nodes[node.type.name].spec.toText) {
                        return serializer(node, 0) as string
                    }
                    return null
                }

                fragment.nodesBetween(from, to, (node, pos) => {
                    let serializedText = serializeNode(node)
                    if(serializedText !== null) {
                        text += serializedText
                        return false
                    }

                    if(node.isText) {
                        text += node.text?.slice(Math.max(from, pos) - pos, to - pos) || ''
                        separated = !blockSeparator
                    }
                    else if(node.isLeaf && leafText) {
                        text += leafText
                        separated = !blockSeparator
                    }
                    else if(!separated && node.isBlock) {
                        text += blockSeparator
                        separated = true
                    }
                }, 0)

                return text
            }
        }
    })
}