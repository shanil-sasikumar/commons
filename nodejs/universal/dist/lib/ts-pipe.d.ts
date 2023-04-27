export interface PipeContext {
}
export interface PipeUnion<C, T> {
    flow(ctx: C, content?: T): Promise<T>;
}
export declare function pipe<C, T>(...elements: PipeUnion<C, T>[]): PipeUnion<C, T>;
export interface PipeUnionSync<C, T> {
    flow(ctx: C, content?: T): T;
}
export declare function pipeSync<C, T>(...elements: PipeUnionSync<C, T>[]): PipeUnionSync<C, T>;
