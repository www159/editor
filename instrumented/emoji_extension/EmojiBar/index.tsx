import { EventEmitter } from "@editor/core"
import React, { ReactElement, useCallback, useEffect, useRef, useState } from "react"
// import { hot } from "react-hot-loader"
// import { Wrapper } from "./style"
import emojiArr from "../data.json"
import { a, useSprings } from "@react-spring/web"
import { ESCAPE_KEY } from ".."

/**
 * 需要的组件
 * - 过渡radio { Wadio }
 * - 拟物化网格 { sheet }
 */

const EMOJI_PER_SHEET = 16

export interface AppProps {
  emitter: EventEmitter
}

function calcIndex(sheet: number, row: number, col: number) {
  return sheet * EMOJI_PER_SHEET + row * 4 + col
}

function deConsIndex(index: number) {
  return {
    sheet: Math.floor(index / EMOJI_PER_SHEET),
    row: Math.floor(index % EMOJI_PER_SHEET / 4),
    col: index % EMOJI_PER_SHEET % 4,
  }
}

const App: React.FC<AppProps> = ({ emitter }) => {

  const [selectedSheet, setSheet] = useState(0)
  const [selectedIndex, setIndex] = useState(-1)


  //发送基本消息
  // useEffect(() => {
  //   emitter.emit('emoji bar create')
  //   //区分sheet和radio
  //   return () => {
  //     emitter.emit('emoji bar distroy')
  //   }
  // }, [])

  const sheetCnt = useRef<number>(0)
  const radios: ReactElement[] = []
  const sheets: ReactElement[] = [] 

  sheetCnt.current = Math.ceil(emojiArr.length / EMOJI_PER_SHEET)
   // const [springs, api] = useSprings(global.sheetCnt,)
  for(let i = 0; i < sheetCnt.current; i++) {
    radios.push(
    <a.div 
      key={i} 
      className="radio"
      onClick={() => setSheet(i)}
      style={{
        backgroundColor: i === selectedSheet ? "#c8c8c8" : "tomato"
      }}
    />)
  }

  for(let i = 0, j; i < emojiArr.length; i += EMOJI_PER_SHEET) {
    let emojis: JSX.Element[] = []
    for(let j = 0; j < EMOJI_PER_SHEET && j < emojiArr.length - i; j++) {
      emojis.push(
        <div
          key={`emoji${j}`}
          className={i + j === selectedIndex ? 'emoji-select' : 'emoji'}
          onMouseUp={() => {
            emitter.emit('select index', i + j)
          }}
          onMouseOver={() => setIndex(-1)}
            
          dangerouslySetInnerHTML={{__html: emojiArr[i+j]}}
        />
      )
    }
    sheets.push(<div key={`sheet${i}`} className="sheet">{emojis}</div>)
  }

  useEffect(() => {
    const off = emitter.on('escape', (dir: ESCAPE_KEY) => {

      if(dir === 'escape left') return

      if(selectedIndex === -1) {
        setIndex(0)
        return
      }
  
      let { sheet, row, col } = deConsIndex(selectedIndex)
  
      switch(dir) {
        case 'up': {
          row -= 1
          break
        }
        case 'down': {
          row += 1
          break
        }
        case 'left': {
          col -= 1
          break
        }
        case 'right': {
          col += 1
          break
        }
        case 'enter': {
          emitter.emit('select index', selectedIndex)
          return
        }
        default: return
      }
  
      if(row >= 4) row = 3
      if(row < 0) row = 0
      if(col >= 4) {
        sheet += 1
        col = 0
      } 
      if(col < 0) {
        sheet -= 1
        col = 3
      }
      
      if(sheet >= sheetCnt.current) sheet = 0
      if(sheet < 0) sheet = sheetCnt.current - 1
  
      let index = calcIndex(sheet, row, col)

      if(index >= emojiArr.length) 
        index = sheet = 0
      if(sheet !== selectedSheet)
        setSheet(sheet)

      setIndex(index)
    })

    return () => {
      emitter.emit('react destroy')
      off()
    }
  }, [selectedIndex])


  return (
    <>
      <div className="sheet-wrapper">
        { sheets[selectedSheet] }        
      </div>
      <div className="radio-wrapper">
        <div 
          className="radio-grid"
          style={{
            gridTemplateColumns: `repeat(${sheetCnt.current}, 1fr)`,
          }}
        >
          { radios }
        </div>
      </div>
    </>
  )
}


export default App