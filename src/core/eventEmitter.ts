/**
 * @todo
 * 事件队列
 */

declare module '@editor/core' {
    interface EditorEvents {}

    interface EditorPorts {}
}

type EventWrap = { [key: string]: any }

type TupFunc<T extends any[]> = (...args: T) => void

type EventFns<T extends EventWrap> = {
    [key in keyof T]: ((...args: T[key]) => void)[]
}

type PortWrap = { [key: string]: any }

type Emitters<P extends PortWrap> = { 
    [key in keyof P]: EventEmitter<P[key]>
}

export class EventEmitter<T extends EventWrap, P extends PortWrap = any> {

    private handlers: EventFns<T> = <EventFns<T>>{}

    private ports: Emitters<P> = <Emitters<P>>{}

    public on<EK extends keyof T>(event: EK, fn: TupFunc<T[EK]>): () => void  {
        if(!this.handlers[event]) {
            this.handlers[event] = []
        }

        this.handlers[event].push(fn)
        
        let index = this.handlers[event].indexOf(fn)

        return () => {
            this.handlers[event].splice(index, 1)
        }
    }

    public emit<EK extends keyof T>(event: EK, ...args: T[EK]): this {
        const handlers = this.handlers[event]

        if(handlers) {
            handlers.forEach(handler => {
                handler.apply(event, args)
            })
        }

        return this
    }

    public emitPort<PK extends keyof P, EK extends keyof P[PK]>(port: PK, event: EK, ...args: P[PK][EK]): this {
        const portEmitter = this.ports[port]
        if(portEmitter) {
            portEmitter.emit(event, ...args)
        }
        return this
        
    }
    public onPort<PK extends keyof P, EK extends keyof P[PK]>(port: PK, event: EK, fn:  TupFunc<P[PK][EK]>): () => void {
        if(!this.ports[port]) this.ports[port] = new EventEmitter<P[PK]>()
        const off = this.ports[port].on(event, fn)
        return off
    }

    // public emitChannel(channel: string, event: string, ...args: any) {
    //     return this.emit(bindChannel(channel, event), args)
    // }

    public off<EK extends keyof T>(event: EK, fn?: TupFunc<T[EK]>) {
        const handlers = this.handlers[event]

        if(handlers) {
            if(fn) {
                this.handlers[event] = handlers.filter(handler => handler !== fn)
            }
            else {
                delete this.handlers[event]
            }
        }

        return this
    }

    protected destoryAllListeners() {
        this.handlers = <EventFns<T>>{}
        this.ports = <Emitters<P>>{}
    }
}