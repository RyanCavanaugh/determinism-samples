b2 = b1;
a2 = a1;
export {};

type Bu4ts_0<T> = { [K in keyof T as `p0_${K & string}`]: T[K] extends object ? Bu4ts_0<T[K]> : T[K] };
declare const wu4ts_0: Bu4ts_0<{ a: { b: { c: number, d: string }, e: boolean }, f: 0 }>;
export const qu4ts_0: number = wu4ts_0.p0_a.p0_b.p0_c + 0;
type Bu4ts_1<T> = { [K in keyof T as `p1_${K & string}`]: T[K] extends object ? Bu4ts_1<T[K]> : T[K] };
declare const wu4ts_1: Bu4ts_1<{ a: { b: { c: number, d: string }, e: boolean }, f: 1 }>;
export const qu4ts_1: number = wu4ts_1.p1_a.p1_b.p1_c + 1;
