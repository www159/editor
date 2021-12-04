import { InputRule } from "prosemirror-inputrules";
import { MenuItem } from "prosemirror-menu";
import { NodeSpec, NodeType, MarkSpec, Node, MarkType, Mark, Schema, WrapAttrN, WrapAttrM } from "prosemirror-model";
import { EditorState, NodeSelection, Plugin, Transaction } from "prosemirror-state";
import { chainCommands, Command, Keymap } from "prosemirror-commands";
import { Editor, EditorEvents, EventEmitter, pmNode } from ".";
import { EditorView } from "prosemirror-view";

/*********************************** model-fixed ***********************************/


declare module 'prosemirror-model' {
    interface Fragment {
        content: Array<pmNode>
    }
    export interface NodeSpec {
        toText?: (node: pmNode, indent: number) => DOMOutputSpec,
        // priority?: number
    }

    // export interface pmNode<S extends Schema = any> extends Node<S> {

    // }

    // export interface pmMark<S extends Schema = any> extends Mark<S> {

    // }
}  

declare module '@editor/core' {

export type Realize<T> = 
T extends null | undefined ?
never :
T   

/*********************************** extensive prosemirror ***********************************/ 

export interface WNode { [key: string]: unknown }

export interface WMark { [key: string]: unknown }

export interface WSchema extends Schema<WNode, WMark> {}

export interface pmNode extends Node<WSchema> {}

export interface pmMark extends Node<WSchema> {}

export interface WNodeType extends NodeType<WSchema> {}

export interface WMarkType extends MarkType<WSchema> {}

export interface WEditorState extends EditorState<WSchema> {}

export interface WEditorView extends EditorView<WSchema> {}

export interface WKeymap extends Keymap<WSchema> {}

export interface WCommand extends Command<WSchema> {} 

export interface WInputRule extends InputRule<WSchema> {}
/*********************************** extension func ***********************************/

export type DispatchFunc = ((tr: Transaction<WSchema>) => void) | undefined

export type InputRulesFunc = (this: {
    editor: Editor,
    type: NodeType<WSchema> | MarkType<WSchema> | null,
}) => Array<InputRule<WSchema>>

export type shortcutKeyFunc = (this: {
    editor: Editor,
    type: NodeType<WSchema> | MarkType<WSchema> | null,
}) => Keymap<WSchema>

export type wrappedPluginFunc = (this: {
    editor: Editor,
}) => Array<Plugin<any, WSchema>>

/*********************************** basic event ***********************************/

interface BasicEvent {
    onCreate: ((prop: { editor: Editor }) => void) | (() => null)
    onUpdate: ((prop: { editor: Editor, tr: Transaction }) => void) | (() => null)
    onSelectionUpdate: ((prop: { editor: Editor, tr: Transaction }) => void) | (() => null)
    onDestroy: (() => void) | (() => null)
}

/*********************************** Extension ***********************************/

export interface Extension<Storage = any> {
    type: ExtensionType
    node?: { [name: string]: NodeSpec } 
    mark?: { [name: string]: MarkSpec }
    plugins?: Array<Plugin<any, WSchema>>

    storage?: Storage

    onCreate?: (this: {
        editor: Editor
        storage: Storage
    }) => void

    onUpdate?: (this: {
        editor: Editor
        storage: Storage
    }) => void

    reducer?: (this: {
        emitter: EditorEmitter
        storage: Storage
    }) => void

    inputRules?: InputRulesFunc

    shortcutKey?: shortcutKeyFunc

    wrappedPlugin?: wrappedPluginFunc

    addCommands?: (this: {
        editor: Editor
    }) => { [key: string]: Function }

    priority?: number


    // commands?:(this: {
    //     editor: Editor,
    //     type: NodeType | MarkType,
    // }) => Command
}

export type Extensions = Array<Extension>



/*********************************** editor etc ***********************************/

export interface EditorOptions extends BasicEvent {
    extensions: Array<Extension>
    dom: HTMLElement
    content: string
    json?: JSON
}

export type ExtensionType = 'MARK' | 'NODE' | 'PLUGIN' | 'REDUCER'

/*********************************** commands ***********************************/

// export type GnlCommands = Record<string, (...args: any[]) => Command>

/*********************************** interface merge ***********************************/
export type ConsNode<T extends { [key: string]: any } = any> = {
    [key in keyof T]: NodeSpec
}

export type ConsMark<T extends string = any> = {
    [key in T]: MarkSpec
}
/*********************************** editor events ***********************************/
export type EditorEmitter = EventEmitter<EditorEvents, EditorPorts>
}
