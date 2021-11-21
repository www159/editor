import { EventEmitter, Realize } from "@editor/core";
import { deConsView } from "@editor/utils";
import { Mark, pmNode, ResolvedPos } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import { LinkView } from './LinkView'

interface linkPluginState {
    pos: number | null
    activeMark: Mark | null
    activeAnchor: HTMLAnchorElement | null
    emitter: EventEmitter | null
}

export const LINK_PLUGIN_KEY = new PluginKey('link plugin key')

let flushMark = new Mark()

export const linkPlugin = new Plugin<linkPluginState>({

    key: LINK_PLUGIN_KEY,

    state: {
        init: () => ({
            pos: null,
            activeMark: null,
            activeAnchor: null,
            emitter: null,
        }),
        apply: (tr, value, __, newState) => {

            //转发事件
            const meta = tr.getMeta(LINK_PLUGIN_KEY)
            if(meta) {
                const { action, payload } = meta
                switch(action) {

                    //创建linkView
                    case 'create view': {
                        const { view } = payload
                        return {
                            ...value,
                            emitter: view
                        }
                    }

                    //退出input设置href
                    case 'set href': {
                        const { href } = payload
                        const { activeMark } = value 
                        if(activeMark) {
                            flushMark = activeMark
                            activeMark.attrs.href = href
                            console.log('setting href', href)
                            return {
                                ...value,
                                activeMark,
                            }
                        }

                    }
                    default: return value
                }
            }

            //更改选区
            const { selection: { $from } } = newState

            console.log($from.marks())
            let activeMark: Mark = new Mark()
            let isAnchor = $from.marks().some(mark => {
                activeMark = mark
                return mark.type.name === 'link'
            })
            // console.log('anchor', isAnchor)
            // console.log('mark', activeMark)
            console.log('out', isAnchor)
            if(isAnchor) {
                console.log('in', activeMark)
                let pos = $from.pos
                for(pos; pos; pos--) {
                    const $pos = tr.doc.resolve(pos)
                    if($pos.marks().every(mark => mark.type.name !== 'link')) break
                }

                console.log('eq', flushMark.eq(activeMark))

                return {
                    ...value,
                    pos,
                    activeMark,
                }
            }

            else return {
                ...value,
                activeMark: null,
            }
        }
    },

    view: (view) => {
        const linkView = new LinkView(view)
        const { tr, dispatch } = deConsView(view)
        dispatch(tr.setMeta(LINK_PLUGIN_KEY, {
            action: 'create view',
            payload: {
                view: linkView
            }
        }))
        return linkView
    },

    props: {
        //拦截事件
        handleKeyDown(view, event) {
            const { state } = view
            const { activeMark, emitter } = this.getState(state)
            if(!activeMark || !emitter) return false

            const { key, ctrlKey } = event
            if(key !== 'Enter') return false
            
            //如果Ctrl+Enter，进入input
            if(ctrlKey)
                emitter.emit('enter input')
            return true
        },

        handleDoubleClickOn(view, event) {
            const { state } = view
            const { activeMark } = this.getState(state)
            if(!activeMark) return false

            const { href } = activeMark.attrs
            window.open(href as string, '__blank')
            return true
        }

        // handleDOMEvents: {
        //     keyup(view, event) {
        //         console.log('keyup', event)
        //         event.preventDefault()
        //         return false
        //     }
        // }
    }
})


