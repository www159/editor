import { ConsNode, Extensions } from "@editor/core";
import { nodesFromEditor } from "@editor/utils";
import { InputRule, textblockTypeInputRule, wrappingInputRule } from "prosemirror-inputrules";
import { NodeType } from "prosemirror-model";
import { wrapInLink } from "./commands";
import { createLinkPlugin } from "./linkState";

declare module '@editor/core' {
    interface WNode extends ConsNode<'link'> {}
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

                    }
                }],
                toDOM: node => ['a', { href: node.attrs.href, title: node.attrs.title }, 0]
            },
        },

        shortcutKey() {
            const { link } = nodesFromEditor(this.editor)
            const { schema } = this.editor
            return {
                "Ctrl-Alt-l": wrapInLink(link, schema)
            }
        }

        // inputRules() {
        //     return [
        //         textblockTypeInputRule(/::a\s$/, this.type as NodeType)
        //     ]
        // }
    },

    {
        type: 'PLUGIN',
        wrappedPlugin() {
            return [createLinkPlugin(this.editor, this.editor.view.dom.parentElement as HTMLElement)]
        }
    }
]