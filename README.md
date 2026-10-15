# app-context-kit

A lightweight tool that helps you compose modular applications in a type-safe way.

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

## License
This project is licensed under the [MIT License](LICENSE).