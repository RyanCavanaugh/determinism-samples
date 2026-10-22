export type A<T extends string> = B<T> | C<T>;
export type B<T extends string> = T extends "x" ? A<T> : [A<number>];
export type C<T extends string> = D<T>[keyof D<T>];
export type D<T extends string> = { [K in T]: C<number> | A<K> };
