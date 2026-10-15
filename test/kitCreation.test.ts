import { describe, expect, test } from "vitest"
import { type ContextDescription, ContextKit } from "../src/ContextKit.js";
import { ContextWithContainerDescription } from "./kit/ContextWithContainerDescription.js";
import { BasicContextDescription } from "./kit/BasicContextDescription.js";
import type { TestContainer } from "./kit/TestContainer.js";
import { FunctionLog } from "./FunctionLog.js";


describe("ContextKit creation", () => {

    test("should create a kit with no container", () => {
        const log = new FunctionLog()
        const descriptions = [
            new BasicContextDescription(log)
        ] satisfies readonly ContextDescription[]

        expect(() => new ContextKit<typeof descriptions>(descriptions, {})).not.toThrow()
    })
    test("should create a kit with a container", () => {
        const log = new FunctionLog()

        const descriptions = [
            new ContextWithContainerDescription(log)
        ] satisfies readonly ContextDescription<TestContainer>[]

        expect(() => new ContextKit<typeof descriptions>(descriptions, {
            setup: async (): Promise<TestContainer> => ({ connectionString: () => "example" })
        })).not.toThrow()
    })
    test("should create a mixed kit", () => {
        const log = new FunctionLog()

        const descriptions = [
            new ContextWithContainerDescription(log),
            new BasicContextDescription(log)
        ] satisfies readonly ContextDescription<TestContainer>[]

        expect(() => new ContextKit<typeof descriptions>(descriptions, {
            setup: async (): Promise<TestContainer> => ({ connectionString: () => "example" })
        })).not.toThrow()
    })

})