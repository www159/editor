import { ConsNode, Extension, Extensions } from "@editor/core";
import { chainCommands, exitCode } from "prosemirror-commands";
import { wrapBaseKeymap } from "@editor/core";
// import { keymap } from "prosemirror-keymap";
import { history, undo, redo } from 'prosemirror-history';
import { gapCursor } from 'prosemirror-gapcursor'
import '../../node_modules/prosemirror-gapcursor/style/gapcursor.css'
import { wrapRaw } from "@editor/core/commandsHelper";

declare module '@editor/core' {
    interface WNode {
        'paragraph': {}
        'doc': {}
        'text': {}
        'hard_break': {}
    }
    // interface WNode extends common_node {

    // }
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
                gapCursor(),
                
            ]
        },
        shortcutKey() {
            const { appliedStrict } = this
            return {
                ...wrapBaseKeymap,
                'Mod-z': appliedStrict(wrapRaw(undo)),
                'Mod-y': appliedStrict(wrapRaw(redo)),
            }
        }
    }

]