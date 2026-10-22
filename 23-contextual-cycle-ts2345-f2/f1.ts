import { fun, pipe, id, call, wrap, both, mk, arr } from "./lib";
import * as f0 from "./f0";
import * as f2 from "./f2";
import * as f3 from "./f3";
export const v0 = both(x => f3.v0, y => 1);
export const v1 = pipe(f0.v0, x => [x]);
