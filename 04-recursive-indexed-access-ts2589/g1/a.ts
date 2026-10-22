import { Recur } from "./recur";
import { join } from "./join";
function a<T>(l: Recur<T>[]): void {
    const x: Recur<T> | undefined = join(l);
}
