export function f1({ x, y }) { const a: string = x; const b: string = y; }
export function f2({ x, y = 0 }) { const a: string = x; const b: string = y; }
export function f3({ x = 0, y = 0 }) { const a: string = x; const b: string = y; }
export function f4({ x, y } = { x: 0, y: 0 }) { const a: string = x; const b: string = y; }
export function f5({ x, y = 0 } = { x: 0 }) { const a: string = x; const b: string = y; }
export function f6({ x = 0, y = 0 } = {}) { const a: string = x; const b: string = y; }
export function f7({ a: { x = 0, y = 0 } } = { a: {} }) { const a: string = x; const b: string = y; }
export function g1([x, y]) { const a: string = x; const b: string = y; }
export function g2([x = 0, y = 0]) { const a: string = x; const b: string = y; }
export function g3([x, y] = [0, 0]) { const a: string = x; const b: string = y; }
export function g4([x, y = 0] = [0]) { const a: string = x; const b: string = y; }
export function g5([x = 0, y = 0] = []) { const a: string = x; const b: string = y; }
