import type { ContextDescription } from "../../src/ContextKit.js";
import type { TestContainer } from "./TestContainer.js";
import { type ContextWithContainer, TestContextWithContainer, NullContextWithContainer } from "../contexts/ContextWithContainer.js";
import type { FunctionLog } from "../FunctionLog.js";


export class ContextWithContainerDescription implements ContextDescription {
    name: "contextWithContainer" = "contextWithContainer";

    constructor(private readonly _functionLog: FunctionLog) { }

    createContext(container: TestContainer): ContextWithContainer {
        return new TestContextWithContainer(this._functionLog, container.connectionString());
    }
    createNullContext(): ContextWithContainer {
        return new NullContextWithContainer(this._functionLog);
    }
}
