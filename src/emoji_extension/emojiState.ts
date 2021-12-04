import { WEditorView, WSchema } from "@editor/core";
import { ESCAPE_KEY } from "@editor/emoji_extension";
import { pmFetch } from "@editor/utils";
import { pmNode } from "prosemirror-model";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { EmojiView } from "./emojiView";

export interface EmojiState {
  activeEmojiViews: WeakMap<pmNode, EmojiView>
} 

export interface EmojiMeta {
  'escape': {
    node: pmNode,
    key: ESCAPE_KEY,
  }
}

export const EMOJI_STATE_KEY = new PluginKey<EmojiState, WSchema, EmojiMeta>("emoji view tr")

function createEmojiView(node: pmNode, view: WEditorView, getPos: boolean | (() => number)) {
  const pluginState = EMOJI_STATE_KEY.getState(view.state)
  if(!pluginState) throw new Error('emoji plugin failed')
  let emojiViews = pluginState.activeEmojiViews

  let emojiView = new EmojiView(node, view, getPos as () => number)
  emojiViews.set(node, emojiView)

  emojiView.on('destroy', (removeAllListener: () => void) => {
    removeAllListener()
    emojiViews.delete(node)
  })

  return emojiView
}

export const emojiPlugin = new Plugin<EmojiState, WSchema, EmojiMeta>({
  key: EMOJI_STATE_KEY,
  state: {
    init(_, __) {
      return {
        activeEmojiViews: new WeakMap()
      }
    },
    apply(tr, emojiState) {
  
      const { activeEmojiViews } = emojiState
      const meta = pmFetch(tr, this)

      if(meta) {
        const { action, payload } = meta
        //收到按键，dispatch设为此plugin
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
      "emoji": (node, ...args) => createEmojiView(node as pmNode, args[0], args[1])
    },

    // handleDOMEvents: {
    //   keyup(view, event) {
    //     if(view.state.selection.)
    //   }
    // }
  }
})

