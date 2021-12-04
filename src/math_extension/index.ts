import { ConsNode, Extension, Extensions } from '@editor/core';
import { NodeSpec, NodeType, WrapAttrN, pmNode, } from 'prosemirror-model';
import { makeInlineMathInputRule, REGEX_INLINE_MATH_DOLLARS_ESCAPED, makeBlockMathInputrule, REGEX_BLOCK_MATH_DOLLARS, REGEX_INLINE_MATH_DOLLARS_LITE } from './plugins/mathInputrules';
import { mathPlugin } from './mathPlugin';
// import { mathNodes } from './mathSchema';
// import { BlockMathInputrule, InlineMathInputRule, REGEX_BLOCK_MATH_DOLLARS, REGEX_INLINE_MATH_DOLLARS_ESCAPED } from './plugins/mathInputrules';
import { mathSelectPlugin } from './plugins/mathSelect';
import { mathPreviewPlugin } from './plugins/mathPreview';
import { nodesFromEditor } from '@editor/utils';
import { mathDeleteCmd } from './commands/mathDeleteCmd'

declare module '@editor/core' {
    interface math_nodes {
        'math_inline': {}
        'math_display': {}
    }
    interface WNode extends math_nodes {}
}

export const mathExtensions: Extensions = [
    {
        type: 'NODE',
        node: {
            math_inline: {
                group: 'inline math',
                content: 'inline*',
                inline: true,
                atom: true,
                toDOM: () => ['math-inline', {class: 'math-node'}, 0],
                parseDOM: [
                    { tag: 'math-inline' },
                ],
                toText: (node: pmNode) => `$${node.textContent}$`,
            },
        },
        inputRules() {
            const { math_inline } = nodesFromEditor(this.editor)
            return [
                makeInlineMathInputRule(
                    REGEX_INLINE_MATH_DOLLARS_ESCAPED,
                    math_inline
                ),
                makeInlineMathInputRule(
                    REGEX_INLINE_MATH_DOLLARS_LITE,
                    math_inline
                )
            ]
        }

    },

    {
        type: 'NODE',
        node: {
            math_display: {
                group: 'block math',
                content: 'inline*',
                atom: true,
                code: true,
                toDOM: () => ['math-display', {class: 'math-node'}, 0],
                parseDOM: [
                    { tag: 'math-display' },
                ],
                toText: (node: pmNode) => `\n\n$$\n${node.textContent}}\n$$`,
            },
        },

        inputRules() {
            const { math_display } = nodesFromEditor(this.editor)
            return [makeBlockMathInputrule(
                REGEX_BLOCK_MATH_DOLLARS,
                math_display,
            )]
        }
    },

    {
        type: 'PLUGIN',
        plugins: [
            mathPreviewPlugin,
            mathSelectPlugin,
            mathPlugin,
        ],
        shortcutKey() {
            return {
                'Backspace': mathDeleteCmd
            }
        }
    }
]