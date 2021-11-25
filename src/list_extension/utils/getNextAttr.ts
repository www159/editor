import { pmNode } from "prosemirror-model";
import { BulletListOptions, bullet_listAttrs, OrderedListOptions, ordered_listAttrs } from '../type'
export function getNextAttr(node: pmNode): bullet_listAttrs | ordered_listAttrs {
    let {  type: { name } } = node
    let attrs = node.attrs as bullet_listAttrs | ordered_listAttrs,
        options = name === 'bullet_list' ? BulletListOptions : OrderedListOptions,
        index = options.findIndex((val) => val === attrs.type)

    return {
        type: options[(index + 1) % options.length],
    } 
}