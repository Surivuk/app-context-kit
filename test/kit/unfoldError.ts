export async function unfoldError(fn: () => Promise<void>): Promise<Error | undefined> {
    try {
        await fn()
    } catch (error) {
        return error as Error
    }
}