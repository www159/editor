import { Editor, Extension } from "@editor/core";
import { inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { NodeType, MarkType } from "prosemirror-model";
import { Plugin } from "prosemirror-state";

export function bindFunc(extension: Extension, context: {
    editor: Editor,
    type: NodeType | MarkType | null
}): Plugin[] {
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

    return plugins
}