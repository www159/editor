import { EditorEmitter, EditorEvents, EventEmitter, WSchema } from '@editor/core'
import { InlineBound, multiOff, pmEmit } from '@editor/utils'
import { EditorView } from 'prosemirror-view'
import React, { KeyboardEvent, KeyboardEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import { useSpring, a } from '@react-spring/web'
import './index.less'
import { LINK_PLUGIN_KEY } from './linkState'

interface HrefPromptProps {
  emitter: EditorEmitter
  view: EditorView<WSchema>
}

declare module '@editor/core' {
  interface EditorPorts {
    'link': {
      'popup input': [href: string, title: string]
    }
  }

}

const HrefPrompt: React.FC<HrefPromptProps> = ({ emitter, view }) => {
  
  const [href, setHref] = useState('')
  
  const [title, setTitle] = useState('')
  
  const [disp, setDisp] = useState(false)
  
  const [activeInd, setActiveInd] = useState(-1)
  
  const hrefInputR = useRef<HTMLInputElement>(null)

  const titleInputR = useRef<HTMLInputElement>(null)

  const hrefStyle = useSpring({
    from: {
      scale: 1,
      opacity: 1,
    },
    to: {
      scale: activeInd === -1 ? 1 : activeInd === 0 ? 1.1 : 0.8,
      opacity: activeInd === 0 ? 1 : 0.7,
    }
  })

  const titleStyle = useSpring({
    from: {
      scale: 1,
      opacity: 1,
    },
    to: {
      scale: activeInd === -1 ? 1 : activeInd === 0 ? 0.8 : 1.1,
      opacity: activeInd === 1 ? 1 : 0.7
    }
  })

  const handleArrow = useCallback(() => {
    setActiveInd(activeInd => activeInd === 0 ? 1 : activeInd === 1 ? 0 : 0)
  }, [])

  const handleEnter = useCallback(() => {
    setActiveInd(-1)
    // emitter.emitPort('link', 'leave input', href, title)
    pmEmit(view, LINK_PLUGIN_KEY, {
      action: 'leave input',
      payload: {
        href,
        title,
      }
    })
  }, [title, href])

  const inputPrevent = useCallback<KeyboardEventHandler<HTMLInputElement>>(e  => {
    const { key, metaKey } = e
    if(key === 'ArrowUp' || key === 'ArrowDown' || key == 'Tab' && !metaKey) e.preventDefault()
  }, [])
  
  useEffect(() => {
    switch(activeInd) {
      case 0: {
        hrefInputR.current?.focus()
        break
      }
      case 1: {
        titleInputR.current?.focus()
      }
    }
  }, [activeInd])

  useEffect(() => {
    const offs = [
      emitter.onPort('link', 'popup input', (href, title) => {
        setHref(href)
        setTitle(title)
        setDisp(true)
        setActiveInd(0)
      })
    ]
    return () => multiOff(offs)
  }, [])

  return (
    <div 
      className={'link-input-wrapper'}
      style={{
        display: disp ? '' : 'none',
      }}
      onKeyDown={(e) => {
        const { key, metaKey } = e
             if(key === 'ArrowUp' || key === 'ArrowDown')  handleArrow()
        else if(key === 'Enter' && !metaKey)               handleEnter()
        else if(key === 'Tab' && !metaKey)                 handleArrow()
        
      }}
    >
      <a.input 
        className='link-input'
        ref={hrefInputR} 
        style={hrefStyle}
        type={'text'} 
        title={'链接'} 
        placeholder={'一个链接'}
        value={href}
        onChange={({ target: { value } }) => setHref(value)}
        
        onKeyDown={inputPrevent} />
        <a.input 
        className='link-input'
        ref={titleInputR} 
        style={titleStyle}
        type={'text'} 
        title={'名头'} 
        placeholder={'链接名字'}
        value={title}
        onChange={({ target: { value } }) => setTitle(value)}
        onKeyDown={inputPrevent} />
    </div>
  )
} 

export default HrefPrompt