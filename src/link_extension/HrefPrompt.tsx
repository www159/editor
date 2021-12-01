import { EditorEmitter, EditorEvents, EventEmitter } from '@editor/core'
import React, { useEffect, useRef, useState } from 'react'

interface HrefPromptProps {
  emitter: EditorEmitter
}

declare module '@editor/core' {
  interface EditorPorts {
    'link': {
      'popup input': [href: string]
      'blur': []
      'enter input': []
      'leave input': [href: string]
  
    }
  }

  interface EditorEvents {
  }
}

const HrefPrompt: React.FC<HrefPromptProps> = ({ emitter }) => {
  // console.log(top, left)

  const inputRef = useRef<HTMLInputElement>(null)

  const [href, setHref] = useState('')

  useEffect(() => {
    let offPopup = emitter.onPort('link', 'popup input', (href: string) => {
      
      // inputRef.current?.setAttribute('value', href)
      setHref(href)
      
    })


    let offBlur = emitter.onPort('link', 'blur', () => {
      inputRef.current?.blur()
    })

    let offEnter = emitter.onPort('link', 'enter input', () => {
      inputRef.current?.focus()
      const { length } = inputRef.current?.value as string
      inputRef.current?.setSelectionRange(length, length)
    })

    return () => {
      offPopup()
      offBlur()
      offEnter()

    }
  }, [])


  return (
    <div className={'link-input-wrapper'}>
      <input 
        ref={inputRef} 
        type={'text'} 
        title={'链接'} 
        placeholder={'一个链接'}
        value={href}
        onChange={e => {
          const { target: { value } } = e
          // console.log(value)
          setHref(value)
        }}
        onKeyDown={(e) => {
          const { key, metaKey } = e
          if(key === 'Enter' && !metaKey) {
            inputRef.current?.blur()
            emitter.emitPort('link', 'leave input', href)
          }
        }} />
    </div>
  )
} 

export default HrefPrompt