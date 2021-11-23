/**
 * @todo
 * 事件队列
 */

export class EventEmitter {
    private handlers: { [key: string]: Function[] } = {}

    public on(event: string, fn: Function): () => void  {
        if(!this.handlers[event]) {
            this.handlers[event] = []
        }

        this.handlers[event].push(fn)
        
        let index = this.handlers[event].indexOf(fn)

        return () => {
            this.handlers[event].splice(index, 1)
        }
    }

    public onChannel(channel: string, event: string, fn: Function) {
        return this.on(bindChannel(channel, event), fn)
    }

    public emitAsync(event: string, ...args: any): this {
        const handlers = this.handlers[event]
        
        let awaitFunc = new Array<Promise<void>>()
        if(handlers) {
            handlers.forEach(handler => {
                awaitFunc.push(new Promise<void>((res) => {
                    handler.apply(this, args)
                    res()
                }))
            })
        }
        Promise.all(awaitFunc)

        return this
    }

    public emit(event: string, ...args: any): this {
        const handlers = this.handlers[event]

        if(handlers) {
            handlers.forEach(handler => {
                handler.apply(event, args)
            })
        }

        return this
    }

    public emitChannel(channel: string, event: string, ...args: any) {
        return this.emit(bindChannel(channel, event), args)
    }

    public off(event: string, fn?: Function) {
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
        this.handlers = {}
    }
}

const bindChannel = (channel: string, event: string) => `${channel}##${event}` 