unknownColumn = stringColumn;
export {};

type Bu3ts_0<T> = { [K in keyof T as `p0_${K & string}`]: T[K] extends object ? Bu3ts_0<T[K]> : T[K] };
declare const wu3ts_0: Bu3ts_0<{ a: { b: { c: number, d: string }, e: boolean }, f: 0 }>;
export const qu3ts_0: number = wu3ts_0.p0_a.p0_b.p0_c + 0;
type Bu3ts_1<T> = { [K in keyof T as `p1_${K & string}`]: T[K] extends object ? Bu3ts_1<T[K]> : T[K] };
declare const wu3ts_1: Bu3ts_1<{ a: { b: { c: number, d: string }, e: boolean }, f: 1 }>;
export const qu3ts_1: number = wu3ts_1.p1_a.p1_b.p1_c + 1;
