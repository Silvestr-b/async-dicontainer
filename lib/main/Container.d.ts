import { ResolvedDeps, RequiredModules } from '../';
import { DeclarationBuilder } from './DeclarationBuilder';
import { Context } from './Context';
declare class Container<I extends {
    [P in keyof I]: I[P];
}> {
    private inited;
    private definitions;
    register: <N extends keyof I>(moduleName: N) => DeclarationBuilder<I, N, I[N], {}, {}, {}>;
    get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A, b: B, c: C): Promise<ResolvedDeps<I, RequiredModules<I, A, B, C>>>;
    get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A, b: B): Promise<ResolvedDeps<I, RequiredModules<I, A, B>>>;
    get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A): Promise<I[A]>;
    getSingle<N extends keyof I>(name: N, parentContext?: Context<I>): Promise<I[N]>;
    extend<I2 extends {
        [P in keyof I2]: any;
    }>(container: Container<I2>): Container<I & I2>;
    private getSeveral(modulesNames);
    private init();
    private getDefinition(moduleName);
    private createDeclarationBuilder<N>(moduleName);
    private createDefinition<N>(moduleName);
}
export { Container };
