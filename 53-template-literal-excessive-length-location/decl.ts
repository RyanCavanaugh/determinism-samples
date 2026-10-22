type Dec<N extends number> =
    N extends 5 ? 4 : N extends 4 ? 3 : N extends 3 ? 2 :
    N extends 2 ? any :
    N extends 1 ? 0 : 0;
export type Recur<N extends number, S extends string> =
    N extends 0 ? S : Recur<Dec<N>, `${S}_${S}`>;
export type Explode = {
    [P in Recur<5, "a"> as `${P}_key`]: any;
};
