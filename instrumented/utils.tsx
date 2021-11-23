import { Command } from "prosemirror-commands";
import { Fragment, pmNode, Schema } from "prosemirror-model";
import { EditorState, IMeta, Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ComponentType, PureComponent, ReactElement } from "react";
import ReactDOM from "react-dom";
// import { hot } from "react-hot-loader"
import { DispatchFunc, EventEmitter } from "./core";
import React from "react"



export function makeTextFragment<S extends Schema<any, any>>(text: string, schema: S): Fragment<S> {
    return Fragment.from(schema.text(text) as pmNode<S>)
}

export function basicSelection(node: Node) {
    (node as HTMLElement).classList.add('ProseMirror-selectednode')
}

export function basicDeselection(node: Node) {
    (node as HTMLElement).classList.remove('ProseMirror-selectednode')
}

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

export function deConsView(view: EditorView) {
    const { state, dispatch } = view
    const { tr } = state
    return { tr, dispatch }
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

export function attachGlobal(view: EditorView, dom: Node) {
    const father = view.dom.parentNode
    if(father) father.appendChild(dom)
    return dom
}

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

export function setStyle(elm: HTMLElement, style: string) {
    elm.style.cssText = style
}

export function pmEmit<T, S extends Schema = any, A = any>(view: EditorView, dest: PluginKey<T, S, A> | Plugin<T, S, A>, meta: IMeta<A>) {
    const { tr, dispatch } = deConsView(view)
    dispatch(tr.setMeta(dest, meta))
}

export function pmEmitAsync<T, S extends Schema = any, A = any>(view: EditorView, dest: PluginKey<T, S, A> | Plugin<T, S, A>, meta: IMeta<A>) {
    const { tr, dispatch } = deConsView(view)
    setTimeout(() => {
        dispatch(tr.setMeta(dest, meta))
    }, 20)
}

export function pmFetch<T, S extends Schema = any, A = any>(view: EditorView, dest: PluginKey<T, S, A> | Plugin<T, S, A>) {
    const { tr } = deConsView(view)
    return tr.getMeta<A>(dest)
}