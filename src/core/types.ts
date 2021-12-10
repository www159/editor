import { InputRule } from "prosemirror-inputrules";
import { MenuItem } from "prosemirror-menu";
import { NodeSpec, NodeType, MarkSpec, Node, MarkType, Mark, Schema, pmNode } from "prosemirror-model";
import { EditorState, NodeSelection, Plugin, Transaction } from "prosemirror-state";
import { chainCommands, Command, Keymap } from "prosemirror-commands";
import { Editor, EditorEvents, EventEmitter } from ".";
import { Step, Transform } from 'prosemirror-transform'
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

    export interface pmNode<S extends Schema = any> extends Node<S> {
    }

    export interface NodeType {
        compatibleContent(type: NodeType): Fragment
    }

    export interface pmMark<S extends Schema = any> extends Mark<S> {

    }
}  

// declare module 'prosemirror-state' {
//     // export interface Transaction<S extends Schema = any> extends Transform<S>  {
//     //     addStep: (step: Step<S>, doc: pmNode<S>) => void
//     // }
// } 

declare module '@editor/core' {

export type Realize<T> = 
T extends null | undefined ?
never :
T   

/*********************************** extensive prosemirror ***********************************/ 

export interface WNode { [key: string]: unknown }

export interface WMark { [key: string]: unknown }

export interface WSchema extends Schema<WNode, WMark> {}

export interface pmMark extends Node<WSchema> {}

export interface WNodeType extends NodeType<WSchema> {}

export interface WMarkType extends MarkType<WSchema> {}

export interface WEditorState extends EditorState<WSchema> {}

export interface WEditorView extends EditorView<WSchema> {}

export interface WKeymap extends Keymap<WSchema> {}


export interface WInputRule extends InputRule<WSchema> {}
/*********************************** extension func ***********************************/

export type DispatchFunc = ((tr: Transaction<WSchema>) => void) | undefined

export type InputRulesFunc = (this: {
    editor: Editor,
    type: NodeType | MarkType | null
}) => Array<InputRule<WSchema>>

export type shortcutKeyFunc = (this: {
    editor: Editor
}) => WrapKeymap

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

/*********************************** commands ***********************************/
/**
 * 命令的执行就像遍历二叉树。因为pm并非事件委托，因此指令需要循环遍历。
 * 1. 只要执行到一个命令即可。用来绑定快捷键。比如回车的效果取决于选区的内容。
 * 2. 串行执行所有指令。比如我要实现快捷键删除两下（比较低级）为了服用代码
 * 就需要串行。
 * 3. 并行执行。。。。没这么复杂好伐。
 * 
 * oo还是函数式编程？
 * oo可以使用一个对象进行链式调用（就像tiptap一样）
 * 而函数式需要通过函数来完成生命周期，适当的柯里化可以增加美观。
 * 这里试用一下柯里化来改写chainCommands和SerialCommands。
 * 这样就可以任意组合commands来生成新的commands。这时候函数
 * 的语义化就派上用场了当然需要一个全局命令执行函数。
 * 接着keymap只支持一对一，这个是约定成俗。
 * 
 * 最后就是commands的参数问题。因为作者约定使用tr和dispatch。
 * 如果有需要还可以传view。我的理解是传入一个对象来实现。适合解构。
 * 为了适配keyMap增加一个Rawize即可
 */

export interface ExecuterProps {
    emitter: EditorEmitter          //用作emitter，和react绑定
    state: EditorState<WSchema>     //保存schema，pluginState。用作多plugin协作。
    dispatch: DispatchFunc          //tr用到视图层
    view: EditorView                //保证每个视图都是最新的
}

export interface CommandProps extends ExecuterProps {
    select: (...cmds: WrapCmdFunc[]) => boolean
    serial: (...cmds: WrapCmdFunc[]) => boolean            //处理嵌套chain和serial互相嵌套的问题
}

export type WrapCmdFunc = (props: CommandProps) => boolean

export type ExecCmdFunc = (props: ExecuterProps) => boolean

export type CmdExecuter = (props: ExecuterProps, initTr?: Transaction<WSchema>) => (...cmds: WrapCmdFunc[]) => boolean

export type appliedExecuter = (...cmds: WrapCmdFunc[]) => ExecCmdFunc

export type executerApplyer = (executer: CmdExecuter) => (...cmds: WrapCmdFunc[]) => ExecCmdFunc

export type HyperCmd<A extends any[]> = (...args: A) => (props: ExecuterProps) => boolean

export type keyboardCmd = () => WrapCmdFunc

export type WrapKeymap = { [key: string]: (WrapCmdFunc | commandPack) }

}
