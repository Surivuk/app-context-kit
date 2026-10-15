import { beforeAll, describe, expect, test } from "vitest"
import { type ContextDescription, ContextKit, InvalidContextName, MissingContext } from "../src/ContextKit.js";
import { ContextWithContainerDescription } from "./kit/ContextWithContainerDescription.js";
import { BasicContextDescription } from "./kit/BasicContextDescription.js";
import { FunctionLog } from "./FunctionLog.js";
import { unfoldError } from "./kit/unfoldError.js";

class TestError extends Error { }

class TestFunctionError extends Error { }


describe("error handling", () => {

    describe("missing requested context", () => {
        let error: Error | undefined = undefined

        beforeAll(async () => {

            const log = new FunctionLog()

            const descriptions = [
                new BasicContextDescription(log),
                new ContextWithContainerDescription(log)
            ] satisfies readonly ContextDescription[]

            const kit = new ContextKit<typeof descriptions>(descriptions, {
                setup: async () => ({ connectionString: () => "some-random-string" }),
                inUseContexts: ["contextWithContainer"]
            })

            error = await unfoldError(async () => {
                await kit.runScope(async contexts => {
                    await contexts.basicContext.basicAction()
                    await contexts.contextWithContainer.betterJob("some-random-name")
                }, {
                    requiredContexts: ["basicContext"]
                })
            })
        })

        test("should throw an error", () => {
            expect(error).toBeDefined()
        })

        test("should be MissingContext error", () => {
            expect(error).instanceOf(MissingContext)
        })

        test("should contains data", () => {
            const missingContext = error as MissingContext

            expect(missingContext.missingContext).toBe("basicContext")
            expect(missingContext.inUseContexts).toMatchObject(["contextWithContainer"])
        })
    })

    describe("missing requested context - with a customer error (global abroach)", () => {
        let error: Error | undefined = undefined

        beforeAll(async () => {

            const log = new FunctionLog()

            const descriptions = [
                new BasicContextDescription(log),
                new ContextWithContainerDescription(log)
            ] satisfies readonly ContextDescription[]

            const kit = new ContextKit<typeof descriptions>(descriptions, {
                setup: async () => ({ connectionString: () => "some-random-string" }),
                inUseContexts: ["contextWithContainer"],
                missingContextErrorWrapper: (err) => new TestError()
            })

            error = await unfoldError(async () => {
                await kit.runScope(async contexts => {
                    await contexts.basicContext.basicAction()
                    await contexts.contextWithContainer.betterJob("some-random-name")
                }, {
                    requiredContexts: ["basicContext"]
                })
            })
        })

        test("should be TestError error", () => {
            expect(error).instanceOf(TestError)
        })
    })

    describe("missing requested context - with a customer error (local abroach)", () => {
        let error: Error | undefined = undefined

        beforeAll(async () => {

            const log = new FunctionLog()

            const descriptions = [
                new BasicContextDescription(log),
                new ContextWithContainerDescription(log)
            ] satisfies readonly ContextDescription[]

            const kit = new ContextKit<typeof descriptions>(descriptions, {
                setup: async () => ({ connectionString: () => "some-random-string" }),
                inUseContexts: ["contextWithContainer"],
                missingContextErrorWrapper: (err) => new TestError()
            })

            error = await unfoldError(async () => {
                await kit.runScope(async contexts => {
                    await contexts.basicContext.basicAction()
                    await contexts.contextWithContainer.betterJob("some-random-name")
                }, {
                    requiredContexts: ["basicContext"],
                    missingContextErrorWrapper: (err) => new TestFunctionError()
                })
            })
        })

        test("should be TestFunctionError error", () => {
            expect(error).instanceOf(TestFunctionError)
        })
    })

    describe("error in the scope body", () => {
        let error: Error | undefined = undefined

        beforeAll(async () => {
            const log = new FunctionLog()

            const descriptions = [
                new BasicContextDescription(log),
                new ContextWithContainerDescription(log)
            ] satisfies readonly ContextDescription[]

            const kit = new ContextKit<typeof descriptions>(descriptions, {
                setup: async () => ({ connectionString: () => "some-random-string" }),
                inUseContexts: ["contextWithContainer"]
            })

            error = await unfoldError(async () => {
                await kit.runScope(async _ => {
                    throw new Error("FAKE-ERROR")
                })
            })
        })

        test("should throw an error", () => {
            expect(error).toBeDefined()
        })

        test("should be unchanged", () => {
            expect(error?.message).toBe("FAKE-ERROR")
        })
    })

    describe("invalid context name", () => {
        let error: Error | undefined = undefined

        beforeAll(async () => {
            const log = new FunctionLog()

            const descriptions = [
                new BasicContextDescription(log)
            ] satisfies readonly ContextDescription[]

            error = await unfoldError(async () => {
                new ContextKit<typeof descriptions>(descriptions, {
                    inUseContexts: ["some-random-string" as any]
                })
            })
        })

        test("should throw an error", () => {
            expect(error).toBeDefined()
        })

        test("should be InvalidContextName error", () => {
            expect(error).instanceOf(InvalidContextName)
        })
    })

})
