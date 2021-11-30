import { EditorEvents, EventEmitter } from '@editor/core'
import React, { useEffect, useRef, useState } from 'react'

interface HrefPromptProps {
  emitter: EventEmitter<EditorEvents>
}

declare module '@editor/core' {
  interface EditorEvents {
    'link ## popup input': [href: string]
    'link ## blur': []
    'link ## enter input': []
    'link ## leave input': [href: string]
  }
}

const HrefPrompt: React.FC<HrefPromptProps> = ({ emitter }) => {
  // console.log(top, left)

  const inputRef = useRef<HTMLInputElement>(null)

  const [href, setHref] = useState('')

  useEffect(() => {
    let offPopup = emitter.on('link ## popup input', (href: string) => {
      
      // inputRef.current?.setAttribute('value', href)
      setHref(href)
      
    })

    let offBlur = emitter.on('link ## blur', () => {
      inputRef.current?.blur()
    })

    let offEnter = emitter.on('link ## enter input', () => {
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
            emitter.emit('link ## leave input', href)
          }
        }} />
    </div>
  )
} 

export default HrefPrompt