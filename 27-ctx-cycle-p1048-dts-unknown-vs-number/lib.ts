export declare function fun<T>(g: (x: T) => T, h: (y: T) => T, x: T): T;
export declare function pipe<A, B>(a: A, f: (a: A) => B): B;
export declare function id<T>(x: T): T;
export declare function call<T>(f: () => T): T;
export declare function wrap<T>(x: T): { v: T };
export declare function both<T, U>(f: (t: T) => U, g: (u: U) => T): [T, U];
export declare function mk<T extends { a: unknown }>(f: (x: T) => T): T;
export declare const arr: { map<U>(f: (x: number) => U): U[] };
