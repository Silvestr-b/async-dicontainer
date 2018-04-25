import { RequiredModules, ResolvedDeps, ResourceFetchers } from '../';
import { Container } from './Container';
import { Context } from './Context';
declare class Resolver<INTERFACES extends {
    [P in keyof INTERFACES]: any;
}, NAME extends keyof INTERFACES, RESOLVEDINTERFACE extends INTERFACES[NAME] = INTERFACES[NAME], REQUIREDMODULES extends RequiredModules<INTERFACES> = REQUIREDMODULES, REQUIREDRESOURCES extends object = REQUIREDRESOURCES, RESOLVEDDEPS extends ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES> = ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>> {
    private container;
    private requiredModules;
    private resourceFetchers;
    private resolver;
    private waiters;
    private resolvedDeps;
    constructor(container: Container<INTERFACES>, requiredModules: {
        [P in keyof REQUIREDMODULES]: Promise<REQUIREDMODULES[P]>;
    }, resourceFetchers: ResourceFetchers<REQUIREDRESOURCES>, resolver: (deps: ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>);
    resolve(ctx: Context<INTERFACES>): Promise<RESOLVEDINTERFACE>;
    private fetchDeps(ctx);
    private fetchData();
}
export { Resolver };
