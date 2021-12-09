import { Editor, EditorEvents, Extension } from "@editor/core";
import { applyExecuter, editorBlender } from "@editor/utils";
import { inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { NodeType, MarkType } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { executeCmdsCan, executeCmdsStrit, executeCmdsTry } from "../commandsHelper";

const executeContext = {
    appliedStrict: applyExecuter(executeCmdsStrit),
    appliedTry: applyExecuter(executeCmdsTry),
    appliedCan: applyExecuter(executeCmdsCan),
    applyer: applyExecuter

}

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
        const wrapKeymap = extension.shortcutKey.apply({
            ...executeContext,
            editor
        })
        plugins.push(keymap(Object.fromEntries(Object.entries(wrapKeymap).map(([name, wrapCmd]) => [name, editorBlender(editor)(wrapCmd)]))))
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