import { Extension } from "@editor/core";

declare module '@editor/core' {

    interface LayerEvents {
        'layer ## layer': [content: string, delay: number, icon?: number]
        'layer ## confirm': [content: string, button?: [btn1: () => void, btn2?: () => void], icon?: number]
    }

    interface EditorEvents extends LayerEvents {}
}

export const layerExtension: Extension = {
    type: 'REDUCER',

    storage: {
        layer: document.createElement('div')
    },
    reducer() {
        const { emitter, storage: { layer } } = this
        emitter.on('layer ## layer', createLayer)
        emitter.on('layer ## confirm', createConfirm)
    }
}

function createLayer(content: string, delay: number, icon?: number) {

}

function createConfirm(content: string, button?: [btn: () => void, btn2?: () => void], icon?: number) {

}
