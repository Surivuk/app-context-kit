# app-context-kit

![Logo](/doc/app-context-kit.png)


## When to use it
- When you want to combine multiple modules into a single, unified application.

- When you want to create different application flavors.
    + For example, suppose your application consists of modules A, B, and C. You want to create two flavors: one that includes modules A and B, and another that includes modules A and C.

- When you need to implement authorization or access control, or a similar mechanism.

## Installation

```bash

```

## Quick start

```ts

```

## Usage

> Note: context = module = unit of encapsulation in the application

Container Kit is designed in a way that can easily be applied on top of your existing code. It provides a simple interface that allows you to hook existing modules into Context Kit.

- **ContextKit** - the main container  
- **ContextDescription** - the main interface that describes your module and its **null** version
- **InvalidContextName** - error occurs when there is any invalid context name
- **MissingContext** - error that occurs when the required context is missing in the container

Context Kit uses the null pattern approach to mask missing modules/contexts.

```ts
class IdentityDescription implements ContextDescription {

    // the name that determines how the context will be referenced later in the app
    // await contexts.identity.createUser(id, name, email)
    name: "identity" = "identity";

    constructor(private readonly _dependency: Dependency) { }

    createContext(container: ScopeContainer): Identity {
        // this._dependency -> contains static dependencies like db connections
        // container -> contains the scope dependencies like UNIT OF WORK, something that is meant to be per scope execution
        // create new Identity
    }
    createNullContext(container: ScopeContainer): Identity {
        // create the null representation of the context
        // if the context is not required in the application, this object will be called
    }
}
```

```ts
    // include all contexts that are available in the application
    const descriptions = [
        new IdentityDescription(dependency),
        new NotificationDescription(dependency)
    ] satisfies readonly ContextDescription[]


    const kit = new ContextKit<typeof descriptions>(
        descriptions,
        {
            // determine which context will be used inside the kit
            // if "inUseContexts" is undefined, the kit will use all contexts
            inUseContexts: ["identity", "notification"],
            setup: async () => {
                // setup scope
                // for example, create a new unit of work for the scope
                // return a new dependency container
            },
            teardown: async (container: ScopeContainer) => {
                // teardown scope
                // for example, commit all changes inside the unit of work
            },
            // option to wrap the "Missing Context" error with a custom error at the kit level
            // each time the "Missing Context" error should be thrown, the custom error will be thrown instead
            missingContextErrorWrapper: (error: MissingContext) => {
                // return customer error
            }
        }
    )

    // somewhere in the application
    // in some HTTP controller
    await kit.runScope(async contexts => {
        await contexts.identity.createUser(id, name, email)
        await contexts.notification.sendEmail(email, "WELCOME_TEMPLATE")
    }, {
        // determine which contexts are required for the run
        // if required context is missing, a "MissingContext" error will be thrown 
        requiredContexts: ["identity"],
        // option to wrap the "Missing Context" error with a custom error only for the run
        missingContextErrorWrapper: (error: MissingContext) => {
            // return customer error
        }
    })
```

## License
This project is licensed under the [MIT License](LICENSE).