import { ConsNode, Extensions } from "@editor/core";
import { InputRule } from "prosemirror-inputrules";
import { NodeType, pmNode } from "prosemirror-model";
import { emojiPlugin } from "./emojiState";
import { emojiInputRule } from "./inputrules";
import "./index.less"
import { escapeBar } from "./commands/escapeBar";

export type ESCAPE_KEY = 
                    | 'up' 
                    | 'down' 
                    | 'left' 
                    | 'right' 
                    | 'enter'
                    | 'escape left'


declare module '@editor/core' {
    interface WNode extends ConsNode<'emoji'> {}
}

export const emojiExtensions: Extensions = [
    {
        type: 'NODE',
        node: {
            emoji: {
                group: 'inline',
                content: 'text*',
                atom: true,
                inline: true,
                // draggable: true,
                attrs: {
                    index: { default: -1 },
                },
                parseDOM: [{ tag: 'emoji' }],
                toDOM: (node: pmNode) => ["emoji", { class: 'ProseMirror-emoji' }, 0]

            }
        },
        inputRules() {
            return [emojiInputRule(this.type as NodeType)]
        },

        shortcutKey() {
            return {
                "ArrowUp": escapeBar(this.type as NodeType, 'up'),
                "ArrowDown": escapeBar(this.type as NodeType, 'down'),
                "ArrowLeft": escapeBar(this.type as NodeType, 'left'),
                "ArrowRight": escapeBar(this.type as NodeType, 'right'),
                "Enter": escapeBar(this.type as NodeType, 'enter'),
                "Ctrl-ArrowLeft": escapeBar(this.type as NodeType, 'escape left')
            }
        }
    },
    {
        type: 'PLUGIN',
        plugins: [emojiPlugin]
    }
]