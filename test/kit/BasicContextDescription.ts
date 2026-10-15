import type { ContextDescription } from "../../src/ContextKit.js";
import { type BasicContext, TestBasicContext, NullBasicContext } from "../contexts/BasicContext.js";
import { FunctionLog } from "../FunctionLog.js";

export class BasicContextDescription implements ContextDescription {
    name: "basicContext" = "basicContext";

    constructor(private readonly _functionLog: FunctionLog) { }

    createContext(): BasicContext {
        return new TestBasicContext(this._functionLog);
    }
    createNullContext(): BasicContext {
        return new NullBasicContext(this._functionLog);
    }
}
