type A<T> = { m0: (x: B<T>) => void; m1: { [K in keyof T]: B<T[K]> } };
type B<T> = { m0: A<T> };
declare let a1: A<{ a: string }>, a2: A<{ a: "lit" }>;
declare let b1: B<{ a: string }>, b2: B<{ a: "lit" }>;
