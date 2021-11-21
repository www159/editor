import { Command } from "prosemirror-commands";
import { Fragment, pmNode, Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ComponentType, ReactElement } from "react";
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