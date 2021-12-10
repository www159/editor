import { Editor } from "@editor";
import { WrapCmdFunc, CommandProps, EditorEmitter, WSchema, DispatchFunc, ExecuterProps, CmdExecuter } from "@editor/core";
import { Command } from "prosemirror-commands";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

/**
 * 函数式编程
 * 每一个命令都是一个简单的元素。
 * 所有的命令组成一个范畴，命令可以组成串行命令，选择命令。
 * 串行命令和选择命令都是特化的命令。这些命令都可以
 */


type Booleanable<T> = Extract<T, boolean>
type SameLength<T extends any[]> = Extract<{ [K in keyof T]: any }, any[]>

type Curried<A extends any[], R> =
  <P extends A>(...args: P) => P extends A ?  R :
    A extends [...SameLength<P>, ...infer S] ? S extends any[] ? Curried<S, R> :
    never : never;

type rCurried<A extends any[], R> = 
    <P extends A>(...args: P) => P extends A ? R :
    A extends [...infer S, ...SameLength<P>] ? S extends any[] ? rCurried<S, R> :
    never : never

const curry = function<A extends any[], R>(fn: (...args: A) => R): Curried<A, R> {
    const _args: A[] = []
    return function cuy(...rest: any[]): any {
        if(_args.length === fn.length) return (fn as any)(..._args)
        else if(rest.length) _args.push(...rest)
        return cuy 
    }
}

    

export const rawCmdWrapper = (cmd: Command): WrapCmdFunc => (props: CommandProps) => cmd(props.state, props.dispatch, props.view)

export const wrapRaw = rawCmdWrapper

type HyperCmd<A extends any[]> = (...args: A) => (props: CommandProps) => boolean

export const hyperCmdBind = <A extends any[]>(hypeCmd: HyperCmd<A>) => (...args: A): WrapCmdFunc => (props: CommandProps) => {
    return hypeCmd(...args)(props)
}

/**
 * chainSelectCmd用作
 * select是一个转接口。亦是一个命令
 * @param cmds 
 * @returns 
 */
const executeCmdSelect = (executer: CmdExecuter): CmdExecuter => (props: ExecuterProps, initTr) => (...cmds: WrapCmdFunc[]) => {
    // const cmdProps: CommandProps = {
    //     ...props,
    //     serial: executer(props, initTr),
    //     select: executeCmdSelect(executer)(props, initTr)
    // }
    for(let i = 0; i < cmds.length; i++) {
        if(executer(props, initTr)(cmds[i])) return true
    }
    return false
}


export const selectCmd = (...cmds: WrapCmdFunc[]): WrapCmdFunc => (props) => props.select(...cmds)


export const serialCmd = (...cmds: WrapCmdFunc[]): WrapCmdFunc => (props) => props.serial(...cmds)


//严格模式，每个单任务都会dispatch。并try catch
export const executeCmdsStrit: CmdExecuter = (props) => (...cmds) => {
    const cmdProps = {
        ...props,
        serial: executeCmdsStrit(props),
        select: executeCmdSelect(executeCmdsStrit)(props)
    }
    
    props.view.dispatch(props.state.tr)
    for(let i = 0; i < cmds.length; i++) {
        try {
            const result = cmds[i](cmdProps)
            // console.log('in executer', cmds.length, props.state.selection.toJSON())
            cmdProps.state = cmdProps.view.state
            if(result === false)
                if( i < cmds.length - 1) throw new Error('串行命令中断')
                else return false
            
        }
        catch(e) {
            console.error(e)
            return false
        }
    }
    return true
}

//试图全部执行后再返回是否全部执行。使用兼容模式
export const executeCmdsTry: CmdExecuter = (props, initTr) => (...cmds) => {
    const fromInitTr = !!initTr
    const tr = fromInitTr ? initTr : props.state.tr
    const cmdProps = {
        ...rxProps(tr, props),
        dispatch: pseudoDispatch,
        serial: executeCmdsTry(props, tr),
        select: executeCmdSelect(executeCmdsTry)(props, tr)
    }
    let result = true
    for(let i = 0; i < cmds.length; i++) {
        result = result && cmds[i](cmdProps)
    }
    //真正的dispatch
    // const {  dispatch } = cmdProps
    const { view } = cmdProps
    if(!fromInitTr) view.dispatch(tr)
    return result
}

//只验证是否能执行
export const executeCmdsCan: CmdExecuter = (props) => (...cmds) => {
    const cmdProps: CommandProps = {
        ...rxProps(props.state.tr, props),
        dispatch: undefined,
        serial: executeCmdsCan(props),
        select: executeCmdSelect(executeCmdsCan)(props),
    }
    let result = true
    for(let i = 0; i < cmds.length; i++) {
        result = result && cmds[i](cmdProps)
    }
    return result
}

// export const executerBind = (executer: CmdExecuter) => (props: ExecuterProps) => (...cmds: WrapCmdFunc[]) => {
//     return executer(cmds)(props)
// }


// export const executeEmbed: CmdExecuter = (cmds: WrapCmdFunc[]) => (props: CommandProps) => {
//     let result = true
//     const cmdProps = rxProps(props)
//     cmds.forEach(cmd => {
//         console.log(props.state.tr.steps)
//         result = result && cmd(props)
//         //严格模式下，每一次迭代都会生成新的state，因此旧的state表现为
//         // console.log(props.state.tr.docChanged)
//         if(props.state) props.state = props.view.state
//     })
//     return result
// }


export const pseudoDispatch = (tr: Transaction<WSchema>) => false

//pm风格的commands，异常处理交给prosemirror。
//当然如果传入的任务自带拦截器，则异常处理交给拦截器


export const rxProps = (tr: Transaction, props: ExecuterProps): ExecuterProps => {
    const { state } = props.view
    return {
        ...props,
        state: serialableState(state, tr)
    }
}

export const serialableState = (state: EditorState, tran: Transaction): EditorState => {
    return {
        ...state,
        schema: state.schema,
        plugins: state.plugins,
        apply: state.apply.bind(state),
        applyTransaction: state.applyTransaction.bind(state),
        reconfigure: state.reconfigure.bind(state),
        toJSON: state.toJSON.bind(state),
        get storedMarks() {
            return tran.storedMarks
        },
        get selection() {
            return tran.selection
        },
        get doc() {
            return tran.doc
        },
        get tr() {
            return tran
        },
    }
} 

// export const applyExecuter = (props: ExecuterProps) => (executer: CmdExecuter) => (...cmds: WrapCmdFunc[]) => executer(props)(...cmds)
