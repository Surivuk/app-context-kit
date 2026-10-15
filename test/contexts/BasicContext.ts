import type { FunctionLog } from "../FunctionLog.js"

export interface BasicContext {
    basicAction(): Promise<void>
}

export class TestBasicContext implements BasicContext {

    constructor(private readonly _functionLog: FunctionLog) { }

    async basicAction(): Promise<void> {
        this._functionLog.addLog(this.constructor.name, "basicAction")
    }
}

export class NullBasicContext implements BasicContext {

    constructor(private readonly _functionLog: FunctionLog) { }

    async basicAction(): Promise<void> {
        this._functionLog.addLog(this.constructor.name, "basicAction")
    }
}

