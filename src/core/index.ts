import { NodeSpec, Schema } from 'prosemirror-model'

export type {
    Extension,
    DispatchFunc,
    Extensions,
    ExtensionType,
    Realize,
    InputRulesFunc,
    shortcutKeyFunc,
    ConsNode,
    ConsMark
} from './types'

export {
    Editor
} from './editor'

export {
    EventEmitter
} from './eventEmitter'

export declare interface WNode {}

export declare interface WMark {}

export declare interface WSchema extends Schema<keyof WNode, keyof WMark> {}