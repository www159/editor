import { ConsNode, Extensions } from "@editor/core";
import { InputRule } from "prosemirror-inputrules";
import { NodeType, WrapAttrN, pmNode } from "prosemirror-model";
import { emojiPlugin } from "./emojiState";
import { emojiInputRule } from "./inputrules";
import "./index.less"
import { escapeBar, insertEmoji } from "./commands";
import { applyExecuter, makeTextFragment, nodesFromEditor } from "@editor/utils";
import { executeCmdsTry, hyperCmdBind } from "@editor/core/commandsHelper";

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
                marks: 'em strong',
                parseDOM: [{ tag: 'emoji', getAttrs: (node) => {
                    const index = (node as HTMLElement).getAttribute('data-index')
                    if(!index) return null
                    return {
                        index: Number.parseInt(index)
                    }
                }, /* getContent: (p, schema) => {
                    return makeTextFragment('123', schema)
                } */}],
                toDOM: (node: pmNode) => ["emoji", {'data-index': node.attrs.index }, 0],
                
                allowGapCursor: true
            }
        },
        inputRules() {
            const { emoji } = nodesFromEditor(this.editor)
            return [emojiInputRule(emoji)]
        },

        shortcutKey() {
            const { appliedTry } = this
            return {
                "ArrowUp": appliedTry(escapeBar('up')),
                "ArrowDown": appliedTry(escapeBar('down')),
                "ArrowLeft": appliedTry(escapeBar('left')),
                "ArrowRight": appliedTry(escapeBar('right')),
                "Enter": appliedTry(escapeBar('enter')),
                "Ctrl-ArrowLeft": appliedTry(escapeBar('escape left')),
                "Ctrl-alt-e": appliedTry(insertEmoji)
            }
        }
    },
    {
        type: 'PLUGIN',
        plugins: [emojiPlugin]
    }
]