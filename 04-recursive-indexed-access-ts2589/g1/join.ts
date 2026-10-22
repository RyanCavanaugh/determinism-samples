import { Recur } from "./recur";
export function join<T>(l: Recur<T>[]): Recur<T> {
    return ['marker', ...l];
}
