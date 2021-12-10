import { commandPack, ExecCmdFunc, WrapCmdFunc } from "@editor/core";
import { applyExecuter } from "@editor/utils";
import { executeCmdsCan, executeCmdsStrit, executeCmdsTry } from "../commandsHelper";

declare module '@editor/core' {
    interface commandPack {
        type?: 'strict' | 'can' | 'try'
        cmd: WrapCmdFunc
    }
}

export function commandReducer(cmd: WrapCmdFunc | commandPack): ExecCmdFunc {
    //单传一个函数，默认为try function
    if(typeof cmd === 'function')
        return applyExecuter(executeCmdsTry)(cmd)   
    
    const { type, cmd: command } = cmd
    switch(type) {
        case 'can': return applyExecuter(executeCmdsCan)(command)
        case 'strict': return applyExecuter(executeCmdsStrit)(command)
        default: return applyExecuter(executeCmdsTry)(command)
    }
}