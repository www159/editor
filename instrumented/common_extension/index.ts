import { Extension, Extensions } from "@editor/core";
import { baseKeymap, chainCommands, exitCode } from "prosemirror-commands";
// import { keymap } from "prosemirror-keymap";

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
        shortcutKey:() => baseKeymap,
    }

]