import { Editor, EditorEvents, Extension } from "@editor/core";
import { inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { NodeType, MarkType } from "prosemirror-model";
import { Plugin } from "prosemirror-state";

export function bindFunc(extension: Extension, context: {
    editor: Editor,
    type: NodeType | MarkType | null
}): Plugin[] {
    const { storage } = extension
    const { editor } = context
    let plugins = new Array<Plugin>()
    if(extension.inputRules) {
        // console.log(extension.inputRules.apply(context))
        plugins.push(inputRules({
            rules: extension.inputRules.apply(context)
        }))
    }
    if(extension.shortcutKey) {
        // console.log(extension.shortcutKey   )
        plugins.push(
            keymap(extension.shortcutKey.apply(context))
        )
    }

    if(extension.wrappedPlugin) {
        plugins = plugins.concat(extension.wrappedPlugin.apply(context))
    }

    if(extension.reducer) {
        extension.reducer.apply({ emitter: context.editor, storage })
    }

    if(extension.onCreate) {
        // extension.onCreate.bind({
        //     editor,
        //     storage,
        // })
        editor.on('create', () => extension.onCreate?.apply({editor, storage}))
    }

    if(extension.onUpdate) {
        extension.onUpdate.bind({
            editor,
            storage,
        })
        editor.on('update', extension.onUpdate)
    }

    return plugins
}