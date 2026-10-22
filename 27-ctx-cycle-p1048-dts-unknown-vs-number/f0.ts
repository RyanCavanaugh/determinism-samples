import { fun, pipe, id, call, wrap, both, mk, arr } from "./lib";
import * as f1 from "./f1";
import * as f2 from "./f2";
import * as f3 from "./f3";
import * as f4 from "./f4";
export const v0 = fun(x => f4.v0, y => y, 1);
export const v1 = id(id(x => f3.v1));
