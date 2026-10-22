export type Foo<T extends "true", B> = { "true": Foo<T, Foo<T, B>> }[T];
export type Alias = Foo<"true", {}>;
