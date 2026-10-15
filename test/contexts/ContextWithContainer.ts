import type { FunctionLog } from "../FunctionLog.js"

export interface ContextWithContainer {
    betterJob(name: string): Promise<void>
}

export class TestContextWithContainer implements ContextWithContainer {
    constructor(private readonly _functionLog: FunctionLog, private readonly _connectionString: string) { }

    async betterJob(name: string): Promise<void> {
        this._functionLog.addLog(this.constructor.name, "betterJob", { name, connectionString: this._connectionString })
    }
}

export class NullContextWithContainer implements ContextWithContainer {
    constructor(private readonly _functionLog: FunctionLog) { }

    async betterJob(name: string): Promise<void> {
        this._functionLog.addLog(this.constructor.name, "betterJob", { name })
    }
}

