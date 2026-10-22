interface Store<T> { value: T; listener: Listener<T>; }
type Listener<T> = (batch: Store<T[]>) => void;
interface ColumnDef<Row, Value = unknown> { cell?: (column: Column<Row, Value>) => void; }
interface Column<Row, Value = unknown> { accessorFn?: (row: Row) => Value; columnDef: ColumnDef<Row, Value>; }
interface Tree<T> { readonly value: T; readonly children: readonly Tree<T>[]; readonly metadata: Map<string, number>; }
interface Outer<T> { value: T; next: Inner<Outer<T>>; }
interface Inner<T> { consume: (value: T) => void; }
interface GenericMethod<T> { value: T; next: <U>(value: U) => GenericMethod<T>; }
interface Method<T> { value: T; accept(value: Method<T>): void; }
interface Projected<T extends { value: unknown }> { value: T["value"]; next: Projected<T>; }
declare let strings: Store<string>; declare let unknowns: Store<unknown>;
declare let stringListener: Listener<string>; declare let unknownListener: Listener<unknown>;
declare let stringColumn: ColumnDef<{ name: string }, string>; declare let unknownColumn: ColumnDef<{ name: string }, unknown>;
declare let stringTree: Tree<string>; declare let unknownTree: Tree<unknown>;
declare let os: Outer<string>, ou: Outer<unknown>;
declare let gs: GenericMethod<string>, gu: GenericMethod<unknown>;
declare let ms: Method<string>, mu: Method<unknown>;
declare let projected: Projected<{ value: string; extra: number }>;
