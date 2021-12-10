import { pcBaseKeymap } from "prosemirror-commands";
import { executeCmdsStrit, executeCmdsTry, wrapRaw } from "../commandsHelper";
import { applyExecuter } from '@editor/utils'
let {
    // Enter,
    // 'Mod-Enter': ModEnter,
    // Backspace,
    // 'Mod-Backspace': ModBackspace,
    // Delete,
    // 'Mod-Delete': ModDelete,
    // 'Mod-a': ModA,
} = pcBaseKeymap


export const Enter = wrapRaw(pcBaseKeymap['Enter'])
export const ModEnter = wrapRaw(pcBaseKeymap['Mod-Enter'])
export const Backspace = wrapRaw(pcBaseKeymap['Backspace'])
export const ModBackspace = wrapRaw(pcBaseKeymap['Mod-Backspace'])
export const Delete = wrapRaw(pcBaseKeymap['Delete'])
export const ModDelete = wrapRaw(pcBaseKeymap['Mod-Delete'])
export const ModA = wrapRaw(pcBaseKeymap['Mod-a'])


const strict = applyExecuter(executeCmdsStrit)
const wrapBaseKeymap = {
    Enter: strict(Enter),
    'Mod-Enter': strict(ModEnter),
    Backspace: strict(Backspace),
    'Mod-Backspace': strict(ModBackspace),
    Delete: strict(Delete),
    'Mod-Delete': strict(ModDelete),
    'Mod-A': strict(ModA),
}

export default wrapBaseKeymap