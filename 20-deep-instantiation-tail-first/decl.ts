export type D = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type K = `${D}${D}${D}`;
export type Wide2<N extends 0[], I> = N["length"] extends 6 ? I : { [J in K]: Wide2<[...N, 0], [J, I][0]> }[K];
export type Deep<N extends 0[]> = N["length"] extends 60 ? never : Deep<[...N, 0]> | N["length"];
