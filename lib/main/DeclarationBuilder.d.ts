import { RequiredModules, ResolvedDeps, RequiredResources } from '../';
import { Declaration } from './Declaration';
import { Context } from './Context';
import { Container } from './Container';
declare class DeclarationBuilder<INTERFACES extends {
    [P in keyof INTERFACES]: any;
}, NAME extends keyof INTERFACES = NAME, RESOLVEDINTERFACE extends INTERFACES[NAME] = INTERFACES[NAME], REQUIREDMODULES extends RequiredModules<INTERFACES> = REQUIREDMODULES, REQUIREDRESOURCES extends object = REQUIREDRESOURCES, RESOLVEDDEPS extends ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES> = ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>> {
    private container;
    private name;
    private _requiredModules;
    private _resourceFethers;
    private _asSingleton;
    private _when;
    private _whenParent;
    private _resolver;
    constructor(container: Container<INTERFACES>, name: NAME);
    deps<_T1 extends keyof INTERFACES, _T2 extends keyof INTERFACES, _T3 extends keyof INTERFACES>(a: _T1, b: _T2, c: _T3): DeclarationBuilder<INTERFACES, NAME, RESOLVEDINTERFACE, RequiredModules<INTERFACES, _T1, _T2, _T3>, REQUIREDRESOURCES, ResolvedDeps<INTERFACES, RequiredModules<INTERFACES, _T1, _T2, _T3>>>;
    deps<_T1 extends keyof INTERFACES, _T2 extends keyof INTERFACES>(a: _T1, b: _T2): DeclarationBuilder<INTERFACES, NAME, RESOLVEDINTERFACE, RequiredModules<INTERFACES, _T1, _T2>, REQUIREDRESOURCES, ResolvedDeps<INTERFACES, RequiredModules<INTERFACES, _T1, _T2>>>;
    deps<_T1 extends keyof INTERFACES>(a: _T1): DeclarationBuilder<INTERFACES, NAME, RESOLVEDINTERFACE, RequiredModules<INTERFACES, _T1>, REQUIREDRESOURCES, ResolvedDeps<INTERFACES, RequiredModules<INTERFACES, _T1>>>;
    resolver(cb: (deps: RESOLVEDDEPS) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>): this;
    when(cb: (context: Context<INTERFACES>) => boolean): this;
    whenParent(cb: (parent: Context<INTERFACES>) => boolean): this;
    require<_DATANAME extends string, _RESOLVEDDATA>(name: _DATANAME, cb: () => _RESOLVEDDATA | Promise<_RESOLVEDDATA>): DeclarationBuilder<INTERFACES, NAME, RESOLVEDINTERFACE, REQUIREDMODULES, RequiredResources<_DATANAME, _RESOLVEDDATA, REQUIREDRESOURCES>, ResolvedDeps<INTERFACES, REQUIREDMODULES, RequiredResources<_DATANAME, _RESOLVEDDATA, REQUIREDRESOURCES>>>;
    asSingleton(): this;
    getDeclaration(): Declaration<INTERFACES, NAME, RESOLVEDINTERFACE, REQUIREDMODULES, REQUIREDRESOURCES, RESOLVEDDEPS>;
}
export { DeclarationBuilder };
