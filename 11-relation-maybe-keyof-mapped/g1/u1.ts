const w: 1 = h(a);
export {};

type Bu1ts_0<T> = { [K in keyof T as `p0_${K & string}`]: T[K] extends object ? Bu1ts_0<T[K]> : T[K] };
declare const wu1ts_0: Bu1ts_0<{ a: { b: { c: number, d: string }, e: boolean }, f: 0 }>;
export const qu1ts_0: number = wu1ts_0.p0_a.p0_b.p0_c + 0;
type Bu1ts_1<T> = { [K in keyof T as `p1_${K & string}`]: T[K] extends object ? Bu1ts_1<T[K]> : T[K] };
declare const wu1ts_1: Bu1ts_1<{ a: { b: { c: number, d: string }, e: boolean }, f: 1 }>;
export const qu1ts_1: number = wu1ts_1.p1_a.p1_b.p1_c + 1;
