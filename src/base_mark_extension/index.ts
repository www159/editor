import { ConsMark, Extensions } from "@editor/core";
import { marksFromEditor, nodesFromEditor } from "@editor/utils";
import { toggleMark } from "@editor/core/unitCommands";
import { MarkType, WrapAttrM } from "prosemirror-model";

declare module '@editor/core' {

    interface WMark {
        'em': {}
        'strong': {}
        'under_line': {}
    }
    
    // interface WMark extends base_?marks {}
}

export const baseMarkExtensions: Extensions = [
    {
        type: 'MARK',
        mark: {
            em: {
                parseDOM: [
                    {tag: 'i'},
                    {tag: 'em'},
                    {style: 'font-style: italic'},
                ],
                toDOM: () => ["em", 0],
            },
        },
        shortcutKey() {
            const { editor, appliedStrict } = this
            const { em } = marksFromEditor(editor)
            return {
                'Mod-i': appliedStrict(toggleMark(em)),
            }
        }
    },

    {
        type: 'MARK',
        mark: {
            strong: {
                parseDOM: [
                    {tag: 'strong'},
                    {tag: 'b', getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && null},
                    {style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null}
                ],
                toDOM: () => ['strong', 0],
            },
        },
        shortcutKey() {
            const { editor, appliedStrict } = this
            const { strong } = marksFromEditor(editor)
            return {
                'Mod-b': appliedStrict(toggleMark(strong))
            }
        }
    },


    // {
    //     type: 'MARK',
    //     mark: {
    //         link: {
    //             attrs: {
    //                 href: {default: 'javascript:void(0)'},
    //                 title: {default: null},
    //             },
    //             inclusive: false,
    //             parseDOM: [{
    //                 tag: 'a[href]', 
    //                 getAttrs: node => ({
    //                     href: (node as HTMLElement).getAttribute('href'),
    //                     title: (node as HTMLElement).getAttribute('title'),
    //             })}],
    //             toDOM: node => ['a', {href: node.attrs.href, title: node.attrs.title}, 0],
    //         },
    //     }
    // },

    {
        type: 'MARK',
        mark: {
            under_line: {
                parseDOM: [
                    {tag: 'u'},
                    {style: 'text-decoration', getAttrs: value => (value as string) == 'underline' && null}
                ],
                toDOM: () => ['u', 0]
            }
        },
        shortcutKey() {
            const { editor, appliedStrict } = this
            const { under_line } = marksFromEditor(editor)
            // console.log('undeline', type)
            return {
                'Mod-u': appliedStrict(toggleMark(under_line))
            }
        }
    }
]