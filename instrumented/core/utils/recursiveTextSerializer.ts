import { pmNode } from "prosemirror-model";

export function recursiveTextSerializer(
    node: pmNode,
    indent: number,
    prefix: string = '',
    suffix: string = '',
)
{
    const { toText } = node.type.spec
    return `${prefix}${toText instanceof Function ? toText(node, indent) : node.textContent}${suffix}`
}