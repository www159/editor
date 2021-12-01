import { EditorEmitter, EventEmitter, Extension } from "@editor/core";

declare module '@editor/core' {

    interface EditorPorts {
        'layer': {
            'layer': [content: string, delay: number, icon?: number]
            'confirm': [content: string, button?: [btn1: () => void, btn2?: () => void], icon?: number]
    
        }
    }
}


interface LayerStorage {  
    layer: HTMLDivElement 
}

export const layerExtension: Extension<LayerStorage> = {
    type: 'REDUCER',

    storage: {
        layer: document.createElement('div'),
    },
    onCreate() {
        
    },
    reducer() {
        const { emitter, storage: { layer } } = this
        emitter.onPort('layer', 'layer', (content, deplay, icon) => {
            console.log(content, deplay, icon)
        })
        emitter.onPort('layer', 'confirm', (content, button, icon) => {
            console.log(content, button, icon)
        })
    }
}
