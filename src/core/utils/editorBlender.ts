import { Editor } from "@editor"
import { ExecCmdFunc } from "@editor/core"

export const editorBlender = (editor: Editor) => (cmd: ExecCmdFunc) => () => {
    const { state, view } = editor
    const { dispatch } = view
    return cmd({ state, view, dispatch, emitter: editor })
}