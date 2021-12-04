import { EditorEmitter, EditorPorts } from "@editor/core";
import React, { DependencyList, useCallback, useEffect, useRef, useState } from "react";
// import ReactDOM from "react-dom";
import { a, useSpring, config } from '@react-spring/web'
import { IconType } from ".";

import './index.less'
import { SmileSvg, TipSvg, WarnSvg, WrongSvg } from "./svgIcon";
import { multiOff, setTimeoutAsync } from "@editor/utils";

interface AppProps {
  emitter: EditorEmitter
}

function useApp(emitter: EditorEmitter) {

  const [layerDisp, setLayerDisp] = useState(false)

  const [confirmDisp, setConfirmDisp] = useState(false)

  const [icon, setIcon] = useState<IconType>('TIP')

  const [content, setContent] = useState<string>('')

  const [delay, setDelay] = useState(0)

  const [button, setButton] = useState<[btn1: () => void, btn2?: () => void] | undefined>(undefined)

  const removeLayer = useCallback(() => {
    setLayerDisp(false)
  }, [])

  const removeConfirm = useCallback(() => {
    setConfirmDisp(false)
  }, [])

  useEffect(() => {
    const offs = [
      emitter.onPort('layer', 'layer', (content, delay = 0, icon = 'TIP') => {
        setContent(content)
        setDelay(delay)
        setIcon(icon)
        setLayerDisp(true)
      }),
      emitter.onPort('layer', 'confirm', (content, button, icon = "TIP") => {
        setContent(content)
        setButton(button)
        setIcon(icon)
        setConfirmDisp(true)
      })
    ]

    return () => {
      multiOff(offs)
    }
  }, [layerDisp, confirmDisp])

  return [
    {layerDisp, confirmDisp, delay, icon, content, button},
    {removeLayer, removeConfirm},
  ] as const
}



const App: React.FC<AppProps> = ({ emitter }) => {

  const b = () => {}
  const a = [b, { a: 123, v: '123' }]


  const [
    {layerDisp, confirmDisp, delay, icon, content, button},
    {removeLayer, removeConfirm}
  ] = useApp(emitter)

  return (
    <>
      { layerDisp && <Layer content={content} delay={delay} icon={icon} remove={removeLayer} /> }
      { confirmDisp && <Confirm content={content} button={button} icon={icon} remove={removeConfirm} />}
    </>
  )
}


function selectSvg(icon: IconType) {
  switch(icon) {
    case 'TIP':       return TipSvg
    case 'SMILE':     return SmileSvg
    case 'WARNING':   return WarnSvg
    case 'WRONG':     return WrongSvg
  }
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
  icon: IconType
  remove: () => void
}

const Confirm: React.FC<ConfirmProps> = ({ content, button, remove }) => {
  
  return (
    <div className='ProseMirror-confirm'>
    </div>
  )
}

export default App