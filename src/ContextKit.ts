import type { ContextName, ContextsFromDescriptions, ExtractScopeContainer } from "./types.js"

export class MissingContext extends Error {
    constructor(
        public readonly inUseContexts: string[],
        public readonly missingContext: string
    ) {
        super(`Required context is missing. Context: "${missingContext}"`)
    }
}

export class InvalidContextName extends Error {
    constructor(name: string, validNames: string[]) {
        super(`Invalid context name. Name: "${name}". Valid names are ["${validNames.join(", ")}"]`)
    }
}


export interface ContextDescription<ScopeContainer = unknown, Name extends string = string, ContextInterface = unknown> {
    name: Name
    createContext(container: ScopeContainer): ContextInterface
    createNullContext(container: ScopeContainer): ContextInterface
}

interface ContextWorker<Contexts, T> {
    (contexts: Contexts): Promise<T>
}
interface ErrorWrapper {
    (error: MissingContext): Error
}

type SetupFunctions<C> = [unknown] extends [C] ?
    {
        setup?(): Promise<unknown>
        teardown?(): Promise<void>
    } :
    {
        setup(): Promise<C>
        teardown?(container: C): Promise<void>
    }

type KitOptions<Descriptions extends readonly ContextDescription[]> = {
    inUseContexts?: ContextName<Descriptions>[]
    missingContextErrorWrapper?: ErrorWrapper
} & SetupFunctions<ExtractScopeContainer<Descriptions>>

type ScopeOptions<Descriptions extends readonly ContextDescription[]> = {
    requiredContexts?: ContextName<Descriptions>[]
    missingContextErrorWrapper?: ErrorWrapper
}

export class ContextKit<Descriptions extends readonly ContextDescription[]> {

    private _inUsedContexts: Set<ContextName<Descriptions>>

    constructor(
        private readonly _description: Descriptions,
        private readonly _options: KitOptions<Descriptions>
    ) {
        this._inUsedContexts = this.createInUsedContexts(_description, _options?.inUseContexts)
    }

    async runScope<T>(worker: ContextWorker<ContextsFromDescriptions<Descriptions>, T>, scopeOptions?: ScopeOptions<Descriptions>): Promise<T> {
        let errorWrapper: ErrorWrapper | undefined = undefined

        if (this._options.missingContextErrorWrapper !== undefined)
            errorWrapper = this._options.missingContextErrorWrapper
        if (scopeOptions?.missingContextErrorWrapper !== undefined)
            errorWrapper = scopeOptions.missingContextErrorWrapper

        this.checkForRequiredContexts(this._description, scopeOptions?.requiredContexts, errorWrapper)

        const setupFu = this._options?.setup
        const teardownFn = this._options?.teardown

        const container = setupFu !== undefined ? await setupFu() : {} as ExtractScopeContainer<Descriptions>
        const contexts = this.createContexts(this._description, container)

        try {
            const result = await worker(contexts)

            if (teardownFn !== undefined)
                await teardownFn(container)

            return result
        } catch (error) {
            throw error
        }
    }
    isContextInUse(name: ContextName<Descriptions>): boolean {
        return this._inUsedContexts.has(name)
    }
    isContextsInUse(nameList: ContextName<Descriptions>[]): boolean {
        for (const name of nameList)
            if (!this._inUsedContexts.has(name)) return false

        return true
    }
    get inUsedContexts(): ContextName<Descriptions>[] {
        return [...this._inUsedContexts]
    }


    private createContexts(descriptions: Descriptions, container?: ExtractScopeContainer<Descriptions>): ContextsFromDescriptions<Descriptions> {
        let contexts: { [key: string]: any } = {}

        for (const d of descriptions) {
            const newContext = this._inUsedContexts.has(d.name) ? d.createContext(container) : d.createNullContext(container)
            contexts = { ...contexts, [d.name]: newContext }
        }

        return contexts as ContextsFromDescriptions<Descriptions>
    }
    private createInUsedContexts(descriptions: Descriptions, inUseContexts: ContextName<Descriptions>[] | undefined = undefined): Set<ContextName<Descriptions>> {
        const allowedNames: ContextName<Descriptions>[] = []

        for (const d of descriptions)
            allowedNames.push(d.name)

        if (inUseContexts === undefined) return new Set(allowedNames)

        for (const name of inUseContexts)
            if (!allowedNames.includes(name))
                throw new InvalidContextName(name, allowedNames)

        return new Set(inUseContexts)
    }
    private checkForRequiredContexts(descriptions: Descriptions, requiredContexts?: ContextName<Descriptions>[], errorWrapper?: ErrorWrapper) {
        if (requiredContexts === undefined) return
        for (const d of descriptions) {
            if (!requiredContexts.includes(d.name)) continue
            if (!this._inUsedContexts.has(d.name)) {
                const error = new MissingContext(Array.from(this._inUsedContexts.values()), d.name)

                throw errorWrapper !== undefined ? errorWrapper(error) : error
            }
        }
    }
}