export type K<T> = { [P in keyof T]: K<T[P]> }[keyof T] | T;
