import { WSchema } from "@editor/core";
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
    node: pmNode<WSchema>,
    key: ESCAPE_KEY,
  }
}

export const EMOJI_STATE_KEY = new PluginKey<EmojiState, WSchema, EmojiMeta>("emoji view tr")

function createEmojiView(node: pmNode, view: EditorView, getPos: boolean | (() => number)) {
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

  appendTransaction(trans, _, newState) {
    const meta = pmFetch(trans[0], EMOJI_STATE_KEY)
    if(meta) {
      const { action } = meta
      if(action === 'escape') {
        const { node, key } = meta.payload
        const { activeEmojiViews } = EMOJI_STATE_KEY.getState(newState) as EmojiState

        const pos = activeEmojiViews.get(node)?.getPos()
        if(!pos) return
        switch(key) {
          //回车键退出。这是pm事件
          case 'enter': return newState.tr.setSelection(TextSelection.create(newState.tr.doc, pos + 2)).scrollIntoView()
          //光标左移
          case 'escape left': return newState.tr.setSelection(TextSelection.create(newState.tr.doc, pos))
        }
      }
    }
    return
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

