export type Deep<N extends 0[]> = N["length"] extends 60 ? never : Deep<[...N, 0]> | N["length"];
export type Z = Deep<[]>;
