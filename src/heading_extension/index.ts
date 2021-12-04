import { ConsNode, Extension, pmNode } from "@editor/core"
// import { InputRuleSpec } from "@editor/core/types"
import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules"
import { NodeType } from "prosemirror-model"

declare module '@editor/core' {
    interface WNode {
        'heading': {
            level: number
        }
    }
    // interface WNode extends heading_node {}
}

export const headingExtension: Extension = {
    type: 'NODE',
    node: {
        heading: {
            group: 'block',
            content: 'inline*',
            defining: true,
            attrs: { level: { default: 1 } },
            parseDOM: [
                { tag: 'h1', attrs: { level: 1 } },
                { tag: 'h2', attrs: { level: 2 } },
                { tag: 'h3', attrs: { level: 3 } },
                { tag: 'h4', attrs: { level: 4 } },
                { tag: 'h5', attrs: { level: 5 } },
                { tag: 'h6', attrs: { level: 6 } },
            ],
            toDOM: (node: pmNode) => [`h${node.attrs.level}`, 0],
            toText: (node: pmNode) => `${getSharp(node)} ${node.textContent}`
        }
    },

    inputRules() {
        let inputruleArr = new Array<InputRule>()

        for(let i = 1; i <= 6; i++) {
            inputruleArr.push(
                textblockTypeInputRule(
                    new RegExp(`^(#{1,${i}})\\s$`),
                    this.type as NodeType,
                    match => ({ level: match[1].length })
                )
            )
        }

        return inputruleArr
    }
}

// function getSixHeading() {
//     let inputruleArr = new Array<InputRuleSpec>()

//     for(let i = 1; i <= 6; i++) {
//         inputruleArr.push({
//             nodeName: 'heading',
//             regex: new RegExp(`^(#{1,${i}})\\s$`),
//             getAttr: match => ({ level: match[1].length }),
//             ruleWrap: textblockTypeInputRule,
//         })
//     }

//     return inputruleArr
// }

function getSharp(node: pmNode) {
    let str = ''
    
    console.log(node.attrs.level)
    for(let i = 0;  i < node.attrs.level; i++) {
        str += '#'
    }
    return str
}