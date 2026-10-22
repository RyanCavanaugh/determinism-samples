unknownTree = stringTree; stringTree = unknownTree;
export {};

type Bu5ts_0<T> = { [K in keyof T as `p0_${K & string}`]: T[K] extends object ? Bu5ts_0<T[K]> : T[K] };
declare const wu5ts_0: Bu5ts_0<{ a: { b: { c: number, d: string }, e: boolean }, f: 0 }>;
export const qu5ts_0: number = wu5ts_0.p0_a.p0_b.p0_c + 0;
type Bu5ts_1<T> = { [K in keyof T as `p1_${K & string}`]: T[K] extends object ? Bu5ts_1<T[K]> : T[K] };
declare const wu5ts_1: Bu5ts_1<{ a: { b: { c: number, d: string }, e: boolean }, f: 1 }>;
export const qu5ts_1: number = wu5ts_1.p1_a.p1_b.p1_c + 1;
