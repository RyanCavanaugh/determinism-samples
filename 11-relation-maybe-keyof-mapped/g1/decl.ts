interface A { next: A; v: "a" }
interface B { next: B; v: string }
type M<T> = { [K in keyof T as B]: 1 };
declare const a: A;
declare function h(x: B): 1;
declare function h(x: unknown): 2;
function f<T>() {
    function g(x: keyof M<T>): 1;
    function g(x: unknown): 2;
    function g(x: unknown) { return 1 as any; }
    const r: 1 = g(a);
}
