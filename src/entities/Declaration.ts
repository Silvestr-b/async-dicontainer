import { RequiredDeps, ResolvedDeps, DataFetchers } from '../'
import { Context } from './Context'
import { Container } from './Container'
import { SyncPromise } from 'syncasync'
import { Resolver } from './Resolver'


class Declaration<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   NAME extends keyof TYPES,
   RESOLVEDINTERFACE extends INTERFACES[NAME]= INTERFACES[NAME],
   REQUIREDDEPS extends RequiredDeps<INTERFACES, TYPES> = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA> = ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>> {

   private cache: Promise<RESOLVEDINTERFACE>;

   constructor(
      private container: Container<INTERFACES, TYPES>,
      private name: NAME,
      private deps: REQUIREDDEPS,
      private dataFetchers: DataFetchers<REQUIREDDATA>,
      private resolver: (deps: ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
      private when: ((context: Context<INTERFACES, TYPES>) => boolean)[],
      private whenParent: ((parent: Context<INTERFACES, TYPES>) => boolean)[],
      private asSingleton: boolean
   ) { }

   getName(): NAME {
      return this.name
   }

   isDefault() {
      return this.when.length <= 0 && this.when.length <= 0
   }

   match(ctx: Context<INTERFACES, TYPES>) {
      for(let i=0; i<this.when.length; i++){
         if(!this.when[i](ctx)){
            return false
         };
      }

      for(let i=0; i<this.whenParent.length; i++){
         if(!ctx.parent || !this.whenParent[i](ctx.parent)){
            return false
         };
      }

      return true
   }

   resolve(ctx: Context<INTERFACES, TYPES>) {
      return this.asSingleton ? this.resolveSingleton(ctx) : this.resolveInstance(ctx)
   }

   private resolveInstance(ctx: Context<INTERFACES, TYPES>) {
      return this.createResolver(ctx).resolve();
   }

   private resolveSingleton(ctx: Context<INTERFACES, TYPES>) {
      return this.cache ? this.cache : this.cache = this.resolveInstance(ctx)
   }

   private createResolver(ctx: Context<INTERFACES, TYPES>) {
      const depsWaiters = <any>{};

      for (let depName in this.deps) {
         depsWaiters[depName] = this.container.getSingle(this.deps[depName], ctx);
      }

      return new Resolver<INTERFACES, TYPES, NAME>(depsWaiters, this.dataFetchers, this.resolver);
   }
}


export { Declaration }