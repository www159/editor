import React from "react";
import { SpringValue, a } from "@react-spring/web";
import { tip, smile, warn, wrong } from './svgPath.json'

interface SvgProps {
//   svgStroke: string;
}

export const TipSvg: React.FC<SvgProps> = () => {
  return (
    <div className='icon'>
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <a.path
          fill="#ffffff"
          d={tip}
        //   strokeDasharray={svgStroke}
        />
      </svg>    
    </div>
  )
}

export const SmileSvg: React.FC<SvgProps> = () => {
  return (
    <div className='icon'>
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <a.path
          fill="#ffffff"
          d={smile}
        //   strokeDasharray={svgStroke}
        />
      </svg>    
    </div>
  )
}

export const WarnSvg: React.FC<SvgProps> = () => {
  return (
    <div className='icon'>
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <a.path
          fill="#ffffff"
          d={warn}
        //   strokeDasharray={svgStroke}
        />
      </svg>    
    </div>
  )
}

export const WrongSvg: React.FC<SvgProps> = () => {
  return (
    <div className='icon'>
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <a.path
          fill="#ffffff"
          d={wrong}
        //   strokeDasharray={svgStroke}
        />
      </svg>    
    </div>
  )
}