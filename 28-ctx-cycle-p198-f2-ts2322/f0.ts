import { fun, pipe, id, call, wrap, both, mk, arr } from "./lib";
import * as f1 from "./f1";
import * as f2 from "./f2";
import * as f3 from "./f3";
export const v0 = pipe(f3.v1, x => id(x));
export const v1 = mk(x => ({ a: f1.v0 }));
