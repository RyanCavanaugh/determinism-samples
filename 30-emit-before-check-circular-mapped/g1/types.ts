export interface Widget {
    type: "list";
    each: Child<Widget>;
}
export type NonOptionalKeys<T> = { [P in keyof T]: undefined extends T[P] ? never : P }[keyof T];
export type Child<T> = { [P in NonOptionalKeys<T>]: T[P] }
export type ListChild = Child<Widget>;
