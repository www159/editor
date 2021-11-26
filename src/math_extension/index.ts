import { ConsNode, Extension, Extensions } from '@editor/core';
import { NodeSpec, NodeType, pmNode } from 'prosemirror-model';
import { makeInlineMathInputRule, REGEX_INLINE_MATH_DOLLARS_ESCAPED, makeBlockMathInputrule, REGEX_BLOCK_MATH_DOLLARS, REGEX_INLINE_MATH_DOLLARS_LITE } from './plugins/mathInputrules';
import { mathPlugin } from './mathPlugin';
// import { mathNodes } from './mathSchema';
// import { BlockMathInputrule, InlineMathInputRule, REGEX_BLOCK_MATH_DOLLARS, REGEX_INLINE_MATH_DOLLARS_ESCAPED } from './plugins/mathInputrules';
import { mathSelectPlugin } from './plugins/mathSelect';
import { mathPreviewPlugin } from './plugins/mathPreview';
import { nodesFromEditor } from '@editor/utils';

declare module '@editor/core' {
    type math_node =
    | 'math_inline'
    | 'math_display'
    interface WNode extends ConsNode<math_node> {}
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
            return [
                makeInlineMathInputRule(
                    REGEX_INLINE_MATH_DOLLARS_ESCAPED,
                    this.type as NodeType
                ),
                makeInlineMathInputRule(
                    REGEX_INLINE_MATH_DOLLARS_LITE,
                    this.type as NodeType
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
            const { link } = nodesFromEditor(this.editor)
            return [makeBlockMathInputrule(
                REGEX_BLOCK_MATH_DOLLARS,
                link,
            )]
        }
    },

    {
        type: 'PLUGIN',
        plugins: [
            mathPreviewPlugin,
            mathSelectPlugin,
            mathPlugin,
        ]
    }
]