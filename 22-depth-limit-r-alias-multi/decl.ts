export declare function rec<N extends 0[]>(n?: N): N["length"] extends 60 ? never : ReturnType<typeof rec<[...N, 0]>> | N["length"];
export type R<N extends 0[]> = N["length"] extends 60 ? never : R<[...N, 0]> | N["length"];
export type Id<T> = T extends infer U ? U : never;
