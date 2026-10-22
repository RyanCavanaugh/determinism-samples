declare let a1: Box<string>;
declare let a2: Box<number>;
declare const cond: boolean;
class Box<T> {
    value!: T;
    m() { if (cond) return a1; return a2; }
}
class Box2<T> {
    value!: T;
    n() { if (cond) return new Box2<string>(); return new Box2<number>(); }
    get g() { return cond ? new Box2<boolean>() : new Box2<number>(); }
}
