import { Schema, DOMParser, DOMSerializer, NodeSpec, MarkSpec } from 'prosemirror-model'
import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { EventEmitter } from './eventEmitter'
import {
    EditorOptions, Extension
} from './types'
import { keymap } from 'prosemirror-keymap'
import { InputRule, inputRules } from 'prosemirror-inputrules'
import { getClipboardTextSerializer } from './common/clipboardTextSerializer'
import { ExtensionResolver } from './extensionResolver'
import { elementFromString } from './utils/elementFromString'
// import { isConstTypeReference } from 'typescript'

export class Editor extends EventEmitter  {

    private options: EditorOptions = {
        dom: document.createElement('div'),
        content: '',
        // json: JSON.parse('1'),
        extensions: new Array<Extension>(),
        onCreate: () => null,
        onUpdate: () => null,
        onSelectionUpdate: () => null,
        onDestroy: () => null,
    }

    schema: Schema

    public view: EditorView

    constructor(options: EditorOptions) {
        super()
        
        /**
         * @todo menu 的处理逻辑
         */
        this.setOptions(options)
        this.createView()
        this.on('create', this.options.onCreate)
        this.on('update', this.options.onUpdate)
        this.on('selection update', this.options.onSelectionUpdate)
        this.on('destroy', this.options.onDestroy)
    }

    private setOptions(options: EditorOptions) {
        this.options = {
            ...this.options,
            ...options,
        }

        let { dom } = this.options

        dom.spellcheck = false
        // let menuContainer = this.options.dom.appendChild(document.createElement('div'))
        dom.setAttribute('data-weditor-container', 'true')
        dom.tabIndex = -1
        dom.onfocus = () => {
            // dom.classList.add('container-focus')
            this.view.focus()
        }
        
    }

    private createView() {
        //plugin
        const resolver = new ExtensionResolver(this.options.extensions, this)
        let { schema } = resolver
        // plugins.push(getClipboardTextSerializer(schema))
        // console.log(plugins)
        this.schema = schema
        // console.log(elementFromString(this.options.content))
        this.view = new EditorView(this.options.dom, {
            state: EditorState.create({
                doc: this.options.json ? this.schema.nodeFromJSON(this.options.json) : DOMParser.fromSchema(this.schema).parse(elementFromString(this.options.content)),
            }),
            dispatchTransaction: this.dispatchInner.bind(this)
        })

        // console.log(this.state.doc.toJSON())

        /**
         * @todo 需要内部粘贴板交给底层
         */

        // const newState = this.state.reconfigure({
        //     plugins: resolver.plugins.concat([getClipboardTextSerializer(schema)])
        // })

        const newState = this.state.reconfigure({
            plugins: resolver.plugins
        })

        this.view.updateState(newState)
        this.emit('create', { editor: this })
    }

    private dispatchInner(tr: Transaction) {
        let newState = this.state.apply(tr),
            selChange = !this.state.selection.eq(newState.selection)

        this.view.updateState(newState)
        if(selChange) {
            this.emit('selection change', {
                editor: this,
                tr
            })
        }

        this.emit('update', { 
                editor: this,
                tr 
            })
    }

    /*********************************** editor event ***********************************/

    public get state(): EditorState {
        return this.view.state
    }

    public destroy() {
        this.emit('destroy')
        this.view && this.view.destroy()
        this.destoryAllListeners()
    }

}


