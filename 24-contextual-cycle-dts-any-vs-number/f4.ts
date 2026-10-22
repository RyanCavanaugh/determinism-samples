import { fun, pipe, id, call, wrap, both, mk, arr } from "./lib";
import * as f0 from "./f0";
import * as f1 from "./f1";
import * as f2 from "./f2";
import * as f3 from "./f3";
export const v0 = (Math.random() < 0.5 ? (x: number) => f1.v0 : (x: number) => 1);
export const v1 = fun(x => x, y => f0.v1, 1);
