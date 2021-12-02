import { EditorEmitter } from "@editor/core";
import React, { useEffect, useRef, useState } from "react";
// import ReactDOM from "react-dom";
import { a, useSpring, config } from '@react-spring/web'
import { IconType } from ".";

import './index.less'
import { SmileSvg, TipSvg, WarnSvg, WrongSvg } from "./svgIcon";
import { setTimeoutAsync } from "@editor/utils";

interface AppProps {
  emitter: EditorEmitter
}

function selectSvg(icon: IconType) {
  switch(icon) {
    case 'TIP':       return TipSvg
    case 'SMILE':     return SmileSvg
    case 'WARNING':   return WarnSvg
    case 'WRONG':     return WrongSvg
  }
}

const App: React.FC<AppProps> = ({ emitter }) => {

  const [layerDisp, setLayerDisp] = useState(false)
  const [confirmDisp, setConfirmDisp] = useState(false)

  const delayR = useRef<number>(0)
  const iconR = useRef<IconType>('TIP')
  const contentR = useRef<string>('')
  const buttonR = useRef<[btn1: () => void, btn2?: () => void] | undefined>()

  const queR = useRef<(() => void)[]>([])
 
  useEffect(() => {
    const offs = [
      emitter.onPort('layer', 'layer', (content, delay = 0, icon) => {
        contentR.current = content
        delayR.current = delay
        iconR.current = icon || 'TIP'
        setLayerDisp(true)
      }),
      emitter.onPort('layer', 'confirm', (content, button, icon) => {
        contentR.current = content
        buttonR.current = button
        iconR.current = icon || 'TIP'
        setConfirmDisp(true)
      })
    ]

    return () => {
      offs.forEach(off => off())
    }
  }, [layerDisp, confirmDisp])

  return (
    <>
      { layerDisp ? <Layer content={contentR.current} delay={delayR.current} icon={iconR.current} remove={() => { setLayerDisp(false) }} /> : null }
      { confirmDisp ? <Confirm content={contentR.current} button={buttonR.current} inVisiblize={() => setConfirmDisp(false)} /> : null }
    </>
  )
}

interface LayerProps {
  content: string
  delay: number
  icon: IconType
  remove: () => void
}
/**
 * layer的逻辑：
 * - 动作
 *   1. 从下方浮出
 *   2. 从上方消失
 * - 动效
 *   1. 弹簧
 *   2. svg画线条
 *   3. icon嵌入
 * @param param0 
 * @returns 
 */
const Layer: React.FC<LayerProps> = ({ content, delay, icon, remove }) => {
  
  const style = useSpring({
    config: {
      ...config.gentle,
      duration: 100,
    },
    from: {
      y: 200,
      opacity: 0,
    },

    to: async (next) => {
      await next({ y: 0,opacity: 1})
      await setTimeoutAsync(async () => {
        await next({ opacity: 0 })
        remove()
      }, delay)
    }
  })

  const LayerSvg = selectSvg(icon)
  return (
    <a.div
     className='ProseMirror-layer'
     style={style}
    >
      <LayerSvg />
      <div className="content">
        { content }
      </div>
    </a.div>
  )
} 

interface ConfirmProps {
  content: string
  button?: [btn1: () => void, btn2?: () => void]
  inVisiblize: () => void
}

const Confirm: React.FC<ConfirmProps> = ({ content, button, inVisiblize }) => {
  
  return (
    <div className='ProseMirror-confirm'>
    </div>
  )
}

export default App