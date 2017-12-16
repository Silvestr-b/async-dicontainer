import { Declaration } from './Declaration'
import { Context } from './Context'
import { ResolvedDeps } from './ResolvedDeps'
import { Container } from './Container'
import { RequiredDeps } from './RequiredDeps'
import { RequiredData } from './RequiredData'
import { DataResolvers } from './DataResolvers'


class DeclarationBuilder<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   NAME extends keyof TYPES = NAME,
   RESOLVEDINTERFACE extends INTERFACES[NAME] = INTERFACES[NAME],
   REQUIREDDEPS extends RequiredDeps<INTERFACES, TYPES> = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA> = ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>> {

   private _deps: REQUIREDDEPS = <REQUIREDDEPS>{};
   private _dataResolvers: DataResolvers<REQUIREDDATA> = <DataResolvers<REQUIREDDATA>>{};
   private _asSingleton: boolean = false;
   private _resolver: (deps: RESOLVEDDEPS) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>;
   private _when: (context: Context<INTERFACES, TYPES>) => boolean;
   private _whenParent: (parent: Context<INTERFACES, TYPES>) => boolean;
   

   constructor(
      private container: Container<INTERFACES, TYPES>,
      private name: NAME
   ) { }

   getRDeps(): REQUIREDDATA {
      return <REQUIREDDATA>{}
   }

   // Deps Variants
   deps<
      _T1 extends keyof TYPES,
      _T2 extends keyof TYPES,
      _T3 extends keyof TYPES
      >(a: _T1, b: _T2, c: _T3): DeclarationBuilder<
      INTERFACES,
      TYPES,
      NAME,
      RESOLVEDINTERFACE,
      RequiredDeps<INTERFACES, TYPES, _T1, _T2, _T3>,
      REQUIREDDATA,
      ResolvedDeps<INTERFACES, TYPES, RequiredDeps<INTERFACES, TYPES, _T1, _T2, _T3>>>;

   deps<
      _T1 extends keyof TYPES,
      _T2 extends keyof TYPES
      >(a: _T1, b: _T2): DeclarationBuilder<
      INTERFACES,
      TYPES,
      NAME,
      RESOLVEDINTERFACE,
      RequiredDeps<INTERFACES, TYPES, _T1, _T2>,
      REQUIREDDATA,
      ResolvedDeps<INTERFACES, TYPES, RequiredDeps<INTERFACES, TYPES, _T1, _T2>>>;

   deps<
      _T1 extends keyof TYPES
      >(a: _T1): DeclarationBuilder<
      INTERFACES,
      TYPES,
      NAME,
      RESOLVEDINTERFACE,
      RequiredDeps<INTERFACES, TYPES, _T1>,
      REQUIREDDATA,
      ResolvedDeps<INTERFACES, TYPES, RequiredDeps<INTERFACES, TYPES, _T1>>>;

   // Default
   deps<_T1 extends keyof TYPES, _T2 extends keyof TYPES, _T3 extends keyof TYPES>(a: _T1, b?: _T2, c?: _T3): any {
      this._deps = <REQUIREDDEPS>{};
      for (let i = 0; i < arguments.length; i++) {
         this._deps[arguments[i]] = arguments[i]
      }
      return this
   }

   resolver(cb: (deps: RESOLVEDDEPS) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>) {
      this._resolver = cb
      return this
   }

   when(cb: (context: Context<INTERFACES, TYPES>) => boolean) {
      this._when = cb
      return this
   }

   whenParent(cb: (parent: Context<INTERFACES, TYPES>) => boolean) {
      this._whenParent = cb
      return this
   }

   require<_DATANAME extends string, _RESOLVEDDATA>(name: _DATANAME, cb: () => _RESOLVEDDATA | Promise<_RESOLVEDDATA>): DeclarationBuilder<
      INTERFACES,
      TYPES,
      NAME,
      RESOLVEDINTERFACE,
      REQUIREDDEPS,
      RequiredData<_DATANAME, _RESOLVEDDATA, REQUIREDDATA>,
      ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, RequiredData<_DATANAME, _RESOLVEDDATA, REQUIREDDATA>>> {
      (<any>this._dataResolvers)[name] = cb;
      return <any>this
   }

   asSingleton() {
      this._asSingleton = true
      return this
   }

   getDeclaration() {
      return new Declaration<INTERFACES, TYPES, NAME, RESOLVEDINTERFACE, REQUIREDDEPS, REQUIREDDATA, RESOLVEDDEPS>(
         this.container,
         this.name,
         this._deps,
         this._dataResolvers,
         this._resolver,
         this._when || null,
         this._whenParent || null,
         this._asSingleton
      )
   }
}


export { DeclarationBuilder }




// class A<T1,T2> {
//    constructor(
//       public a?: T1,
//       public b?: T2
//    ){}
//    deps<_T1,_T2=T2>(a: _T1, b?: _T2){
//       if(a && b){
//          return new A<_T1,_T2>(a,b)
//       } else if(a){
//          return new A<_T1,_T2>(a)
//       }
//       throw ""
//    }
// }
// const a = new A();
// let q = a.deps(3,'4').deps(null)







// class Example<R extends object> {

//    require<AN extends string, AR>(name: AN, cb: () => Promise<AR>): Example<Extended<R, AN, AR>> {
//       return <any>this
//    }

//    getResult() {
//       return <R>{}
//    }
// }

// const container = new Example();

// const Cat = container
//    .require('Dog', () => import('./tests/Dog').then(m => m.Dog))
//    .require('Cat', () => import('./tests/Cat').then(m => m.Cat))
//    .require('Sheep', () => import('./tests/Sheep').then(m => m.Sheep))
//    .getResult().Sheep

// const s = new Cat('d').baa








// async<A>(dataLoaders: [() => Promise<A>]): DeclarationBuilder<I, T, N, DD, DataTypes<A>>;
// async<A, B>(dataLoaders: [() => Promise<A>, () => Promise<B>]): DeclarationBuilder<I, T, N, DD, DataTypes<A, B>>;
// async<A, B, C>(dataLoaders: [() => Promise<A>, () => Promise<B>, () => Promise<C>]): DeclarationBuilder<I, T, N, DD, DataTypes<A, B, C>>;
// async<A, B, C>(dataLoaders: any): any {
//    return this
// }

// class Example<
//    ADN extends any[],
//    ADR extends any[]
//    > {

//    async<
//       AN extends string,
//       BN extends string,
//       AR,
//       BR>(an: AN, ar: () => Promise<AR>, bn: BN, br: () => Promise<BR>): Example<[AN, BN], [AR, BR]> {
//       return this
//    }

//    getResult() {
//       return <{
//          [P in ADN[0]]: ADR[0]
//       } & {
//             [P in ADN[1]]: ADR[1]
//          }>{}
//    }
// }

// const container = new Example();

// const Cat = container
//    .async(
//    'Dog', () => import('./tests/Dog').then(m => m.Dog),
//    'Cat', () => import('./tests/Cat').then(m => m.Cat)
//    )
//    .getResult().Cat
