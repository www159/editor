import { Extensions } from "@editor/core";
import { newLineInList, splitListItem, wrapInList } from "@editor/list_extension";
import { nodesFromEditor } from "@editor/utils";
import { liftListItem, sinkListItem } from "@editor/list_extension";
import './index.less'

declare module '@editor/core' {
    interface WNode {
        'task_item': {
            checked: boolean
        }
        'task_list': {

        }
    }
}

export const taskExtensions: Extensions = [
    {
        type: 'NODE',
        node: {
            task_item: {
                content: 'paragraph block*',
                defining: true,
                parseDOM: [
                    {tag: `li[data-type='task_item']`, getAttrs: (node) => {
                        const checked = (node as HTMLElement).getAttribute('checked')
                        if(!checked || /((true)|(false))/.test(checked)) return null
                        return {
                            checked: /true/.test(checked)
                        }
                    }}
                ],
                toDOM :(node) => [
                    'li',
                    {
                        'data-type': 'task_item',
                    },
                    [
                        'label',
                        [
                            'input',
                            {
                                type: 'checkbox',
                                check: node.attrs.checked ? 'checked' : null
                            },
                        ]
                    ],
                    [
                        'span',
                        0,
                    ],
                
                ] 
            },
        },
        shortcutKey() {
            const { task_item } = nodesFromEditor(this.editor)
            return {
                'Tab': sinkListItem(task_item),
                'Shift-Tab': liftListItem(task_item),
                'Enter': splitListItem(task_item),
                'Ctrl-Enter': newLineInList(task_item),
            }
        }
    },

    {
        type: 'NODE',
        node: {
            task_list: {
                group: 'block list',
                content: 'task_item+',
                parseDOM: [{
                    tag: 'ul[data-type=task_list]',
                }],
                toDOM: () => [
                    'ul',
                    {
                        'data-type': 'task_list',
                        class: 'ProseMirror-task-list',
                    },
                    0
                ]
            }
        },
        shortcutKey() {
            const { task_list } = nodesFromEditor(this.editor)
            return {
                'Ctrl-Alt-t': wrapInList(task_list)
            }
        }
    }
]