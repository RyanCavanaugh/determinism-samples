interface A { a: string }
interface B { foo: string }
declare function pick(x: Foo<number>): A;
declare function pick(x: object): B;
class Bar<T> {
    x!: T;
    Value = pick(new Foo(this)).foo;
}
class Foo<T> {
    bar!: Bar<T>;
    constructor(bar: Bar<T>) { this.bar = bar; }
}
