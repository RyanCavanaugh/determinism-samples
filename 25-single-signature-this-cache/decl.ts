export declare const EffectTypeId: unique symbol;

export interface Variance<out A, out E, out R> {
  readonly [EffectTypeId]: VarianceStruct<A, E, R>;
}

export type Covariant<A> = (_: never) => A;

export interface VarianceStruct<out A, out E, out R> {
  readonly _V: string;
  readonly _A: Covariant<A>;
  readonly _E: Covariant<E>;
  readonly _R: Covariant<R>;
}

export interface Effect<out A, out E = never, out R = never>
  extends Variance<A, E, R> {}

export declare const succeed: <A>(value: A) => Effect<A>;

export type F<X, Y> = Y extends { _type: infer Z }
  ? X extends Effect<infer A, infer E, infer R>
    ? Effect<A, E, R | Z>
    : X
  : X;

export type ProxyMap<Service> = {
  [K in keyof Service]: (Service & { _type: Service })[K];
};

export declare const implement: <T>() => <I extends ReadonlyArray<any>, X>(
  x: (...i: I) => X,
) => (...i: I) => F<X, T>;

export class XXX {
  log = implement<this>()(<N extends number>(n: N) => succeed(n));
}


export declare const inner: XXX;
export declare const outer: ProxyMap<XXX>;

