import { fun, pipe, id, call, wrap, both, mk, arr } from "./lib";
import * as f0 from "./f0";
import * as f1 from "./f1";
import * as f2 from "./f2";
import * as f4 from "./f4";
export const v0 = fun(x => x, y => f1.v0, 1);
export const v1 = pipe(f2.v0, x => id(x));
