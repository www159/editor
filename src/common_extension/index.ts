import { ConsNode, Extension, Extensions } from "@editor/core";
import { baseKeymap, chainCommands, exitCode } from "prosemirror-commands";
// import { keymap } from "prosemirror-keymap";
import { history, undo, redo } from 'prosemirror-history'

declare module '@editor/core' {
    type common_node = 
    | 'paragraph'
    | 'doc'
    | 'text'
    | 'hard_break'
    interface WNode extends ConsNode<common_node> {

    }
}

export const commonExtensions: Extensions = [
    {
        type: 'NODE',
        node: {
            paragraph : {
                content: 'inline*',
                group: 'block',
                parseDOM: [{tag: 'p'}],
                toDOM: () => ['p', 0],
            }, 
        },
        priority: 300,
    },

    {
        type: 'NODE',
        node: {
            doc: {
                content: 'block+',
            },
        },
        priority: 1000,
    },

    {
        type: 'NODE',
        node: {
            text: {
                group: 'inline',
            },
        },
    },

    {
        type: 'NODE',
        node: {
            hard_break: {
                group: 'inline',
                inline: true,
                selectable: false,
                parseDOM: [{ tag: 'br' }],
                toDOM: () => ['br'],
            }
        }
    },

    {
        type: 'PLUGIN',
        priority: 100,
        wrappedPlugin() {
            return [
                history({
                    newGroupDelay: 100
                }),
            ]
        },
        shortcutKey() {
            return {
                ...baseKeymap,
                'Mod-z': undo,
                'Mod-y': redo,
            }
        }
    }

]