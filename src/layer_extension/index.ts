import { EditorEmitter, EventEmitter, Extension } from "@editor/core";
import { attachGlobal, reactDirAttach } from "@editor/utils";
import Layer from './Layer'

export type IconType = 
| 'TIP'
| 'WARNING'
| 'WRONG'
| 'SMILE'

declare module '@editor/core' {

    interface EditorPorts {
        'layer': {
            'layer': [content: string, delay?: number, icon?: IconType]
            'confirm': [content: string, button?: [btn1: () => void, btn2?: () => void], icon?: IconType]
    
        }
    }
}


interface LayerStorage {  
    layer: HTMLDivElement 
}

/**
 * ## layer:
 * - 分类
 *  1. 提示
 *  2. 警告
 *  3. 错误
 *  4. 笑脸
 *  5. 生气
 */

export const layerExtension: Extension<LayerStorage> = {
    type: 'REDUCER',

    storage: {
        layer: document.createElement('div'),
    },
    onCreate() {
        const { editor, storage: { layer } } = this
        reactDirAttach(Layer, { emitter: editor }, layer)
        attachGlobal(editor.view, layer)
        layer.className = 'layer-wrapper'
    },
    reducer() {
        const { emitter, storage: { layer } } = this
        emitter.onPort('layer', 'layer', (content, deplay, icon) => {
            if(icon === 'WRONG') throw new Error(content)
        })
        emitter.onPort('layer', 'confirm', (content, button, icon) => {
            // console.log(content, button, icon)
        })
    }
}
