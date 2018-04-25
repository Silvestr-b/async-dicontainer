import { Context } from './Context';
import { DeclarationBuilder } from './DeclarationBuilder';
declare class Definition<I extends {
    [P in keyof I]: I[P];
}> {
    private name;
    private builders;
    private decls;
    constructor(name: keyof I);
    addBuilder(builder: DeclarationBuilder<I>): void;
    init(): void;
    resolve(ctx: Context<I>): Promise<I[keyof I]>;
}
export { Definition };
