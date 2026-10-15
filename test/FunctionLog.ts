type FunctionLogItem = {
    className: string
    functionName: string
    parameters?: any
}

export class FunctionLog {

    constructor(private readonly _logs: FunctionLogItem[] = []) { }

    addLog(className: string, functionName: string, parameters?: any) {
        this._logs.push({ className, functionName, parameters })

    }

    shift(): FunctionLogItem {
        const log = this._logs.shift()

        if (log === undefined)
            throw new Error("Call log is empty")

        return log
    }

    pop(): FunctionLogItem {
        const log = this._logs.pop()

        if (log === undefined)
            throw new Error("Call log is empty")

        return log
    }

    get length(): number {
        return this._logs.length
    }
}