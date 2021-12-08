import { Extensions } from "@editor/core";

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
                content: 'paragraph task_list',
                defining: true,
                parseDOM: [
                    {tag: `li[data-type='list_item']`, getAttrs: (node) => {
                        const checked = (node as HTMLElement).getAttribute('checked')
                        if(!checked || /((true)|(false))/.test(checked)) return null
                        return {
                            checked: /true/.test(checked)
                        }
                    }}
                ],
                toDOM:() => [
                    'li',
                    {
                        'data-type': 'list_item',
                        class: 'ProseMirror-'
                    }
                ] 
            }
        }
    }
]