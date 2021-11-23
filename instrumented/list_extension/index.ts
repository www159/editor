import { Extensions } from "@editor/core";
import { recursiveTextSerializer } from "@editor/core/utils/recursiveTextSerializer";
import { chainCommands } from "prosemirror-commands";
import { wrappingInputRule } from "prosemirror-inputrules";
// import { keymap } from "prosemirror-keymap";
import { NodeType } from "prosemirror-model";
import { deleteListItem } from "./commands/deleteListItem";
import { liftListItem } from "./commands/liftListItem";
import { newLineInList } from "./commands/newLineInList";
import { sinkListItem } from "./commands/sinkListItem";
import { splitListItem } from "./commands/splitListItem";
import { wrapInList } from "./commands/wrapInList";
import { BulletListOptions_t, OrderedListOptions_t } from "./type";
import { getTable } from "./utils/orderTable";

// import { splitListItem } from 'prosemirror-schema-list'

// type OrderedListType = { type: OrderedListOption | { default: OrderedListOption } }

/**
 * 列表元素。
 * 需要定义toText。
 * 附带几个自定义命令。
 */

export const listExtensions: Extensions = [
/*********************************** 有序列表 ***********************************/

    {
        type: 'NODE',
        node: {
            'ordered_list': {
                group: 'block list',
                content: 'list_item*',
                attrs: {
                    start: { default: 1 },
                    type: { default: '1' as OrderedListOptions_t }
                },
                parseDOM: [{
                    tag: 'ol',
                    getAttrs(dom) {
                        console.log('attr')
                        let list = dom as Element
                        return {
                            start: list.hasAttribute('start') ? list.getAttribute('start') : 1 as number,
                            type: list.hasAttribute('type') ? list.getAttribute('type') as string : '1' as OrderedListOptions_t
                        }
                    },
                }],
                toDOM: node => [
                    'ol', 
                    {start: node.attrs.start, type: node.attrs.type},
                    0
                ],
                toText: (node, indent) => {
                    //list具有类似树状的结构,因此需要递归调用。
                    let text = ''
                    let { start, type } = node.attrs,
                        orderTable = getTable(type)
                    //根据type获取字母索取函数。
                    //利用start算出初始值
                    indent += 2
                    for(let i = 0; i < node.childCount; i++) {
                        text += recursiveTextSerializer(
                            node.child(i),
                            indent,
                            `${' '.repeat(indent)}${orderTable(start + 0)}. `,
                            `\n`
                        )
                    }
                    return `\n  ${text}\n`
                }
            },
        },
        shortcutKey() {
            return {
                'Ctrl-Shift-8': wrapInList(this.type as NodeType),            
            }
        },

        inputRules() {
            return [
                wrappingInputRule(
                    /^(\d+)\.\s$/,
                    this.type as NodeType,
                    match => {
                        start: +match[1]
                    },
                    (match, node) => node.childCount + node.attrs.start === Number.parseInt(match[1])

                )
            ]
        }
    },

/*********************************** 无序列表 ***********************************/

    {
        type: 'NODE',
        node: {
            'bullet_list': {
                group: 'block list',
                content: 'list_item*',
                attrs: {
                    type: { default: 'disc' as BulletListOptions_t }
                },
                parseDOM: [{
                    tag: 'ul',
                    getAttrs(dom) {
                        let list = dom as Element
                        return {
                            type: list.hasAttribute('type') ? list.getAttribute('type') as string : 'disc' as BulletListOptions_t
                        }
                    }
                }],
                toDOM: node => [
                    'ul',
                    {
                        style: `list-style-type:${node.attrs.type};`
                    },
                    0
                ],
                toText: (node, indent) => {
                    let text = ''
                    indent += 2
                    for(let i = 0; i < node.childCount; i++) {
                        text += recursiveTextSerializer(
                            node.child(i),
                            indent,
                            `${' '.repeat(indent)}- `,
                            `\n`,
                        )
                    }
                    return `\n${text}\n`
                }
            }
        },
        shortcutKey() {
            return {
                'Ctrl-Shift-9': wrapInList(this.type as NodeType)
            }
        },
        inputRules() {
            return [
                wrappingInputRule(
                    /^\s*[-,\+,\*]\s$/,
                    this.type as NodeType
                )
            ]
        }
    },

/*********************************** <li> ***********************************/


    {
        type: 'NODE',
        node: {
            list_item: {
                content: 'paragraph block*',
                parseDOM: [{ tag: 'li' }],
                toDOM: () => ['li', 0],
                defining: true,
                toText: (node, indent) => {
                    //list-item只有一个子节点
                    return recursiveTextSerializer(node.child(0), indent)
                }
            }
        },
        shortcutKey() {
            return {
                'Enter': splitListItem(this.type as NodeType),
                'Tab': sinkListItem(this.type as NodeType),
                'Shift-Tab': liftListItem(this.type as NodeType),
                'Ctrl-Enter': newLineInList(this.type as NodeType),
                'Backspace': deleteListItem(this.type as NodeType, this.editor.view),
                // 'Tab': sinkListItem(this.type as NodeType),
            }
        }
    },
]