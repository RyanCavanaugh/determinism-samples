export type Recur<T> =
    (T extends  (unknown[]) ? {} : { [K in keyof T]?: Recur<T[K]>}) |
    [...Recur<T>[number][]];
