import { pmNode } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { EmojiView } from "./emojiView";

export interface EmojiState {
  activeEmojiViews: WeakMap<pmNode, EmojiView>
} 

export const EMOJI_STATE_KEY = new PluginKey<EmojiState>("emoji view tr")

function createEmojiView(node: pmNode, view: EditorView, getPos: boolean | (() => number)) {
  const pluginState = EMOJI_STATE_KEY.getState(view.state)
  if(!pluginState) throw new Error('emoji plugin failed')
  let emojiViews = pluginState.activeEmojiViews

  let emojiView = new EmojiView(node, view, getPos as () => number)
  emojiViews.set(node, emojiView)

  emojiView.on('destory', (removeAllListener: () => void) => {
    removeAllListener()
    emojiViews.delete(node)
  })

  return emojiView
}

export const emojiPlugin = new Plugin<EmojiState>({
  key: EMOJI_STATE_KEY,
  state: {
    init(_, __) {
      return {
        activeEmojiViews: new WeakMap()
      }
    },
    apply(tr, emojiState) {
      const { activeEmojiViews } = emojiState
      const meta = tr.getMeta(this)

      if(meta) {
        const { action, payload } = meta
        if(action === 'escape') {
          const { node, key } = payload
          const emojiView = activeEmojiViews.get(node)
          if(!emojiView) 
            throw new Error('找不到该节点对应的emojiView')
          emojiView.emit(action, key)
        }
      }
      return {
        activeEmojiViews
      }
    }
  },
  props: {
    nodeViews: {
      "emoji": createEmojiView
    },

    // handleDOMEvents: {
    //   keyup(view, event) {
    //     if(view.state.selection.)
    //   }
    // }
  }
})