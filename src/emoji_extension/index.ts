import { ConsNode, Extensions } from "@editor/core";
import { InputRule } from "prosemirror-inputrules";
import { NodeType, WrapAttrN, pmNode } from "prosemirror-model";
import { emojiPlugin } from "./emojiState";
import { emojiInputRule } from "./inputrules";
import "./index.less"
import { escapeBar } from "./commands/escapeBar";
import { makeTextFragment, nodesFromEditor } from "@editor/utils";

export type ESCAPE_KEY = 
                    | 'up' 
                    | 'down' 
                    | 'left' 
                    | 'right' 
                    | 'enter'
                    | 'escape left'


declare module '@editor/core' {
    // interface emoji_node  {
    // }
    interface WNode {
        'emoji': {
            indes: number
        }
    }
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
                    index: {
                        default: 0,
                    },
                },
                parseDOM: [{ tag: 'emoji', getAttrs: (node) => {
                    const index = (node as HTMLElement).getAttribute('data-index')
                    if(!index) return null
                    return {
                        index: Number.parseInt(index)
                    }
                }, /* getContent: (p, schema) => {
                    return makeTextFragment('123', schema)
                } */}],
                toDOM: (node: pmNode) => ["emoji", {'data-index': node.attrs.index }, 0]
            }
        },
        inputRules() {
            const { emoji } = nodesFromEditor(this.editor)
            return [emojiInputRule(emoji)]
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