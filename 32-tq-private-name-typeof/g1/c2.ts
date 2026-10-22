export class C2 {
    #a = 1;
    p = 1;
    test1() {
        class C {
            test1(a: C2): typeof a.#a {
                return 1;
            }
            test2(a: C2): typeof a.p {
                return 1;
            }
        }
        return new C();
    }
}
