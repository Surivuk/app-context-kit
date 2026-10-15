import { describe, expect, test } from "vitest"
import { type ContextDescription, ContextKit } from "../src/ContextKit.js";
import { ContextWithContainerDescription } from "./kit/ContextWithContainerDescription.js";
import { BasicContextDescription } from "./kit/BasicContextDescription.js";
import { FunctionLog } from "./FunctionLog.js";


describe("Examples", () => {

    test("example #1", async () => {
        const log = new FunctionLog()

        const descriptions = [
            new BasicContextDescription(log)
        ] satisfies readonly ContextDescription[]

        const kit = new ContextKit<typeof descriptions>(descriptions, {})

        await kit.runScope(async contexts => {
            await contexts.basicContext.basicAction()
        })

        const log1 = log.shift()

        expect(log1.className).toBe("TestBasicContext")
        expect(log1.functionName).toBe("basicAction")
        expect(log1.parameters).toBeUndefined()

        expect(log.length).toBe(0)
    })

    test("example #2", async () => {
        const log = new FunctionLog()

        const descriptions = [
            new BasicContextDescription(log)
        ] satisfies readonly ContextDescription[]

        const kit = new ContextKit<typeof descriptions>(descriptions, {
            setup: async () => log.addLog("SCOPE", "setup"),
            teardown: async () => log.addLog("SCOPE", "teardown")
        })

        await kit.runScope(async contexts => {
            await contexts.basicContext.basicAction()
        })

        let l = log.shift()
        expect(l.className).toBe("SCOPE")
        expect(l.functionName).toBe("setup")
        expect(l.parameters).toBeUndefined()

        l = log.shift()
        expect(l.className).toBe("TestBasicContext")
        expect(l.functionName).toBe("basicAction")
        expect(l.parameters).toBeUndefined()

        l = log.shift()
        expect(l.className).toBe("SCOPE")
        expect(l.functionName).toBe("teardown")
        expect(l.parameters).toBeUndefined()

        expect(log.length).toBe(0)
    })

    test("example #3", async () => {
        const log = new FunctionLog()

        const descriptions = [
            new ContextWithContainerDescription(log)
        ] satisfies readonly ContextDescription[]

        const kit = new ContextKit<typeof descriptions>(descriptions, {
            setup: async () => ({ connectionString: () => "some-random-string" })
        })

        await kit.runScope(async contexts => {
            await contexts.contextWithContainer.betterJob("some-random-name")
        })

        let l = log.pop()
        expect(l.className).toBe("TestContextWithContainer")
        expect(l.functionName).toBe("betterJob")
        expect(l.parameters).toMatchObject({ name: "some-random-name", connectionString: "some-random-string" })

        expect(log.length).toBe(0)
    })

    test("example #4", async () => {
        const log = new FunctionLog()

        const descriptions = [
            new BasicContextDescription(log),
            new ContextWithContainerDescription(log)
        ] satisfies readonly ContextDescription[]

        const kit = new ContextKit<typeof descriptions>(descriptions, {
            setup: async () => ({ connectionString: () => "some-random-string" }),
            inUseContexts: ["basicContext"]
        })

        await kit.runScope(async contexts => {
            await contexts.basicContext.basicAction()
            await contexts.contextWithContainer.betterJob("some-random-name")
        }, {
            requiredContexts: ["basicContext"]
        })

        let l = log.shift()
        expect(l.className).toBe("TestBasicContext")
        expect(l.functionName).toBe("basicAction")
        expect(l.parameters).toBeUndefined()

        l = log.shift()
        expect(l.className).toBe("NullContextWithContainer")
        expect(l.functionName).toBe("betterJob")
        expect(l.parameters).toMatchObject({ name: "some-random-name" })

        expect(log.length).toBe(0)
    })

    test("example #5", async () => {
        const log = new FunctionLog()

        const descriptions = [
            new BasicContextDescription(log),
            new ContextWithContainerDescription(log)
        ] satisfies readonly ContextDescription[]

        const kit = new ContextKit<typeof descriptions>(descriptions, {
            setup: async () => ({ connectionString: () => "some-random-string" }),
            inUseContexts: ["contextWithContainer"]
        })

        expect(kit.isContextInUse("contextWithContainer")).toBe(true)
        expect(kit.isContextInUse("basicContext")).toBe(false)
        expect(kit.isContextsInUse(["contextWithContainer"])).toBe(true)
        expect(kit.isContextsInUse(["basicContext", "contextWithContainer"])).toBe(false)
        expect(kit.inUsedContexts).toMatchObject(["contextWithContainer"])
    })

})