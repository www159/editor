import { chainCommands, Command } from "prosemirror-commands";
import { Fragment, ResolvedPos, Schema, pmNode } from "prosemirror-model";
import { EditorState, IMeta, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { findWrapping, Step, StepMap } from "prosemirror-transform"
import { ComponentType, PureComponent, ReactElement } from "react";
import ReactDOM from "react-dom";

// import { hot } from "react-hot-loader"
import { DispatchFunc, Editor, EventEmitter, Realize, WSchema } from "./core";
import React from "react"



/*********************************** nodeView ***********************************/

export function basicSelection(node: Node) {
    (node as HTMLElement).classList.add('ProseMirror-selectednode')
}

export function basicDeselection(node: Node) {
    (node as HTMLElement).classList.remove('ProseMirror-selectednode')
}

/*********************************** combine react and ts ***********************************/

export function reactDomAttach<P>(Component_: ComponentType<P>, props: P, father: Node, focus = false) {
    // const Hot = hot(module)(Component_, props)
    const son = new Promise<HTMLDivElement>(res => {
       const son = father.appendChild(document.createElement('div'))
       ReactDOM.render(<Component_ {...props} />, son, () => res(son))
   })
    // const son = father.appendChild(document.createElement('div'))
    // ReactDOM.render(<Hot {...props}/>, son)
    // if(focus) son.focus()
    return son
}

export function reactDirAttach<P>(Compnent_: ComponentType<P>, props: P, dom: HTMLElement) {
    return new Promise<HTMLElement>(res => {
        ReactDOM.render(<Compnent_ {...props}/>, dom, () => res(dom))
    })
}

export function reactDomUnattach(node: Node) {
    const result = ReactDOM.unmountComponentAtNode(node as Element)
}

export function attachGlobal(view: EditorView, dom: Node) {
    const father = view.dom.parentNode
    if(father) father.appendChild(dom)
    return dom
}

/*********************************** resolve if...else... ***********************************/

class WrappedBoolean {

    value: boolean

    constructor(val: boolean) {
        this.value = val
    }

    then() {
       return new WrappedBoolean(this.value)
    }

    endif() {
        return new WrappedBoolean(this.value)
    }
    
    final() {
        return this.value
    }
}

/**@deprecated */
export class Procedure<T> {

    value: T | WrappedBoolean

    constructor(argv: T) {
        this.value = argv
    }

    then<NT = unknown>(func?: (argv: T) => NT | boolean) {
        if(!func) return new WrappedBoolean(true)
        const ret =  func(this.value as T)
        if(ret === false) return new WrappedBoolean(false)
        return new Procedure(ret as NT)
    }

    endif() {
        return this.value as T
    }

    final() {
        if(this.value instanceof WrappedBoolean) return this.value.final()
        return true
    }
}

/**@deprecated */
export function setStyle(elm: HTMLElement, style: string) {
    elm.style.cssText = style
}

/*********************************** event emit among prosemirror plugins  ***********************************/

export function deConsView(view: EditorView) {
    const { state, dispatch } = view
    const { tr } = state
    return { tr, dispatch }
}

export function pmEmit<T, S extends Schema = any, A = any>(view: EditorView, dest: PluginKey<T, S, A> | Plugin<T, S, A>, meta: IMeta<A>) {
    const { tr, dispatch } = deConsView(view)
    dispatch(tr.setMeta(dest, meta))
}

export function pmEmitAsync<T, S extends Schema = any, A = any>(view: EditorView, dest: PluginKey<T, S, A> | Plugin<T, S, A>, meta: IMeta<A>) {
    setTimeout(() => {
       pmEmit(view, dest, meta)
    }, 20)
}

export function pmFetch<T, S extends Schema = any, A = any>(tr: Transaction, dest: PluginKey<T, S, A> | Plugin<T, S, A>) {
    return tr.getMeta<A>(dest)
}

/*********************************** command assisant ***********************************/

export function createWrapper(wrappers: Realize<ReturnType<typeof findWrapping>>) {
    let content = Fragment.empty
    for(let i = wrappers.length - 1; i >= 0; i--) 
        content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content))
    return content
}

export function serialCommands(...commands: Command[]) {
    return function(state: EditorState, dispatch: DispatchFunc, view: EditorView): boolean {
        for(let i = 0; i < commands.length; i++) {
            let result = commands[i](state, dispatch, view)
            
            state = view.state
            if(i + 1 === commands.length) {
                return result
            }
        }
        return true
    }
}

export function makeTextFragment<S extends WSchema>(text: string | null | undefined, schema: S): Fragment<S> {
    if(!text) return Fragment.empty
    return Fragment.from(schema.text(text) as pmNode)
}

export function multiSteps<S extends WSchema>(tr: Transaction<S>, steps: Step[]) {
    steps.forEach(step => {
        const mappingStep = step.map(tr.mapping)
        if(mappingStep) tr.step(mappingStep)
    })
    // steps.reduce((prev: Step, curr: Step, index: number) => {
    //     const mappingStep = curr.map(tr.mapping)
    //     if(mappingStep) {
    //         tr.step(mappingStep)
    //         return mappingStep
    //     }
    //     return prev
    // })
}

export function parentPos($pos: ResolvedPos, depth: number = -1) {
    return $pos.node(depth - 1).resolve($pos.posAtIndex($pos.index(depth), depth))
}

export interface InlineBound {
    left: number
    bottom: number
    right: number
}

export function inlineBound<T extends Schema>(view: EditorView<T>, pos: number): InlineBound {
    const { left, bottom } = view.coordsAtPos(pos)
    const { right } = view.dom.getBoundingClientRect()
    return {
        left,
        bottom,
        right,  
    }
}

/*********************************** editor assistant  ***********************************/
export function nodesFromEditor(editor: Editor) {
    const { schema: { nodes } } = editor
    return nodes
}

export function marksFromEditor(editor: Editor) {
    const { schema: { marks } } = editor
    return marks
}

/*********************************** common  ***********************************/
export async function setTimeoutAsync(fn: () => Promise<void>, delay: number) {
    return new Promise<void>(res => {
        setTimeout(async () => {
            await fn()
            res()
        }, delay)
    })
}

export function multiOff(offs: (() => void)[]) {
    offs.forEach(off => off())
}