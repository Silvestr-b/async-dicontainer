import { RequiredDeps, ResolvedDeps, DataFetchers, RequiredData } from '../'
import { Declaration } from './Declaration'
import { Context } from './Context'
import { Container } from './Container'


class DeclarationBuilder<
   INTERFACES extends {[P in keyof INTERFACES]: any},
   NAME extends keyof INTERFACES = NAME,
   RESOLVEDINTERFACE extends INTERFACES[NAME] = INTERFACES[NAME],
   REQUIREDDEPS extends RequiredDeps<INTERFACES> = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, REQUIREDDEPS, REQUIREDDATA> = ResolvedDeps<INTERFACES, REQUIREDDEPS, REQUIREDDATA>> {

   private _deps: REQUIREDDEPS = <REQUIREDDEPS>{};
   private _dataResolvers: DataFetchers<REQUIREDDATA> = <DataFetchers<REQUIREDDATA>>{};
   private _asSingleton: boolean = false;
   private _when: ((context: Context<INTERFACES>) => boolean)[] = [];
   private _whenParent: ((parent: Context<INTERFACES>) => boolean)[] = [];
   private _resolver: (deps: RESOLVEDDEPS) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>;
   

   constructor(
      private container: Container<INTERFACES>,
      private name: NAME
   ) { }


   // Deps Variants
   deps<
      _T1 extends keyof INTERFACES,
      _T2 extends keyof INTERFACES,
      _T3 extends keyof INTERFACES
      >(a: _T1, b: _T2, c: _T3): DeclarationBuilder<
      INTERFACES,
      NAME,
      RESOLVEDINTERFACE,
      RequiredDeps<INTERFACES, _T1, _T2, _T3>,
      REQUIREDDATA,
      ResolvedDeps<INTERFACES, RequiredDeps<INTERFACES, _T1, _T2, _T3>>>;

   deps<
      _T1 extends keyof INTERFACES,
      _T2 extends keyof INTERFACES
      >(a: _T1, b: _T2): DeclarationBuilder<
      INTERFACES,
      NAME,
      RESOLVEDINTERFACE,
      RequiredDeps<INTERFACES, _T1, _T2>,
      REQUIREDDATA,
      ResolvedDeps<INTERFACES, RequiredDeps<INTERFACES, _T1, _T2>>>;

   deps<
      _T1 extends keyof INTERFACES
      >(a: _T1): DeclarationBuilder<
      INTERFACES,
      NAME,
      RESOLVEDINTERFACE,
      RequiredDeps<INTERFACES, _T1>,
      REQUIREDDATA,
      ResolvedDeps<INTERFACES, RequiredDeps<INTERFACES, _T1>>>;

   // Default
   deps<_T1 extends keyof INTERFACES, _T2 extends keyof INTERFACES, _T3 extends keyof INTERFACES>(a: _T1, b?: _T2, c?: _T3): any {
      for (let i = 0; i < arguments.length; i++) {
         const name = arguments[i];
         
         if((<any>this._dataResolvers)[name]){
            throw new Error(`Duplicate dependency name with required data name: ${name}`)
         } 
         this._deps[name] = name
      }
      return this
   }

   resolver(cb: (deps: RESOLVEDDEPS) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>) {
      if(this._resolver){
         throw new Error(`Duplicate resolver declaration for module: ${this.name}`)
      }
      this._resolver = cb
      return this
   }

   when(cb: (context: Context<INTERFACES>) => boolean) {
      this._when.push(cb)
      return this
   }

   whenParent(cb: (parent: Context<INTERFACES>) => boolean) {
      this._whenParent.push(cb)
      return this
   }

   require<_DATANAME extends string, _RESOLVEDDATA>(name: _DATANAME, cb: () => _RESOLVEDDATA | Promise<_RESOLVEDDATA>): DeclarationBuilder<
      INTERFACES,
      NAME,
      RESOLVEDINTERFACE,
      REQUIREDDEPS,
      RequiredData<_DATANAME, _RESOLVEDDATA, REQUIREDDATA>,
      ResolvedDeps<INTERFACES, REQUIREDDEPS, RequiredData<_DATANAME, _RESOLVEDDATA, REQUIREDDATA>>> {
      if((<any>this._dataResolvers)[name]){
         throw new Error(`Duplicate required data name: ${name}`)
      } 
      if((<any>this._deps)[name]){
         throw new Error(`Duplicate required data name with dependency name: ${name}`)
      }   
      (<any>this._dataResolvers)[name] = cb;
      return <any>this
   }

   asSingleton() {
      this._asSingleton = true
      return this
   }

   getDeclaration() {
      if(!this._resolver){
         throw new Error(`Resolver is not defined for module: ${this.name}`)
      }
      return new Declaration<INTERFACES, NAME, RESOLVEDINTERFACE, REQUIREDDEPS, REQUIREDDATA, RESOLVEDDEPS>(
         this.container,
         this.name,
         this._deps,
         this._dataResolvers,
         this._resolver,
         this._when,
         this._whenParent,
         this._asSingleton
      )
   }
}


export { DeclarationBuilder }