import { Extensions } from "@editor/core";
import { linkPlugin } from "./plugin";
import './index.less'
import { toggleMark } from "prosemirror-commands";
import { MarkType } from "prosemirror-model";

export const linkExtensions: Extensions = [
    {
        type: 'MARK',
        mark: {
            link: {
                inclusive: false,
                attrs: {
                    href: { default: 'javascript:void(0)'},
                    title: { default: null }
                },
                parseDOM: [{
                    tag: 'a',
                    getAttrs: node => {
                        const href = (node as HTMLElement).getAttribute('href')
                        const title = (node as HTMLElement).getAttribute('title')
                        return href ? title ? { href, title } : null : null 
                    },
                }],
                toDOM: node => {
                    let { href, title } = node.attrs
                    return ['a', { href, title }, 0]
                }
            }
        },

        shortcutKey() {
            return {
                'Mod-Alt-l': toggleMark(this.type as MarkType)
            }
        }
    },

    {
        type: 'PLUGIN',
        plugins: [linkPlugin]
    }
]