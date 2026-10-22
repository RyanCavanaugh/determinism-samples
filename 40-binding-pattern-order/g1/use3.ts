import { f1, f2, f3, f4, flag } from "./decl";
type P1 = Parameters<typeof f1>[0]; type P2 = Parameters<typeof f2>[0];
type Q1 = Parameters<typeof f3>[0]; type Q2 = Parameters<typeof f4>[0];
declare const x: P1 | P2; declare const y: Q1 | Q2;
export const n1: number = x;
export const n2: number = y;
export const u = flag ? x : y;
export declare const z: P2 | P1;
