import { RequiredModules, ResolvedDeps, ResourceFetchers } from '../';
import { Context } from './Context';
import { Container } from './Container';
declare class Declaration<INTERFACES extends {
    [P in keyof INTERFACES]: any;
}, NAME extends keyof INTERFACES, RESOLVEDINTERFACE extends INTERFACES[NAME] = INTERFACES[NAME], REQUIREDMODULES extends RequiredModules<INTERFACES> = REQUIREDMODULES, REQUIREDRESOURCES extends object = REQUIREDRESOURCES, RESOLVEDDEPS extends ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES> = ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>> {
    private container;
    private name;
    private requiredModules;
    private resourceFetchers;
    private resolver;
    private when;
    private whenParent;
    private asSingleton;
    private cache?;
    constructor(container: Container<INTERFACES>, name: NAME, requiredModules: REQUIREDMODULES, resourceFetchers: ResourceFetchers<REQUIREDRESOURCES>, resolver: (deps: ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>, when: ((context: Context<INTERFACES>) => boolean)[], whenParent: ((parent: Context<INTERFACES>) => boolean)[], asSingleton: boolean);
    getName(): NAME;
    isDefault(): boolean;
    match(ctx: Context<INTERFACES>): boolean;
    resolve(ctx: Context<INTERFACES>): Promise<INTERFACES[NAME]>;
    private resolveInstance(ctx);
    private resolveSingleton(ctx);
}
export { Declaration };
