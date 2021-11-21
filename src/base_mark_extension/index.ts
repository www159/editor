import { Extensions } from "@editor/core";
import { toggleMark } from "prosemirror-commands";
import { MarkType } from "prosemirror-model";

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
            const type = this.type as MarkType
            return {
                'Mod-i': toggleMark(type),
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
            const type = this.type as MarkType
            return {
                'Mod-b': toggleMark(type)
            }
        }
    },


    {
        type: 'MARK',
        mark: {
            link: {
                attrs: {
                    href: {default: 'javascript:void(0)'},
                    title: {default: null},
                },
                inclusive: false,
                parseDOM: [{
                    tag: 'a[href]', 
                    getAttrs: node => ({
                        href: (node as HTMLElement).getAttribute('href'),
                        title: (node as HTMLElement).getAttribute('title'),
                })}],
                toDOM: node => ['a', {href: node.attrs.href, title: node.attrs.title}, 0],
            },
        }
    },

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
            const type = this.type as MarkType
            // console.log('undeline', type)
            return {
                'Mod-u': toggleMark(type),
            }
        }
    }
]