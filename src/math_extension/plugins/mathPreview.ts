import { pmFetch } from "@editor/utils";
import { ContentMatch, NodeType, pmNode, Schema } from "prosemirror-model";
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/*********************************** outer plugin ***********************************/
/**
 * 供外部使用的插件。用于获取点开编辑框公式节点的位置，内容。
 * apply更新需要调整。
 */
export const MATH_PREVIEW_KEY = new PluginKey<DecorationSet, Schema, MathPrevireAction>('prosemirror math preview')
export const PREVIEW_WIDGET_KEY = 'prosemirror math preview'
/**通过公式节点的setMeta来调用apply
 * 因为每次只能点开一个公式节点。所以
 * `decoration`唯一。 
 * 
 * 定义该`decoration`为`widget`(`wdiget`需要占领一行，位置随便摆)。
 * 
 * 调用该插件的过程:
 * 1. 在公式节点中生成编辑框。
 * 2. getMeta
 * 
 * 生成`widget`的过程:
 * 1. 向下推进两行。
 * 2. 在第二行生成一个`widget`。
 * 3. 剩下的交给katex的居中布局。
 * 
 * 销毁`widget`的过程：
 * 1. 光标移动到合理位置。
 * 2. 删除该节点(`pmNode`)
 * 3. 回退两行。
 * 
 * 当然还是要注意选区和聚焦。
 * 
 * @todo 希望增加缓存机制
 */

 export interface MathPrevireAction {
    'ADD': {
        pos: number
        katexDOM: HTMLElement
    }
    'MODIFY': {

    }
    'REMOVE': {
        pos: number
        katexDOM: HTMLElement
    }
    'in node view': {
        random: boolean
    }
}

export const mathPreviewPlugin = new Plugin<DecorationSet, Schema, MathPrevireAction>({
    key: MATH_PREVIEW_KEY,
    state: {
        init(_, state: EditorState) {
            return DecorationSet.empty
        },
        apply(tr, decoSet ) {
            decoSet.map(tr.mapping, tr.doc)
            const meta = pmFetch(tr, this)
            if(!meta) return decoSet
            const { action } = meta
            switch(action) {
                case 'ADD':  {
                    const { pos, katexDOM } = meta.payload
                    return decoSet = decoSet.add(
                        tr.doc,
                        [Decoration.widget(pos, katexDOM, {
                            key: PREVIEW_WIDGET_KEY,
                        })])
                }
                case 'MODIFY': {
                    //需要更新katexdom,katexdom自动更新，不需要访存
                    return decoSet
                }
                case 'REMOVE': {
                    const { pos, katexDOM } = meta.payload
                    let removeDeco = decoSet.find(undefined, undefined, deco => deco.key === PREVIEW_WIDGET_KEY)
                    return decoSet = decoSet.remove(removeDeco)
                }
                default: return decoSet
            }
        },
    },

    props: {
        decorations(state) {
            return this.getState(state)
        }
    }
})

/** 
 * @todo 需要中心调度
 */