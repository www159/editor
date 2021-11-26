import { ConsNode, Extensions } from "@editor/core";
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
                content: 'text*',
                // atom: true,
                inline: true,
                attrs: {
                    href: { default: '链接' },
                    title: { default: '链接' },
                },

                toDOM: node => ['a', { href: node.attrs.href, title: node.attrs.title }, 0]
            },
        },

        shortcutKey() {
            const type = this.type as NodeType
            return {
                "Ctrl-Alt-l": wrapInLink(type)
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
            return [createLinkPlugin(this.editor)]
        }
    }
]