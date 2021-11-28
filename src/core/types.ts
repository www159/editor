import { InputRule } from "prosemirror-inputrules";
import { MenuItem } from "prosemirror-menu";
import { NodeSpec, NodeType, MarkSpec, Node, MarkType, Mark } from "prosemirror-model";
import { NodeSelection, Plugin, Transaction } from "prosemirror-state";
import { Command, Keymap } from "prosemirror-commands";
import { Editor, WSchema } from ".";

/*********************************** model-fixed ***********************************/

export type Realize<T> = 
T extends null | undefined ?
never :
T   

declare module 'prosemirror-model' {
    interface Fragment {
        content: Array<pmNode>
    }
    export interface NodeSpec {
        toText?: (node: pmNode, indent: number) => DOMOutputSpec,
        // priority?: number
    }

    export interface pmNode<S extends Schema = any> extends Node<S> {

    }

    export interface pmMark<S extends Schema = any> extends Mark<S> {

    }

    export interface NodeType {
        compatibleContent(other: NodeType): boolean
    }
}

/*********************************** extension func ***********************************/


export type DispatchFunc = ((tr: Transaction) => void) | undefined

export type InputRulesFunc = (this: {
    editor: Editor,
    type: NodeType | MarkType | null,
}) => Array<InputRule>

export type shortcutKeyFunc = (this: {
    editor: Editor,
    type: NodeType | MarkType | null,
}) => Keymap

export type wrappedPluginFunc = (this: {
    editor: Editor,
}) => Array<Plugin>
/*********************************** basic event ***********************************/

interface BasicEvent {
    onCreate: ((prop: { editor: Editor }) => void) | (() => null)
    onUpdate: ((prop: { editor: Editor, tr: Transaction }) => void) | (() => null)
    onSelectionUpdate: ((prop: { editor: Editor, tr: Transaction }) => void) | (() => null)
    onDestroy: (() => void) | (() => null)
}

/*********************************** Extension ***********************************/

export interface Extension extends Partial<BasicEvent> {
    type: ExtensionType
    node?: { [name: string]: NodeSpec } 
    mark?: { [name: string]: MarkSpec }
    plugins?: Array<Plugin>

    inputRules?: InputRulesFunc

    shortcutKey?: shortcutKeyFunc

    wrappedPlugin?: wrappedPluginFunc

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

export type ExtensionType = 'MARK' | 'NODE' | 'PLUGIN'

/*********************************** commands ***********************************/

// export type GnlCommands = Record<string, (...args: any[]) => Command>

/*********************************** interface merge ***********************************/
export type ConsNode<T extends string = any> = {
    [key in T]: NodeSpec
}

export type ConsMark<T extends string = any> = {
    [key in T]: MarkSpec
}

//*********************************** event emitter ***********************************/