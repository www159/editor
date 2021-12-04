import { ConsNode, Extensions } from "@editor/core";
import { nodesFromEditor } from "@editor/utils";
import { InputRule, textblockTypeInputRule, wrappingInputRule } from "prosemirror-inputrules";
import { NodeType, WrapAttrN } from "prosemirror-model";
import { wakeUpPrompt, wrapInLink } from "./commands";
import { createLinkPlugin } from "./linkState";

declare module '@editor/core' {
    interface WNode {
        'link': {
            href: string
            title: string
        }
    }
    // interface WNode extends link_node {}
}

export const linkExtensions: Extensions = [
    {
        type: 'NODE',
        node: {
            link: {
                group: 'inline',
                content: '(text)*',
                // atom: true,
                inline: true,
                attrs: {
                    href: { default: '链接' },
                    title: { default: '链接' },
                },
                parseDOM: [{
                    tag: 'a',
                    getAttrs: node => {
                        const href = (node as HTMLElement).getAttribute('href')
                        const title = (node as HTMLElement).getAttribute('title')
                        const obj = { href, title }
                        return href ?
                        obj : title ?
                        obj : {}

                    },
                }],
                toDOM: node => ['a', { class: 'ProseMirror-link', href: node.attrs.href, title: node.attrs.title }, 0]
            },
        },

        shortcutKey() {
            const { link } = nodesFromEditor(this.editor)
            const { schema, view } = this.editor
            return {
                'Ctrl-Alt-l': wrapInLink(link, schema, this.editor),
                'Ctrl-Enter': wakeUpPrompt(view, schema, this.editor)
            }
        },

        wrappedPlugin() {
            return [createLinkPlugin(this.editor, this.editor.view.dom.parentElement as HTMLElement)]
        }
    },
]