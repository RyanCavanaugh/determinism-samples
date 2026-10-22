export declare const c1: { get foo(): typeof c1.foo };
export declare const c2: { set foo(value: typeof c2.foo) };
export declare const c3: { get foo(): string; set foo(value: typeof c3.foo) };
export type T1 = { get foo(): T1['foo'] };
export type T2 = { set foo(value: T2['foo']) };
export type T3 = { get foo(): string; set foo(value: T3['foo']) };
