import type { ContextDescription } from "./ContextKit.js";

type ToSingle<T> = T extends ContextDescription ? { [K in T['name']]: ReturnType<T['createContext']> } : never
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type ContextsFromDescriptions<T extends readonly ContextDescription[]> = UnionToIntersection<ToSingle<T[number]>>
export type ContextName<T extends readonly ContextDescription[]> = T[number]["name"]
export type ExtractScopeContainer<C> = C extends ContextDescription<infer D, any, any>[] ? D : never;