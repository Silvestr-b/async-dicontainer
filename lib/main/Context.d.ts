declare class Context<I extends {
    [P in keyof I]: I[P];
}> {
    name: keyof I;
    parent: Context<I> | undefined;
    constructor(name: keyof I, parent?: Context<I> | undefined);
}
export { Context };
